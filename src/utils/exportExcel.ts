import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import {
  agruparPorGrado,
  emocionesPredominantes,
  analisisPorPregunta,
  detectarAlumnosRiesgo,
} from './dashboard.utils'

// ─── Helpers de estilo ────────────────────────────────────────────────────────

const COLOR = {
  azulOscuro:   '1F3864',
  azulMedio:    '2E75B6',
  azulClaro:    'BDD7EE',
  verdeOscuro:  '375623',
  verdeMedio:   '70AD47',
  verdeClaro:   'E2EFDA',
  naranjaOscuro:'843C0C',
  naranjaMedio: 'ED7D31',
  naranjaClaro: 'FCE4D6',
  rojoOscuro:   '9C0006',
  rojoClaro:    'FFC7CE',
  amarilloClaro:'FFEB9C',
  grisClaro:    'F2F2F2',
  grisMedio:    'D9D9D9',
  blanco:       'FFFFFF',
}

function headerCell(
  ws: ExcelJS.Worksheet,
  celda: string,
  valor: string,
  colorFondo: string = COLOR.azulOscuro,
  colorTexto: string = COLOR.blanco,
  bold = true,
  fontSize = 11,
) {
  const c = ws.getCell(celda)
  c.value = valor
  c.font = { bold, color: { argb: colorTexto }, name: 'Arial', size: fontSize }
  c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colorFondo } }
  c.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
  c.border = {
    top:    { style: 'thin', color: { argb: COLOR.grisMedio } },
    bottom: { style: 'thin', color: { argb: COLOR.grisMedio } },
    left:   { style: 'thin', color: { argb: COLOR.grisMedio } },
    right:  { style: 'thin', color: { argb: COLOR.grisMedio } },
  }
}

function dataCell(
  ws: ExcelJS.Worksheet,
  celda: string,
  valor: any,
  colorFondo?: string,
  bold = false,
  horizontal: 'left' | 'center' | 'right' = 'left',
) {
  const c = ws.getCell(celda)
  c.value = valor
  c.font = { bold, name: 'Arial', size: 10, color: { argb: '000000' } }
  if (colorFondo) c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colorFondo } }
  c.alignment = { horizontal, vertical: 'middle', wrapText: true }
  c.border = {
    top:    { style: 'hair', color: { argb: COLOR.grisMedio } },
    bottom: { style: 'hair', color: { argb: COLOR.grisMedio } },
    left:   { style: 'hair', color: { argb: COLOR.grisMedio } },
    right:  { style: 'hair', color: { argb: COLOR.grisMedio } },
  }
}

// ─── Utilidades de datos ──────────────────────────────────────────────────────

type PreguntaMeta = {
  id: number
  texto: string
  nivel: string
  orden: number
}

function nivelLegible(nivel: string): string {
  if (nivel === "inicial") return "Inicial"
  if (nivel === "primaria_1_2") return "Primaria 1°-2°"
  if (nivel === "primaria_3_4") return "Primaria 3°-4°"
  if (nivel === "primaria_5_6") return "Primaria 5°-6°"
  return nivel || "Sin nivel"
}

function ordenarPorNivelYOrden(a: PreguntaMeta, b: PreguntaMeta): number {
  const prioridadNivel: Record<string, number> = {
    inicial: 0,
    primaria_1_2: 1,
    primaria_3_4: 2,
    primaria_5_6: 3,
  }
  const pa = prioridadNivel[a.nivel] ?? 99
  const pb = prioridadNivel[b.nivel] ?? 99
  if (pa !== pb) return pa - pb
  if (a.orden !== b.orden) return a.orden - b.orden
  return a.id - b.id
}

function extraerPreguntasOrdenadas(data: any[]): PreguntaMeta[] {
  const mapa = new Map<number, PreguntaMeta>()
  data.forEach((item) => {
    const id = Number(item.pregunta_id)
    if (!Number.isFinite(id)) return
    if (mapa.has(id)) return
    mapa.set(id, {
      id,
      texto: item.preguntas?.texto || `Pregunta ${id}`,
      nivel: item.preguntas?.nivel || "sin_nivel",
      orden: Number(item.preguntas?.orden) || 9999,
    })
  })
  return Array.from(mapa.values()).sort(ordenarPorNivelYOrden)
}

/** Convierte el campo respuesta a string legible */
function respuestaStr(r: any): string {
  if (r === null || r === undefined) return ''
  if (typeof r === 'string') return r
  if (Array.isArray(r)) return r.join(', ')
  if (typeof r === 'object') return JSON.stringify(r)
  return String(r)
}

/** Extrae datos planos de cada respuesta individual */
function aplanarRespuestas(data: any[]): {
  nombre: string
  apellido: string
  grado: string
  seccion: string
  pregunta_id: number
  pregunta_numero: number
  pregunta_texto: string
  nivel: string
  tipo: string
  respuesta: string
}[] {
  const preguntas = extraerPreguntasOrdenadas(data)
  const indicePregunta = new Map<number, number>()
  preguntas.forEach((p, idx) => indicePregunta.set(p.id, idx + 1))

  return data.map(item => {
    const est = Array.isArray(item.estudiantes) ? item.estudiantes[0] : item.estudiantes
    const pid = Number(item.pregunta_id)
    return {
      nombre:         est?.nombres    || '—',
      apellido:       est?.apellidos  || '—',
      grado:          est?.grado != null ? String(est.grado) : '—',
      seccion:        est?.seccion    || '—',
      pregunta_id:    pid,
      pregunta_numero: indicePregunta.get(pid) ?? 0,
      pregunta_texto: item.preguntas?.texto || `Pregunta ${pid}`,
      nivel: nivelLegible(item.preguntas?.nivel || ""),
      tipo:           item.tipo       || '—',
      respuesta:      respuestaStr(item.respuesta),
    }
  })
}

/** Construye perfil de alumno: { estudiante_id, nombre, apellido, grado, seccion, respuestas: { [pid]: string } } */
function perfilesAlumnos(data: any[]) {
  const mapa: Record<string, {
    nombre: string; apellido: string; grado: string; seccion: string
    respuestas: Record<number, string>
  }> = {}
  data.forEach(item => {
    const id = item.estudiante_id
    if (!id) return
    const est = Array.isArray(item.estudiantes) ? item.estudiantes[0] : item.estudiantes
    if (!mapa[id]) {
      mapa[id] = {
        nombre:    est?.nombres    || '—',
        apellido:  est?.apellidos  || '—',
        grado:     est?.grado != null ? String(est.grado) : '—',
        seccion:   est?.seccion    || '—',
        respuestas: {},
      }
    }
    mapa[id].respuestas[item.pregunta_id] = respuestaStr(item.respuesta)
  })
  return Object.entries(mapa).map(([id, v]) => ({ estudiante_id: id, ...v }))
    .sort((a, b) => `${a.apellido}${a.nombre}`.localeCompare(`${b.apellido}${b.nombre}`))
}

// ─── EXPORTAR ─────────────────────────────────────────────────────────────────

export const exportarDashboardExcel = async (dataFiltrada: any[]) => {
  const workbook = new ExcelJS.Workbook()
  workbook.creator  = 'Sistema Tutorial'
  workbook.created  = new Date()
  workbook.modified = new Date()

  const ahora = new Date().toISOString().slice(0, 10)
  const fechaHoy = new Date().toLocaleDateString('es-PE', {
    day: '2-digit', month: 'long', year: 'numeric'
  })

  const alumnos = perfilesAlumnos(dataFiltrada)
  const totalAlumnos = alumnos.length
  const totalRespuestas = dataFiltrada.length
  const grados = agruparPorGrado(dataFiltrada)
  const secciones = Array.from(
    dataFiltrada.reduce((m, item) => {
      const sec = String(item.estudiantes?.seccion ?? 'Sin sección')
      m.set(sec, (m.get(sec) ?? 0) + 1)
      return m
    }, new Map<string, number>())
  ).map(([name, value]) => ({ name, value }))
  const emociones = emocionesPredominantes(dataFiltrada)
  const riesgo = detectarAlumnosRiesgo(dataFiltrada)

  // Hoja 1: Resumen ejecutivo
  const wsResumen = workbook.addWorksheet('Resumen')
  wsResumen.columns = [
    { header: 'Indicador', key: 'indicador', width: 42 },
    { header: 'Valor', key: 'valor', width: 20 },
  ]
  wsResumen.getRow(1).font = { bold: true, color: { argb: COLOR.blanco } }
  wsResumen.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR.azulOscuro } }
  wsResumen.addRow({ indicador: 'Fecha de generación', valor: fechaHoy })
  wsResumen.addRow({ indicador: 'Total de estudiantes (únicos)', valor: totalAlumnos })
  wsResumen.addRow({ indicador: 'Total de respuestas', valor: totalRespuestas })
  wsResumen.addRow({ indicador: 'Alumnos en riesgo', valor: riesgo.length })
  wsResumen.addRow({ indicador: 'Emoción más reportada', valor: emociones[0]?.name ?? 'Sin datos' })
  wsResumen.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }]

  // Hoja 2: Indicadores listos para gráficos
  const wsIndicadores = workbook.addWorksheet('Indicadores')
  wsIndicadores.columns = [
    { header: 'Métrica', key: 'metrica', width: 24 },
    { header: 'Categoría', key: 'categoria', width: 40 },
    { header: 'Valor', key: 'valor', width: 12 },
    { header: 'Porcentaje', key: 'porcentaje', width: 14 },
  ]
  wsIndicadores.getRow(1).font = { bold: true, color: { argb: COLOR.blanco } }
  wsIndicadores.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR.verdeOscuro } }
  const agregarIndicadores = (metrica: string, filas: { name: string; value: number }[]) => {
    const total = filas.reduce((acc, f) => acc + f.value, 0)
    filas.forEach((f) => {
      const pct = total > 0 ? Number(((f.value / total) * 100).toFixed(2)) : 0
      wsIndicadores.addRow({ metrica, categoria: f.name, valor: f.value, porcentaje: pct })
    })
  }
  agregarIndicadores('Respuestas por grado', grados)
  agregarIndicadores('Respuestas por sección', secciones)
  agregarIndicadores('Emociones predominantes', emociones)
  wsIndicadores.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }]

  // Hoja 3: Frecuencias por pregunta/respuesta (compacta)
  const wsFrecuencias = workbook.addWorksheet('Frecuencias')
  wsFrecuencias.columns = [
    { header: 'Pregunta', key: 'pregunta', width: 54 },
    { header: 'Respuesta', key: 'respuesta', width: 36 },
    { header: 'Frecuencia', key: 'frecuencia', width: 12 },
    { header: 'Porcentaje', key: 'porcentaje', width: 14 },
  ]
  wsFrecuencias.getRow(1).font = { bold: true, color: { argb: COLOR.blanco } }
  wsFrecuencias.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR.naranjaOscuro } }
  const analisis = analisisPorPregunta(dataFiltrada)
  analisis.forEach((preg: any) => {
    const opciones = Object.entries(preg.respuestas ?? {})
      .map(([respuesta, frecuencia]) => ({ respuesta, frecuencia: Number(frecuencia) || 0 }))
      .sort((a, b) => b.frecuencia - a.frecuencia)
    const total = opciones.reduce((acc, op) => acc + op.frecuencia, 0)
    opciones.forEach((op) => {
      const pct = total > 0 ? Number(((op.frecuencia / total) * 100).toFixed(2)) : 0
      wsFrecuencias.addRow({
        pregunta: preg.pregunta,
        respuesta: op.respuesta,
        frecuencia: op.frecuencia,
        porcentaje: pct,
      })
    })
  })
  wsFrecuencias.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }]

  // Hoja 4: Riesgo resumido
  const wsRiesgo = workbook.addWorksheet('Riesgo')
  wsRiesgo.columns = [
    { header: 'Apellidos', key: 'apellidos', width: 24 },
    { header: 'Nombres', key: 'nombres', width: 24 },
    { header: 'Grado', key: 'grado', width: 10 },
    { header: 'Sección', key: 'seccion', width: 12 },
    { header: 'Puntaje (0-20)', key: 'score', width: 16 },
    { header: 'Nivel de riesgo', key: 'riesgo', width: 18 },
  ]
  wsRiesgo.getRow(1).font = { bold: true, color: { argb: COLOR.blanco } }
  wsRiesgo.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR.rojoOscuro } }
  riesgo.forEach((a: any) => {
    wsRiesgo.addRow({
      apellidos: a.apellidos ?? '',
      nombres: a.nombres ?? '',
      grado: a.grado === '0' ? 'Inicial' : a.grado,
      seccion: a.seccion ?? '',
      score: a.score ?? 0,
      riesgo: a.riesgo ?? 'Bajo',
    })
  })
  wsRiesgo.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }]

  // Hoja 5: Base limpia (para crear gráficos o tablas dinámicas)
  const wsBase = workbook.addWorksheet('Base respuestas')
  wsBase.columns = [
    { header: 'Fecha', key: 'fecha', width: 16 },
    { header: 'Estudiante ID', key: 'estudiante_id', width: 34 },
    { header: 'Nombres', key: 'nombre', width: 20 },
    { header: 'Apellidos', key: 'apellido', width: 22 },
    { header: 'Grado', key: 'grado', width: 10 },
    { header: 'Sección', key: 'seccion', width: 12 },
    { header: 'Nivel', key: 'nivel', width: 20 },
    { header: 'N° Pregunta', key: 'pregunta_numero', width: 12 },
    { header: 'Código Pregunta', key: 'pregunta_id', width: 14 },
    { header: 'Tipo Pregunta', key: 'tipo', width: 14 },
    { header: 'Pregunta', key: 'pregunta_texto', width: 52 },
    { header: 'Respuesta', key: 'respuesta', width: 36 },
  ]
  wsBase.getRow(1).font = { bold: true, color: { argb: COLOR.blanco } }
  wsBase.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '404040' } }

  const planas = aplanarRespuestas(dataFiltrada)
  planas.forEach((r, idx) => {
    const itemOriginal = dataFiltrada[idx]
    wsBase.addRow({
      fecha: itemOriginal?.fecha ? String(itemOriginal.fecha).slice(0, 10) : '',
      estudiante_id: itemOriginal?.estudiante_id ?? '',
      nombre: r.nombre,
      apellido: r.apellido,
      grado: r.grado === '0' ? 'Inicial' : r.grado,
      seccion: r.seccion,
      nivel: r.nivel,
      pregunta_numero: r.pregunta_numero,
      pregunta_id: r.pregunta_id,
      tipo: itemOriginal?.preguntas?.tipo ?? '—',
      pregunta_texto: r.pregunta_texto,
      respuesta: r.respuesta,
    })
  })
  wsBase.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: 12 } }
  wsBase.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }]

  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  saveAs(blob, `Dashboard_Refactor_${ahora}.xlsx`)
}
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

/** Devuelve el nombre de texto de una pregunta dado su ID (basado en preguntas.ts).
 *  Ajusta este mapeo si tu preguntas.ts tiene otro contenido. */
const ETIQUETAS_PREGUNTA: Record<number, string> = {
  1:  '¿Cómo te sientes en la escuela?',
  2:  '¿Cómo te llevas con tus compañeros?',
  3:  '¿Cómo te llevas con tus profesores?',
  4:  '¿Tienes amigos en la escuela?',
  5:  '¿Te gusta aprender?',
  6:  '¿Cómo te sientes en casa?',
  7:  '¿Tienes alguien con quien hablar cuando tienes problemas?',
  8:  '¿Cómo es tu rendimiento académico?',
  9:  '¿Has vivido alguna situación difícil?',
  10: '¿Cómo defines tu estado emocional?',
}

function etiquetaPregunta(id: number): string {
  return ETIQUETAS_PREGUNTA[id] ?? `Pregunta ${id}`
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
  pregunta_texto: string
  tipo: string
  respuesta: string
}[] {
  return data.map(item => {
    const est = Array.isArray(item.estudiantes) ? item.estudiantes[0] : item.estudiantes
    return {
      nombre:         est?.nombres    || '—',
      apellido:       est?.apellidos  || '—',
      grado:          est?.grado != null ? String(est.grado) : '—',
      seccion:        est?.seccion    || '—',
      pregunta_id:    item.pregunta_id,
      pregunta_texto: etiquetaPregunta(item.pregunta_id),
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

  const fechaHoy = new Date().toLocaleDateString('es-PE', {
    day: '2-digit', month: 'long', year: 'numeric'
  })
  const ahora = new Date().toISOString().slice(0, 10)

  // ══════════════════════════════════════════════════════════════════════════
  // HOJA 0 — PORTADA / RESUMEN EJECUTIVO
  // ══════════════════════════════════════════════════════════════════════════
  const wsPortada = workbook.addWorksheet('📋 Resumen Ejecutivo')
  wsPortada.getColumn('A').width = 5
  wsPortada.getColumn('B').width = 32
  wsPortada.getColumn('C').width = 22
  wsPortada.getColumn('D').width = 22
  wsPortada.getColumn('E').width = 22
  wsPortada.getColumn('F').width = 5

  // Banda de título
  wsPortada.mergeCells('B2:E2')
  const tituloCell = wsPortada.getCell('B2')
  tituloCell.value = 'INFORME DE PLAN TUTORIAL — CUESTIONARIO SOCIOEMOCIONAL'
  tituloCell.font = { bold: true, size: 16, name: 'Arial', color: { argb: COLOR.blanco } }
  tituloCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR.azulOscuro } }
  tituloCell.alignment = { horizontal: 'center', vertical: 'middle' }
  wsPortada.getRow(2).height = 36

  wsPortada.mergeCells('B3:E3')
  const subtituloCell = wsPortada.getCell('B3')
  subtituloCell.value = `Fecha de generación: ${fechaHoy}`
  subtituloCell.font = { size: 11, name: 'Arial', color: { argb: COLOR.blanco } }
  subtituloCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR.azulMedio } }
  subtituloCell.alignment = { horizontal: 'center', vertical: 'middle' }
  wsPortada.getRow(3).height = 22

  wsPortada.getRow(4).height = 14 // espacio

  // ── Totales generales ──
  const alumnos = perfilesAlumnos(dataFiltrada)
  const grados  = agruparPorGrado(dataFiltrada)
  const totalAlumnos = alumnos.length
  const totalRespuestas = dataFiltrada.length
  const alumnosRiesgo = detectarAlumnosRiesgo(dataFiltrada)
  const emociones = emocionesPredominantes(dataFiltrada)

  const kpis: [string, string | number, string][] = [
    ['Total de estudiantes',   totalAlumnos,            COLOR.azulClaro],
    ['Total de respuestas',    totalRespuestas,          COLOR.azulClaro],
    ['Alumnos en riesgo (1-20)', alumnosRiesgo.length,  COLOR.naranjaClaro],
    ['Emoción predominante',   emociones[0]?.name ?? '—', COLOR.verdeClaro],
    ['Grados participantes',   grados.length,           COLOR.azulClaro],
  ]

  kpis.forEach(([label, valor, color], i) => {
    const row = 5 + i
    wsPortada.mergeCells(`B${row}:C${row}`)
    dataCell(wsPortada, `B${row}`, label,  color, true)
    wsPortada.mergeCells(`D${row}:E${row}`)
    dataCell(wsPortada, `D${row}`, valor,  COLOR.blanco, true, 'center')
    wsPortada.getRow(row).height = 22
  })

  wsPortada.getRow(10).height = 14

  // ── Tabla de participación por grado ──
  wsPortada.mergeCells('B11:E11')
  headerCell(wsPortada, 'B11', 'PARTICIPACIÓN POR GRADO', COLOR.azulMedio)
  wsPortada.getRow(11).height = 20

  headerCell(wsPortada, 'B12', 'Grado', COLOR.azulOscuro)
  headerCell(wsPortada, 'C12', 'N° Respuestas', COLOR.azulOscuro)
  headerCell(wsPortada, 'D12', '% del Total', COLOR.azulOscuro)
  headerCell(wsPortada, 'E12', 'Nivel', COLOR.azulOscuro)
  wsPortada.getRow(12).height = 18

  grados.forEach((g, i) => {
    const row = 13 + i
    const pct = totalRespuestas > 0 ? ((g.value / totalRespuestas) * 100).toFixed(1) + '%' : '0%'
    const nivel = Number(g.name) === 0 ? 'Inicial'
                : Number(g.name) <= 6   ? 'Primaria'
                : 'Secundaria'
    const bg = i % 2 === 0 ? COLOR.grisClaro : COLOR.blanco
    dataCell(wsPortada, `B${row}`, `${g.name}° grado`, bg, true, 'center')
    dataCell(wsPortada, `C${row}`, g.value,             bg, false, 'center')
    dataCell(wsPortada, `D${row}`, pct,                 bg, false, 'center')
    dataCell(wsPortada, `E${row}`, nivel,               bg, false, 'center')
    wsPortada.getRow(row).height = 18
  })

  // ══════════════════════════════════════════════════════════════════════════
  // HOJA 1 — PERFILES POR ALUMNO (para Plan Tutorial individual)
  // ══════════════════════════════════════════════════════════════════════════
  const wsPerfiles = workbook.addWorksheet('👤 Perfiles por Alumno')

  // Obtener IDs de preguntas únicas
  const pidsSet = new Set<number>()
  dataFiltrada.forEach(d => pidsSet.add(d.pregunta_id))
  const pids = Array.from(pidsSet).sort((a, b) => a - b)

  // Encabezados
  const colsBase = ['Apellidos', 'Nombres', 'Grado', 'Sección']
  const colsPreg = pids.map(p => `P${p}`)
  const allCols  = [...colsBase, ...colsPreg, 'Observación Tutorial']

  wsPerfiles.columns = allCols.map((h, i) => ({
    header: h,
    key:    `col_${i}`,
    width:  i < 4 ? 22 : i === allCols.length - 1 ? 40 : 28,
  }))

  // Fila de etiquetas de preguntas (segunda fila de encabezado)
  const filaEtiqueta = wsPerfiles.getRow(2)
  colsBase.forEach((_, ci) => {
    const c = filaEtiqueta.getCell(ci + 1)
    c.value = ''
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR.azulOscuro } }
  })
  pids.forEach((pid, ci) => {
    const c = filaEtiqueta.getCell(colsBase.length + ci + 1)
    c.value = etiquetaPregunta(pid)
    c.font = { italic: true, size: 9, name: 'Arial', color: { argb: COLOR.azulOscuro } }
    c.alignment = { wrapText: true, vertical: 'top' }
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR.azulClaro } }
  })
  filaEtiqueta.height = 50

  // Encabezado fila 1
  const filaEncabezado = wsPerfiles.getRow(1)
  allCols.forEach((h, ci) => {
    const c = filaEncabezado.getCell(ci + 1)
    c.value = h
    c.font = { bold: true, name: 'Arial', size: 10, color: { argb: COLOR.blanco } }
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR.azulOscuro } }
    c.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
    c.border = {
      top:    { style: 'thin', color: { argb: COLOR.grisMedio } },
      bottom: { style: 'thin', color: { argb: COLOR.grisMedio } },
      left:   { style: 'thin', color: { argb: COLOR.grisMedio } },
      right:  { style: 'thin', color: { argb: COLOR.grisMedio } },
    }
  })
  filaEncabezado.height = 22

  // Datos
  alumnos.forEach((a, idx) => {
    const fila = wsPerfiles.getRow(3 + idx)
    const bg = idx % 2 === 0 ? COLOR.grisClaro : COLOR.blanco
    const vals = [
      a.apellido,
      a.nombre,
      a.grado,
      a.seccion,
      ...pids.map(p => a.respuestas[p] ?? ''),
      '', // columna observación tutorial (vacía para rellenar)
    ]
    vals.forEach((v, ci) => {
      const c = fila.getCell(ci + 1)
      c.value = (v ?? '') as any
      c.font = { name: 'Arial', size: 10 }
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } }
      c.alignment = { wrapText: true, vertical: 'top' }
      c.border = {
        top:    { style: 'hair', color: { argb: COLOR.grisMedio } },
        bottom: { style: 'hair', color: { argb: COLOR.grisMedio } },
        left:   { style: 'hair', color: { argb: COLOR.grisMedio } },
        right:  { style: 'hair', color: { argb: COLOR.grisMedio } },
      }
    })
    fila.height = 18
  })

  wsPerfiles.views = [{ state: 'frozen', xSplit: 4, ySplit: 2 }]

  // ══════════════════════════════════════════════════════════════════════════
  // HOJA 2 — ALUMNOS EN RIESGO
  // ══════════════════════════════════════════════════════════════════════════
  const wsRiesgo = workbook.addWorksheet('⚠️ Alumnos en Riesgo')
  wsRiesgo.columns = [
    { header: 'N°',        key: 'num',      width: 6 },
    { header: 'Apellidos', key: 'apellido', width: 22 },
    { header: 'Nombres',   key: 'nombre',   width: 22 },
    { header: 'Grado',     key: 'grado',    width: 10 },
    { header: 'Sección',   key: 'seccion',  width: 12 },
    { header: 'Indicadores de Alerta',       key: 'alertas',     width: 45 },
    { header: 'Nivel de Atención',           key: 'nivel',       width: 18 },
    { header: 'Acción Tutorial Sugerida',    key: 'accion',      width: 45 },
    { header: 'Seguimiento / Avance',        key: 'seguimiento', width: 40 },
  ]

  // Encabezado
  const hRiesgo = wsRiesgo.getRow(1)
  wsRiesgo.columns.forEach((col, ci) => {
    const c = hRiesgo.getCell(ci + 1)
    c.value = Array.isArray(col.header)
  ? col.header.join(" ")
  : col.header ?? ""
    c.font  = { bold: true, name: 'Arial', size: 10, color: { argb: COLOR.blanco } }
    c.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR.rojoOscuro } }
    c.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
    c.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } }
  })
  hRiesgo.height = 22

  alumnosRiesgo.forEach((a: any, idx: number) => {
    const fila = wsRiesgo.getRow(2 + idx)
    const nivelStr = (a.puntajeRiesgo ?? 0) >= 3 ? 'URGENTE' : 'MODERADO'
    const accion   = nivelStr === 'URGENTE'
      ? 'Entrevista individual inmediata + derivación a psicología'
      : 'Seguimiento semanal en tutoría + comunicación con familia'
    const alertasStr = Array.isArray(a.alertas)
      ? a.alertas.join(' | ')
      : (a.alertas ?? 'Ver respuestas')
    const bg = idx % 2 === 0 ? COLOR.rojoClaro : COLOR.blanco

    const vals = [idx + 1, a.apellidos ?? a.apellido ?? '—', a.nombres ?? a.nombre ?? '—',
                  a.grado, a.seccion, alertasStr, nivelStr, accion, '']
    vals.forEach((v, ci) => {
      const c = fila.getCell(ci + 1)
      c.value = (v ?? '') as any
      c.font  = { name: 'Arial', size: 10, bold: ci === 6 && nivelStr === 'URGENTE' }
      c.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: ci === 6 && nivelStr === 'URGENTE' ? COLOR.rojoClaro : bg } }
      c.alignment = { wrapText: true, vertical: 'top' }
      c.border = { top: { style: 'hair' }, bottom: { style: 'hair' }, left: { style: 'hair' }, right: { style: 'hair' } }
    })
    fila.height = 20
  })

  if (alumnosRiesgo.length === 0) {
    wsRiesgo.getRow(2).getCell(1).value = '✅ No se detectaron alumnos en situación de riesgo con los filtros actuales.'
    wsRiesgo.mergeCells('A2:I2')
    wsRiesgo.getRow(2).getCell(1).font = { name: 'Arial', size: 11, color: { argb: COLOR.verdeOscuro } }
    wsRiesgo.getRow(2).height = 24
  }

  wsRiesgo.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }]

  // ══════════════════════════════════════════════════════════════════════════
  // HOJA 3 — ANÁLISIS POR PREGUNTA (frecuencias)
  // ══════════════════════════════════════════════════════════════════════════
  const wsPreguntas = workbook.addWorksheet('📊 Análisis por Pregunta')
  wsPreguntas.columns = [
    { header: 'Pregunta ID',   key: 'pid',        width: 14 },
    { header: 'Texto',         key: 'texto',       width: 45 },
    { header: 'Respuesta',     key: 'respuesta',   width: 30 },
    { header: 'Frecuencia',    key: 'frecuencia',  width: 14 },
    { header: '% del Total',   key: 'porcentaje',  width: 14 },
    { header: 'Interpretación Tutorial', key: 'interpretacion', width: 40 },
  ]

  const hPreg = wsPreguntas.getRow(1)
  wsPreguntas.columns.forEach((col, ci) => {
    const c = hPreg.getCell(ci + 1)
    c.value = Array.isArray(col.header)
  ? col.header.join(" ")
  : col.header ?? ""
    c.font  = { bold: true, name: 'Arial', size: 10, color: { argb: COLOR.blanco } }
    c.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR.verdeOscuro } }
    c.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
    c.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } }
  })
  hPreg.height = 22

  const analisis = analisisPorPregunta(dataFiltrada)
  let filaActual = 2

analisis.forEach((preg: any, pregIdx: number) => {
    const respuestasObj: Record<string, number> = preg.respuestas ?? {}
    const opciones: { label: string; count: number }[] = Object.entries(respuestasObj)
      .map(([label, count]) => ({ label, count: count as number }))
      .sort((a, b) => b.count - a.count)

    const total = opciones.reduce((acc, op) => acc + op.count, 0)

    opciones.forEach((op, oi) => {
      const fila = wsPreguntas.getRow(filaActual)
      const pct  = total > 0 ? ((op.count / total) * 100).toFixed(1) + '%' : '0%'
      const bg   = oi === 0 ? COLOR.verdeClaro : (filaActual % 2 === 0 ? COLOR.grisClaro : COLOR.blanco)

      const vals = [
        oi === 0 ? pregIdx + 1 : '',
        oi === 0 ? preg.pregunta : '',
        op.label,
        op.count,
        pct,
        '', // interpretación libre para el tutor
      ]
      vals.forEach((v, ci) => {
        const c = fila.getCell(ci + 1)
        c.value = (v ?? '') as any
        c.font  = { name: 'Arial', size: 10, bold: oi === 0 && ci < 2 }
        c.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } }
        c.alignment = { wrapText: true, vertical: 'top' }
        c.border = { top: { style: 'hair' }, bottom: { style: 'hair' }, left: { style: 'hair' }, right: { style: 'hair' } }
      })
      fila.height = 18
      filaActual++
    })

    // Línea separadora entre preguntas
    const sep = wsPreguntas.getRow(filaActual)
    for (let ci = 1; ci <= 6; ci++) {
      sep.getCell(ci).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR.grisMedio } }
    }
    sep.height = 4
    filaActual++
  })

  wsPreguntas.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }]

  // ══════════════════════════════════════════════════════════════════════════
  // HOJA GRÁFICO — DISTRIBUCIÓN VISUAL (barras en celdas)
  // ══════════════════════════════════════════════════════════════════════════
  const wsGrafico = workbook.addWorksheet('📈 Gráficos')
  wsGrafico.getColumn('A').width = 3
  wsGrafico.getColumn('B').width = 26   // etiqueta
  wsGrafico.getColumn('C').width = 50   // barra visual
  wsGrafico.getColumn('D').width = 12   // valor
  wsGrafico.getColumn('E').width = 12   // porcentaje
  wsGrafico.getColumn('F').width = 3

  // ── Paleta de colores para barras ──
  const PALETA_BARRAS = [
    COLOR.azulMedio,    // 2E75B6
    COLOR.verdeMedio,   // 70AD47
    COLOR.naranjaMedio, // ED7D31
    'C55A11',           // naranja quemado
    '7030A0',           // morado
    'C00000',           // rojo oscuro
    '00B0F0',           // celeste
    'FFD966',           // amarillo
  ]

  // ── Título de sección: EMOCIONES ──
  let rowG = 2

  const pintarTituloSeccion = (texto: string, color: string) => {
    wsGrafico.mergeCells(`B${rowG}:E${rowG}`)
    const t = wsGrafico.getCell(`B${rowG}`)
    t.value = texto
    t.font  = { bold: true, size: 13, name: 'Arial', color: { argb: COLOR.blanco } }
    t.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: color } }
    t.alignment = { horizontal: 'center', vertical: 'middle' }
    t.border = { top: { style: 'medium' }, bottom: { style: 'medium' }, left: { style: 'medium' }, right: { style: 'medium' } }
    wsGrafico.getRow(rowG).height = 26
    rowG++
  }

  const pintarEncabezadoGrafico = () => {
    ;(['B', 'C', 'D', 'E'] as const).forEach((col, ci) => {
      const c = wsGrafico.getCell(`${col}${rowG}`)
      c.value = ['Categoría', 'Distribución (barra)', 'N°', '%'][ci]
      c.font  = { bold: true, size: 10, name: 'Arial', color: { argb: '404040' } }
      c.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR.grisMedio } }
      c.alignment = { horizontal: ci === 0 ? 'left' : 'center', vertical: 'middle' }
      c.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } }
    })
    wsGrafico.getRow(rowG).height = 18
    rowG++
  }

  /** Dibuja una fila de barra: label | ████░░░░ | valor | % */
  const pintarFilaBarra = (
    label: string,
    valor: number,
    total: number,
    colorBarra: string,
    isOdd: boolean,
  ) => {
    const pct      = total > 0 ? valor / total : 0
    const MAX_CHAR = 40
    const llenos   = Math.round(pct * MAX_CHAR)
    const vacios   = MAX_CHAR - llenos
    const barra    = '█'.repeat(llenos) + '░'.repeat(vacios)
    const pctStr   = (pct * 100).toFixed(1) + '%'
    const bg       = isOdd ? COLOR.grisClaro : COLOR.blanco

    // Etiqueta
    const cLabel = wsGrafico.getCell(`B${rowG}`)
    cLabel.value = label
    cLabel.font  = { name: 'Arial', size: 10 }
    cLabel.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } }
    cLabel.alignment = { vertical: 'middle', horizontal: 'left' }
    cLabel.border = { top: { style: 'hair' }, bottom: { style: 'hair' }, left: { style: 'hair' }, right: { style: 'hair' } }

    // Barra visual (coloreada)
    const cBarra = wsGrafico.getCell(`C${rowG}`)
    cBarra.value = barra
    cBarra.font  = { name: 'Courier New', size: 10, color: { argb: colorBarra }, bold: true }
    cBarra.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } }
    cBarra.alignment = { vertical: 'middle', horizontal: 'left' }
    cBarra.border = { top: { style: 'hair' }, bottom: { style: 'hair' }, left: { style: 'hair' }, right: { style: 'hair' } }

    // Valor
    const cVal = wsGrafico.getCell(`D${rowG}`)
    cVal.value = valor
    cVal.font  = { name: 'Arial', size: 10, bold: true }
    cVal.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } }
    cVal.alignment = { vertical: 'middle', horizontal: 'center' }
    cVal.border = { top: { style: 'hair' }, bottom: { style: 'hair' }, left: { style: 'hair' }, right: { style: 'hair' } }

    // Porcentaje
    const cPct = wsGrafico.getCell(`E${rowG}`)
    cPct.value = pctStr
    cPct.font  = { name: 'Arial', size: 10, color: { argb: colorBarra }, bold: true }
    cPct.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } }
    cPct.alignment = { vertical: 'middle', horizontal: 'center' }
    cPct.border = { top: { style: 'hair' }, bottom: { style: 'hair' }, left: { style: 'hair' }, right: { style: 'hair' } }

    wsGrafico.getRow(rowG).height = 20
    rowG++
  }

  // ── GRÁFICO 1: Emociones predominantes ──
  const emocionesG = emocionesPredominantes(dataFiltrada)
  const totalEmoG  = emocionesG.reduce((s: number, e: any) => s + e.value, 0)

  pintarTituloSeccion('😊 EMOCIONES PREDOMINANTES', COLOR.naranjaMedio)
  pintarEncabezadoGrafico()
  emocionesG.slice(0, 10).forEach((e: any, i: number) => {
    pintarFilaBarra(e.name, e.value, totalEmoG, PALETA_BARRAS[i % PALETA_BARRAS.length], i % 2 === 0)
  })

  rowG++ // espacio

  // ── GRÁFICO 2: Participación por grado ──
  const gradosG   = agruparPorGrado(dataFiltrada)
  const totalGradG = gradosG.reduce((s: number, g: any) => s + g.value, 0)

  pintarTituloSeccion('🎓 PARTICIPACIÓN POR GRADO', COLOR.azulMedio)
  pintarEncabezadoGrafico()
  gradosG.forEach((g: any, i: number) => {
    const label = g.name === '0' ? 'Inicial' : `${g.name}° grado`
    pintarFilaBarra(label, g.value, totalGradG, PALETA_BARRAS[i % PALETA_BARRAS.length], i % 2 === 0)
  })

  rowG++ // espacio

  // ── GRÁFICO 3: Distribución "pastel" simulado (tabla con % y bloques de color) ──
  pintarTituloSeccion('🥧 DISTRIBUCIÓN EMOCIONAL (simulado pastel)', COLOR.verdeMedio)

  wsGrafico.mergeCells(`B${rowG}:E${rowG}`)
  const notaPastel = wsGrafico.getCell(`B${rowG}`)
  notaPastel.value = 'Proporción relativa de cada emoción sobre el total de respuestas emocionales'
  notaPastel.font  = { italic: true, size: 9, name: 'Arial', color: { argb: '666666' } }
  notaPastel.alignment = { horizontal: 'center' }
  wsGrafico.getRow(rowG).height = 16
  rowG++

  pintarEncabezadoGrafico()
  emocionesG.slice(0, 8).forEach((e: any, i: number) => {
    pintarFilaBarra(e.name, e.value, totalEmoG, PALETA_BARRAS[i % PALETA_BARRAS.length], i % 2 === 0)
  })

  wsGrafico.views = [{ state: 'frozen', xSplit: 0, ySplit: 0 }]

  // ══════════════════════════════════════════════════════════════════════════
  // HOJA 4 — EMOCIONES
  // ══════════════════════════════════════════════════════════════════════════
  const wsEmociones = workbook.addWorksheet('😊 Emociones')
  wsEmociones.columns = [
    { header: 'Emoción',       key: 'name',   width: 24 },
    { header: 'Frecuencia',    key: 'value',  width: 14 },
    { header: '% del Total',   key: 'pct',    width: 14 },
    { header: 'Rango',         key: 'rango',  width: 12 },
    { header: 'Categoría',     key: 'cat',    width: 18 },
    { header: 'Estrategia Tutorial Sugerida', key: 'estrategia', width: 50 },
  ]

  const hEmo = wsEmociones.getRow(1)
  wsEmociones.columns.forEach((col, ci) => {
    const c = hEmo.getCell(ci + 1)
    c.value = Array.isArray(col.header)
  ? col.header.join(" ")
  : col.header ?? ""
    c.font  = { bold: true, name: 'Arial', size: 10, color: { argb: COLOR.blanco } }
    c.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR.naranjaMedio } }
    c.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
    c.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } }
  })
  hEmo.height = 22

  const ESTRATEGIAS_EMOCIONAL: Record<string, { cat: string; estrategia: string }> = {
    'alegría':      { cat: 'Positiva',   estrategia: 'Reforzar clima de aula positivo y reconocer logros.' },
    'feliz':        { cat: 'Positiva',   estrategia: 'Mantener rutinas motivadoras y participación activa.' },
    'tranquilo':    { cat: 'Positiva',   estrategia: 'Fortalecer resiliencia y habilidades socioemocionales.' },
    'triste':       { cat: 'Atención',   estrategia: 'Tutoría individual, preguntar causas, contactar familia.' },
    'tristeza':     { cat: 'Atención',   estrategia: 'Tutoría individual, preguntar causas, contactar familia.' },
    'enojado':      { cat: 'Atención',   estrategia: 'Trabajar manejo de emociones y resolución de conflictos.' },
    'enojo':        { cat: 'Atención',   estrategia: 'Trabajar manejo de emociones y resolución de conflictos.' },
    'ansioso':      { cat: 'Atención',   estrategia: 'Técnicas de relajación, reducir presión académica.' },
    'ansiedad':     { cat: 'Atención',   estrategia: 'Técnicas de relajación, reducir presión académica.' },
    'miedo':        { cat: 'Urgente',    estrategia: 'Identificar fuente del miedo, derivar si persiste.' },
    'solo':         { cat: 'Urgente',    estrategia: 'Dinámicas de integración, reforzar vínculos entre pares.' },
    'aburrido':     { cat: 'Moderada',   estrategia: 'Diversificar estrategias didácticas, actividades motivadoras.' },
    'confundido':   { cat: 'Moderada',   estrategia: 'Refuerzo académico y acompañamiento personalizado.' },
  }

  const totalEmo = emociones.reduce((s: number, e: any) => s + (e.value ?? 0), 0)
  emociones.forEach((e: any, i: number) => {
    const fila = wsEmociones.getRow(2 + i)
    const pct  = totalEmo > 0 ? ((e.value / totalEmo) * 100).toFixed(1) + '%' : '0%'
    const key  = String(e.name).toLowerCase().trim()
    const info = ESTRATEGIAS_EMOCIONAL[key] ?? { cat: 'Ver respuesta', estrategia: 'Analizar respuestas individuales.' }
    const bg   = info.cat === 'Urgente' ? COLOR.rojoClaro
               : info.cat === 'Atención' ? COLOR.naranjaClaro
               : info.cat === 'Positiva' ? COLOR.verdeClaro
               : i % 2 === 0 ? COLOR.grisClaro : COLOR.blanco

    const vals = [e.name, e.value, pct, i + 1, info.cat, info.estrategia]
    vals.forEach((v, ci) => {
      const c = fila.getCell(ci + 1)
      c.value = (v ?? '') as any
      c.font  = { name: 'Arial', size: 10 }
      c.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } }
      c.alignment = { wrapText: true, vertical: 'top', horizontal: ci === 1 || ci === 2 || ci === 3 ? 'center' : 'left' }
      c.border = { top: { style: 'hair' }, bottom: { style: 'hair' }, left: { style: 'hair' }, right: { style: 'hair' } }
    })
    fila.height = 20
  })

  wsEmociones.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }]

  // ══════════════════════════════════════════════════════════════════════════
  // HOJA 5 — PLAN TUTORIAL (plantilla para completar)
  // ══════════════════════════════════════════════════════════════════════════
  const wsPlan = workbook.addWorksheet('📝 Plan Tutorial')
  wsPlan.getColumn('A').width = 4
  wsPlan.getColumn('B').width = 28
  wsPlan.getColumn('C').width = 38
  wsPlan.getColumn('D').width = 22
  wsPlan.getColumn('E').width = 22
  wsPlan.getColumn('F').width = 22
  wsPlan.getColumn('G').width = 4

  // Título
  wsPlan.mergeCells('B2:F2')
  const tPlan = wsPlan.getCell('B2')
  tPlan.value = 'PLAN DE ACCIÓN TUTORIAL — ' + ahora.slice(0, 4)
  tPlan.font  = { bold: true, size: 15, name: 'Arial', color: { argb: COLOR.blanco } }
  tPlan.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR.azulOscuro } }
  tPlan.alignment = { horizontal: 'center', vertical: 'middle' }
  wsPlan.getRow(2).height = 32

  // Datos del tutor
  const datosInstitucion: [string, string][] = [
    ['Institución Educativa:', ''],
    ['Tutor(a):',              ''],
    ['Grado y sección:',       ''],
    ['Año lectivo:',           ahora.slice(0, 4)],
    ['Fecha de elaboración:',  fechaHoy],
  ]
  datosInstitucion.forEach(([label, val], i) => {
    const row = 4 + i
    wsPlan.mergeCells(`B${row}:C${row}`)
    dataCell(wsPlan, `B${row}`, label,  COLOR.azulClaro, true)
    wsPlan.mergeCells(`D${row}:F${row}`)
    dataCell(wsPlan, `D${row}`, val,    COLOR.blanco, false)
    wsPlan.getRow(row).height = 20
  })

  wsPlan.getRow(9).height = 12

  // Tabla de acciones tutoriales
  wsPlan.mergeCells('B10:F10')
  headerCell(wsPlan, 'B10', 'ACCIONES TUTORIALES PROGRAMADAS', COLOR.azulMedio, COLOR.blanco, true, 12)
  wsPlan.getRow(10).height = 22

  const cabAcciones = ['Área de Atención', 'Acción / Actividad', 'Responsable', 'Fecha', 'Resultado Esperado']
  cabAcciones.forEach((h, ci) => {
    headerCell(wsPlan, `${String.fromCharCode(66 + ci)}11`, h, COLOR.azulOscuro)
  })
  wsPlan.getRow(11).height = 20

  // Filas con acciones sugeridas basadas en los datos
  const accionesBase: [string, string, string, string, string][] = [
    ['Socioemocional', 'Diagnóstico individual de alumnos en riesgo', 'Tutor/a', '', 'Identificar casos prioritarios'],
    ['Socioemocional', 'Sesión grupal de manejo de emociones', 'Tutor/a', '', 'Reducir niveles de ansiedad/tristeza'],
    ['Convivencia',   'Dinámica de integración grupal', 'Tutor/a', '', 'Mejorar clima de aula'],
    ['Académico',     'Coordinación con docentes de áreas críticas', 'Tutor/a + Docentes', '', 'Reforzar rendimiento académico'],
    ['Familia',       'Reunión con padres o apoderados', 'Tutor/a', '', 'Comprometer a la familia en el proceso'],
    ['Orientación',   'Derivación de casos urgentes a psicología/DESNA', 'Tutor/a + Dirección', '', 'Atención especializada oportuna'],
    ['', '', '', '', ''],
    ['', '', '', '', ''],
    ['', '', '', '', ''],
  ]
  accionesBase.forEach((fila, i) => {
    const row = 12 + i
    const bg = i % 2 === 0 ? COLOR.grisClaro : COLOR.blanco
    fila.forEach((v, ci) => {
      dataCell(wsPlan, `${String.fromCharCode(66 + ci)}${row}`, v, bg)
    })
    wsPlan.getRow(row).height = 20
  })

  // Sección de compromisos
  const rowComp = 12 + accionesBase.length + 2
  wsPlan.mergeCells(`B${rowComp}:F${rowComp}`)
  headerCell(wsPlan, `B${rowComp}`, 'COMPROMISOS Y OBSERVACIONES GENERALES', COLOR.azulMedio, COLOR.blanco, true, 11)
  wsPlan.getRow(rowComp).height = 22

  for (let i = 1; i <= 5; i++) {
    const row = rowComp + i
    wsPlan.mergeCells(`B${row}:F${row}`)
    dataCell(wsPlan, `B${row}`, '', COLOR.blanco)
    wsPlan.getRow(row).height = 22
  }

  // ══════════════════════════════════════════════════════════════════════════
  // HOJA 6 — RESPUESTAS CRUDAS (referencia completa)
  // ══════════════════════════════════════════════════════════════════════════
  const wsCrudas = workbook.addWorksheet('🗂️ Respuestas Crudas')
  wsCrudas.columns = [
    { header: 'Apellidos',     key: 'apellido',       width: 22 },
    { header: 'Nombres',       key: 'nombre',         width: 22 },
    { header: 'Grado',         key: 'grado',          width: 10 },
    { header: 'Sección',       key: 'seccion',        width: 12 },
    { header: 'Pregunta ID',   key: 'pregunta_id',    width: 13 },
    { header: 'Pregunta',      key: 'pregunta_texto', width: 45 },
    { header: 'Tipo',          key: 'tipo',           width: 14 },
    { header: 'Respuesta',     key: 'respuesta',      width: 40 },
  ]

  const hCrudas = wsCrudas.getRow(1)
  wsCrudas.columns.forEach((col, ci) => {
    const c = hCrudas.getCell(ci + 1)
    c.value = Array.isArray(col.header)
  ? col.header.join(" ")
  : col.header ?? ""
    c.font  = { bold: true, name: 'Arial', size: 10, color: { argb: COLOR.blanco } }
    c.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: '404040' } }
    c.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
    c.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } }
  })
  hCrudas.height = 22

  const planas = aplanarRespuestas(dataFiltrada)
  planas.forEach((r, i) => {
    const fila = wsCrudas.getRow(2 + i)
    const bg   = i % 2 === 0 ? COLOR.grisClaro : COLOR.blanco
    const vals = [r.apellido, r.nombre, r.grado, r.seccion, r.pregunta_id, r.pregunta_texto, r.tipo, r.respuesta]
    vals.forEach((v, ci) => {
      const c = fila.getCell(ci + 1)
      c.value = (v ?? '') as any
      c.font  = { name: 'Arial', size: 10 }
      c.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } }
      c.alignment = { wrapText: true, vertical: 'top' }
      c.border = { top: { style: 'hair' }, bottom: { style: 'hair' }, left: { style: 'hair' }, right: { style: 'hair' } }
    })
    fila.height = 18
  })

  wsCrudas.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: 8 } }
  wsCrudas.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }]

  // ══════════════════════════════════════════════════════════════════════════
  // DESCARGAR
  // ══════════════════════════════════════════════════════════════════════════
  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  saveAs(blob, `Plan_Tutorial_${ahora}.xlsx`)
}
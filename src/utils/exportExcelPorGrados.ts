import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import { detectarAlumnosRiesgo, detectarAlumnosRiesgoInicial } from './dashboard.utils'

const COLOR = {
  azulOscuro: '1F3864',
  azulMedio: '2E75B6',
  azulClaro: 'BDD7EE',
  verdeOscuro: '375623',
  verdeMedio: '70AD47',
  verdeClaro: 'E2EFDA',
  naranjaOscuro: '843C0C',
  naranjaMedio: 'ED7D31',
  naranjaClaro: 'FCE4D6',
  rojoOscuro: '9C0006',
  rojoClaro: 'FFC7CE',
  amarilloClaro: 'FFEB9C',
  grisClaro: 'F2F2F2',
  grisMedio: 'D9D9D9',
  blanco: 'FFFFFF',
}

function colorRiesgo(riesgo: string): string | undefined {
  if (riesgo === 'Alto') return COLOR.rojoClaro
  if (riesgo === 'Medio') return COLOR.amarilloClaro
  if (riesgo === 'Bajo') return COLOR.verdeClaro
  return undefined
}

function textoRiesgo(riesgo: string): string {
  if (riesgo === 'Alto') return 'Alto'
  if (riesgo === 'Medio') return 'Medio'
  return 'Bajo'
}

function textColorRiesgo(riesgo: string): string {
  if (riesgo === 'Alto') return COLOR.rojoOscuro
  if (riesgo === 'Medio') return 'BF8F00'
  if (riesgo === 'Bajo') return COLOR.verdeOscuro
  return '000000'
}

export const exportarExcelPorGrados = async (data: any[], nivel: 'primaria' | 'inicial' = 'primaria') => {
  if (nivel === 'inicial') {
    return exportarExcelPorGradosInicial(data)
  }

  const primariaData = data.filter((item: any) => {
    const est = Array.isArray(item.estudiantes) ? item.estudiantes[0] : item.estudiantes
    const grado = est?.grado != null ? String(est.grado).trim() : ''
    return ['1', '2', '3', '4', '5', '6'].includes(grado)
  })

  if (primariaData.length === 0) {
    alert('No hay datos de Primaria para exportar.')
    return
  }

  const alumnosRiesgo = detectarAlumnosRiesgo(primariaData) as any[]
  const riesgoMap = new Map(alumnosRiesgo.map((a: any) => [a.estudiante_id, a]))

  const estudianteMap = new Map<string, any>()
  primariaData.forEach((item: any) => {
    const id = item.estudiante_id
    if (!id || estudianteMap.has(id)) return
    const est = Array.isArray(item.estudiantes) ? item.estudiantes[0] : item.estudiantes
    estudianteMap.set(id, {
      estudiante_id: id,
      nombres: est?.nombres || '',
      apellidos: est?.apellidos || '',
      grado: est?.grado != null ? String(est.grado) : '',
      seccion: (est?.seccion || '').toUpperCase(),
    })
  })

  const workbook = new ExcelJS.Workbook()
  const ahora = new Date().toISOString().slice(0, 10)
  const fechaHoy = new Date().toLocaleDateString('es-PE', {
    day: '2-digit', month: 'long', year: 'numeric',
  })

  const grados = ['1', '2', '3', '4', '5', '6']
  const secciones = ['A', 'B', 'C', 'D', 'E', 'F']

  // ── HOJA 1: RESUMEN GENERAL ─────────────────────────────────────
  const wsResumen = workbook.addWorksheet('Resumen General')
  wsResumen.mergeCells('A1:G1')
  wsResumen.getCell('A1').value = 'REPORTE POR GRADOS Y SECCIONES - PRIMARIA'
  wsResumen.getCell('A1').font = { bold: true, size: 14, color: { argb: COLOR.blanco }, name: 'Arial' }
  wsResumen.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR.azulOscuro } }
  wsResumen.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' }

  const filaInfo = wsResumen.addRow(['Fecha de generación', fechaHoy])
  filaInfo.getCell(1).font = { bold: true, name: 'Arial', size: 10 }

  wsResumen.addRow(['Total estudiantes', estudianteMap.size])
  wsResumen.addRow(['Total alumnos en riesgo (Medio/Alto)', alumnosRiesgo.filter((a: any) => a.riesgo !== 'Bajo').length])
  wsResumen.addRow([])

  const encabezados = ['Grado', 'Sección', 'Total Alumnos', 'Bajo', 'Medio', 'Alto', '% Riesgo']
  const hr = wsResumen.addRow(encabezados)
  hr.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: COLOR.blanco }, name: 'Arial', size: 11 }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR.azulMedio } }
    cell.alignment = { horizontal: 'center', vertical: 'middle' }
  })

  grados.forEach((grado) => {
    secciones.forEach((seccion) => {
      const ests = Array.from(estudianteMap.values()).filter(
        (e: any) => e.grado === grado && e.seccion === seccion
      )
      if (ests.length === 0) return
      let bajo = 0, medio = 0, alto = 0
      ests.forEach((e: any) => {
        const r = riesgoMap.get(e.estudiante_id)
        if (!r || r.riesgo === 'Bajo') bajo++
        else if (r.riesgo === 'Medio') medio++
        else alto++
      })
      const pct = `${((medio + alto) / ests.length * 100).toFixed(1)}%`
      const row = wsResumen.addRow([`${grado}° Grado`, seccion, ests.length, bajo, medio, alto, pct])
      row.eachCell((cell) => {
        cell.alignment = { horizontal: 'center', vertical: 'middle' }
        cell.font = { name: 'Arial', size: 10 }
      })
    })
  })

  const totalGeneral = estudianteMap.size
  const totalBajo =
    alumnosRiesgo.filter((a: any) => a.riesgo === 'Bajo').length +
    (totalGeneral - alumnosRiesgo.length)
  const totalMedio = alumnosRiesgo.filter((a: any) => a.riesgo === 'Medio').length
  const totalAlto = alumnosRiesgo.filter((a: any) => a.riesgo === 'Alto').length
  const totalPct = `${((totalMedio + totalAlto) / totalGeneral * 100).toFixed(1)}%`
  const tr = wsResumen.addRow(['TOTAL', '', totalGeneral, totalBajo, totalMedio, totalAlto, totalPct])
  tr.eachCell((cell) => {
    cell.font = { bold: true, name: 'Arial', size: 10 }
    cell.alignment = { horizontal: 'center', vertical: 'middle' }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR.grisClaro } }
  })

  wsResumen.getColumn(1).width = 16
  wsResumen.getColumn(2).width = 10
  wsResumen.getColumn(3).width = 16
  wsResumen.getColumn(4).width = 10
  wsResumen.getColumn(5).width = 10
  wsResumen.getColumn(6).width = 10
  wsResumen.getColumn(7).width = 14
  wsResumen.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }]

  // ── HOJAS POR GRADO ────────────────────────────────────────────
  grados.forEach((grado) => {
    const ests = Array.from(estudianteMap.values())
      .filter((e: any) => e.grado === grado)
      .sort((a: any, b: any) => {
        if (a.seccion !== b.seccion) return a.seccion.localeCompare(b.seccion)
        return a.apellidos.localeCompare(b.apellidos)
      })
    if (ests.length === 0) return

    const ws = workbook.addWorksheet(`${grado}° Grado`)
    const wsc1 = ws.getColumn(1); wsc1.width = 5
    const wsc2 = ws.getColumn(2); wsc2.width = 10
    const wsc3 = ws.getColumn(3); wsc3.width = 26
    const wsc4 = ws.getColumn(4); wsc4.width = 26
    const wsc5 = ws.getColumn(5); wsc5.width = 16
    const wsc6 = ws.getColumn(6); wsc6.width = 16
    const wsc7 = ws.getColumn(7); wsc7.width = 12

    const hRow = ws.addRow(['#', 'Sección', 'Apellidos', 'Nombres', 'Puntaje (0-20)', 'Nivel Riesgo', 'Total Respuestas'])
    hRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: COLOR.blanco }, name: 'Arial', size: 11 }
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR.azulOscuro } }
      cell.alignment = { horizontal: 'center', vertical: 'middle' }
    })
    ws.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }]

    let nro = 1
    ests.forEach((est: any) => {
      const r = riesgoMap.get(est.estudiante_id)
      const score = r?.score ?? 0
      const nivelRiesgo = r?.riesgo ?? 'Bajo'
      const respTotales = r?.totalRespuestas ?? 0

      const row = ws.addRow([nro++, est.seccion, est.apellidos, est.nombres, score, textoRiesgo(nivelRiesgo), respTotales])
      const bg = colorRiesgo(nivelRiesgo)
      row.eachCell((cell, col) => {
        cell.font = { name: 'Arial', size: 10, color: { argb: textColorRiesgo(nivelRiesgo) } }
        if (bg) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } }
        cell.alignment = col === 1 || col === 2 || col === 5 || col === 6 || col === 7
          ? { horizontal: 'center', vertical: 'middle' }
          : { vertical: 'middle' }
      })
    })

    ws.addRow([])

    secciones.forEach((seccion) => {
      const estsSec = ests.filter((e: any) => e.seccion === seccion)
      if (estsSec.length === 0) return
      let bajo = 0, medio = 0, alto = 0
      estsSec.forEach((e: any) => {
        const r = riesgoMap.get(e.estudiante_id)
        if (!r || r.riesgo === 'Bajo') bajo++
        else if (r.riesgo === 'Medio') medio++
        else alto++
      })
      const resRow = ws.addRow(['', `Sección ${seccion}`, `Total: ${estsSec.length} alumnos`, '', '', `B:${bajo} M:${medio} A:${alto}`, ''])
      resRow.eachCell((cell) => {
        cell.font = { bold: true, name: 'Arial', size: 10, color: { argb: '333333' } }
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR.grisClaro } }
        cell.alignment = { vertical: 'middle' }
      })
    })
  })

  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  saveAs(blob, `Reporte_Grados_Secciones_${ahora}.xlsx`)
}

// ── VERSIÓN INICIAL ──────────────────────────────────────────────
async function exportarExcelPorGradosInicial(data: any[]) {
  if (data.length === 0) {
    alert('No hay datos de Inicial para exportar.')
    return
  }

  const workbook = new ExcelJS.Workbook()
  const ahora = new Date().toISOString().slice(0, 10)
  const fechaHoy = new Date().toLocaleDateString('es-PE', {
    day: '2-digit', month: 'long', year: 'numeric',
  })

  const alumnosRiesgo = detectarAlumnosRiesgoInicial(data) as any[]

  const seccionData = new Map<string, any[]>()
  const estudianteGlobalMap = new Map<string, { seccion: string; riesgo: string }>()
  data.forEach((item: any) => {
    const id = item.estudiante_id
    if (!id) return
    const est = Array.isArray(item.estudiantes) ? item.estudiantes[0] : item.estudiantes
    const seccion = (est?.seccion || '').trim()
    if (!seccion) return
    if (!seccionData.has(seccion)) seccionData.set(seccion, [])
    seccionData.get(seccion)!.push(item)
    if (!estudianteGlobalMap.has(id)) {
      const infoRiesgo = alumnosRiesgo.find((a: any) => a.estudiante_id === id)
      estudianteGlobalMap.set(id, {
        seccion,
        riesgo: infoRiesgo?.riesgo ?? 'Bajo',
      })
    }
  })

  const tituloSection = (s: string) => `Inicial - ${s}`

  for (const [seccion, items] of seccionData) {
    const ws = workbook.addWorksheet(tituloSection(seccion))
    ws.mergeCells('A1:F1')
    ws.getCell('A1').value = `REPORTE INICIAL (5 AÑOS) - ${seccion}`
    ws.getCell('A1').font = { bold: true, size: 14, color: { argb: COLOR.blanco }, name: 'Arial' }
    ws.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR.azulOscuro } }
    ws.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' }

    ws.addRow(['Fecha de generación', fechaHoy])
    ws.addRow([])

    const estudianteMap = new Map<string, any>()
    items.forEach((item: any) => {
      const id = item.estudiante_id
      if (!id || estudianteMap.has(id)) return
      const est = Array.isArray(item.estudiantes) ? item.estudiantes[0] : item.estudiantes
      const infoRiesgo = alumnosRiesgo.find((a: any) => a.estudiante_id === id)
      estudianteMap.set(id, {
        estudiante_id: id,
        nombres: est?.nombres || '',
        apellidos: est?.apellidos || '',
        score: infoRiesgo?.score ?? 0,
        riesgo: infoRiesgo?.riesgo ?? 'Bajo',
      })
    })

    const wsic1 = ws.getColumn(1); wsic1.width = 5
    const wsic2 = ws.getColumn(2); wsic2.width = 26
    const wsic3 = ws.getColumn(3); wsic3.width = 26
    const wsic4 = ws.getColumn(4); wsic4.width = 16
    const wsic5 = ws.getColumn(5); wsic5.width = 18

    const hRow = ws.addRow(['#', 'Apellidos', 'Nombres', 'Puntaje (0-20)', 'Nivel Riesgo'])
    hRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: COLOR.blanco }, name: 'Arial', size: 11 }
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR.azulOscuro } }
      cell.alignment = { horizontal: 'center', vertical: 'middle' }
    })
    ws.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }]

    const estudiantes = Array.from(estudianteMap.values()).sort((a: any, b: any) =>
      a.apellidos.localeCompare(b.apellidos)
    )
    estudiantes.forEach((est: any, i: number) => {
      const row = ws.addRow([i + 1, est.apellidos, est.nombres, est.score, textoRiesgo(est.riesgo)])
      const bg = colorRiesgo(est.riesgo)
      row.eachCell((cell) => {
        cell.font = { name: 'Arial', size: 10, color: { argb: textColorRiesgo(est.riesgo) } }
        if (bg) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } }
        cell.alignment = { horizontal: 'center', vertical: 'middle' }
      })
    })

    ws.addRow([])
    ws.addRow(['Total estudiantes:', estudianteMap.size])
    const resBajo = estudiantes.filter((e: any) => e.riesgo === 'Bajo').length
    const resMedio = estudiantes.filter((e: any) => e.riesgo === 'Medio').length
    const resAlto = estudiantes.filter((e: any) => e.riesgo === 'Alto').length
    ws.addRow(['Nivel Bajo:', resBajo])
    ws.addRow(['Nivel Medio:', resMedio])
    ws.addRow(['Nivel Alto:', resAlto])
  }

  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  saveAs(blob, `Reporte_Inicial_${ahora}.xlsx`)
}

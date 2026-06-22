import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import { detectarAlumnosRiesgoInicial, analisisPorPregunta } from './dashboard.utils'

export const exportarDashboardInicialExcel = async (dataFiltrada: any[]) => {
  const workbook = new ExcelJS.Workbook()
  const ahora = new Date().toISOString().slice(0, 10)
  const fechaHoy = new Date().toLocaleDateString('es-PE', {
    day: '2-digit', month: 'long', year: 'numeric',
  })

  const alumnos = detectarAlumnosRiesgoInicial(dataFiltrada)
  const totalRespuestas = dataFiltrada.length

  const bien = alumnos.filter((a: any) => a.riesgo === 'Bajo')
  const regular = alumnos.filter((a: any) => a.riesgo === 'Medio')
  const malo = alumnos.filter((a: any) => a.riesgo === 'Alto')

  // ================================================================
  // HOJA 1: RESUMEN GENERAL
  // ================================================================
  const ws1 = workbook.addWorksheet('Resumen General')
  ws1.mergeCells('A1:C1')
  const t1 = ws1.getCell('A1')
  t1.value = 'REPORTE DASHBOARD INICIAL (5 AÑOS)'
  t1.font = { bold: true, size: 14, color: { argb: 'FFFFFF' } }
  t1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1F3864' } }
  t1.alignment = { horizontal: 'center' }

  ws1.addRow([])
  ws1.addRow(['Fecha de generación', fechaHoy, ''])
  const seccionesList = [...new Set(dataFiltrada.map((item: any) => {
    const est = Array.isArray(item.estudiantes) ? item.estudiantes[0] : item.estudiantes
    return est?.seccion || ''
  }).filter(Boolean))].join(', ')
  ws1.addRow(['Nivel educativo', `Inicial (5 años) – ${seccionesList || 'Sin sección'}`, ''])
  ws1.addRow(['Total alumnos evaluados', alumnos.length, ''])
  ws1.addRow(['Total respuestas registradas', totalRespuestas, ''])
  ws1.addRow([])
  ws1.addRow(['RESUMEN DE ESTADO', 'Cantidad', '% del total'])
  const rowHeader = ws1.getRow(7)
  rowHeader.font = { bold: true }
  rowHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E2EFDA' } }

  const total = alumnos.length || 1
  ws1.addRow(['✅ Buenos (riesgo bajo)', bien.length, `${((bien.length / total) * 100).toFixed(1)}%`])
  ws1.addRow(['🟡 Regulares (riesgo medio)', regular.length, `${((regular.length / total) * 100).toFixed(1)}%`])
  ws1.addRow(['🔴 Malos (riesgo alto)', malo.length, `${((malo.length / total) * 100).toFixed(1)}%`])
  ws1.addRow([])
  ws1.addRow(['NOTA:', 'El puntaje (0-20) combina el resultado de las 12 preguntas (peso 14 pts) más los factores de riesgo observados (peso 6 pts).', ''])
  ws1.addRow(['', 'A mayor puntaje, mayor riesgo socioemocional.', ''])

  ws1.getColumn(1).width = 32
  ws1.getColumn(2).width = 32
  ws1.getColumn(3).width = 16

  // ================================================================
  // HOJA 2: TODOS LOS ALUMNOS (DATOS COMPLETOS)
  // ================================================================
  const ws2 = workbook.addWorksheet('Todos los Alumnos')
  ws2.columns = [
    { header: '#', key: 'nro', width: 5 },
    { header: 'Apellidos', key: 'apellidos', width: 22 },
    { header: 'Nombres', key: 'nombres', width: 22 },
    { header: 'Sección', key: 'seccion', width: 10 },
    { header: '✅ Logró (cant.)', key: 'preguntasLogradas', width: 16 },
    { header: '⏳ En Proceso (cant.)', key: 'preguntasEnProceso', width: 18 },
    { header: '❌ No Logró (cant.)', key: 'preguntasNoLogra', width: 16 },
    { header: 'Puntaje Preguntas (0-24)', key: 'puntajeTotalPreguntas', width: 24 },
    { header: 'Factores Riesgo (0-7)', key: 'factoresRiesgo', width: 22 },
    { header: 'Puntaje Riesgo Final (0-20)', key: 'score', width: 26 },
    { header: 'Estado', key: 'estado', width: 18 },
  ]
  ws2.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } }
  ws2.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '2E75B6' } }
  alumnos.forEach((a: any, i: number) => ws2.addRow({ nro: i + 1, ...a }))
  ws2.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: 11 } }

  // ================================================================
  // HOJA 3: ALUMNOS BUENOS
  // ================================================================
  if (bien.length > 0) {
    const ws3 = workbook.addWorksheet('✅ Buenos')
    ws3.columns = [
      { header: '#', key: 'nro', width: 5 },
      { header: 'Apellidos', key: 'apellidos', width: 22 },
      { header: 'Nombres', key: 'nombres', width: 22 },
      { header: 'Sección', key: 'seccion', width: 10 },
      { header: '✅ Logró', key: 'preguntasLogradas', width: 12 },
      { header: '⏳ En Proceso', key: 'preguntasEnProceso', width: 14 },
      { header: '❌ No Logró', key: 'preguntasNoLogra', width: 12 },
      { header: 'Puntaje Preg. (0-24)', key: 'puntajeTotalPreguntas', width: 20 },
      { header: 'Factores Riesgo', key: 'factoresRiesgo', width: 16 },
      { header: 'Puntaje (0-20)', key: 'score', width: 14 },
    ]
    ws3.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } }
    ws3.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '208B3A' } }
    bien.forEach((a: any, i: number) => ws3.addRow({ nro: i + 1, ...a }))
  }

  // ================================================================
  // HOJA 4: ALUMNOS REGULARES
  // ================================================================
  if (regular.length > 0) {
    const ws4 = workbook.addWorksheet('🟡 Regulares')
    ws4.columns = [
      { header: '#', key: 'nro', width: 5 },
      { header: 'Apellidos', key: 'apellidos', width: 22 },
      { header: 'Nombres', key: 'nombres', width: 22 },
      { header: 'Sección', key: 'seccion', width: 10 },
      { header: '✅ Logró', key: 'preguntasLogradas', width: 12 },
      { header: '⏳ En Proceso', key: 'preguntasEnProceso', width: 14 },
      { header: '❌ No Logró', key: 'preguntasNoLogra', width: 12 },
      { header: 'Puntaje Preg. (0-24)', key: 'puntajeTotalPreguntas', width: 20 },
      { header: 'Factores Riesgo', key: 'factoresRiesgo', width: 16 },
      { header: 'Puntaje (0-20)', key: 'score', width: 14 },
    ]
    ws4.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } }
    ws4.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'BF8F00' } }
    regular.forEach((a: any, i: number) => ws4.addRow({ nro: i + 1, ...a }))
  }

  // ================================================================
  // HOJA 5: ALUMNOS MALOS
  // ================================================================
  if (malo.length > 0) {
    const ws5 = workbook.addWorksheet('🔴 Malos')
    ws5.columns = [
      { header: '#', key: 'nro', width: 5 },
      { header: 'Apellidos', key: 'apellidos', width: 22 },
      { header: 'Nombres', key: 'nombres', width: 22 },
      { header: 'Sección', key: 'seccion', width: 10 },
      { header: '✅ Logró', key: 'preguntasLogradas', width: 12 },
      { header: '⏳ En Proceso', key: 'preguntasEnProceso', width: 14 },
      { header: '❌ No Logró', key: 'preguntasNoLogra', width: 12 },
      { header: 'Puntaje Preg. (0-24)', key: 'puntajeTotalPreguntas', width: 20 },
      { header: 'Factores Riesgo', key: 'factoresRiesgo', width: 16 },
      { header: 'Puntaje (0-20)', key: 'score', width: 14 },
    ]
    ws5.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } }
    ws5.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '9C0006' } }
    malo.forEach((a: any, i: number) => ws5.addRow({ nro: i + 1, ...a }))
  }

  // ================================================================
  // HOJA 6: ESTADÍSTICAS POR PREGUNTA
  // ================================================================
  const ws6 = workbook.addWorksheet('Estadisticas Preguntas')
  ws6.columns = [
    { header: 'Pregunta', key: 'pregunta', width: 60 },
    { header: 'Respuesta', key: 'respuesta', width: 20 },
    { header: 'Cantidad', key: 'frecuencia', width: 12 },
    { header: '%', key: 'porcentaje', width: 10 },
  ]
  ws6.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } }
  ws6.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '843C0C' } }

  const analisis = analisisPorPregunta(dataFiltrada) as any[]
  analisis.forEach((preg: any) => {
    const opciones = (Object.entries(preg.respuestas ?? {}) as [string, number][])
      .map(([respuesta, frecuencia]) => ({ respuesta, frecuencia: Number(frecuencia) || 0 }))
      .sort((a, b) => b.frecuencia - a.frecuencia)
    const total = opciones.reduce((acc, op) => acc + op.frecuencia, 0)
    opciones.forEach((op) => {
      const pct = total > 0 ? Number(((op.frecuencia / total) * 100).toFixed(1)) : 0
      ws6.addRow({
        pregunta: preg.pregunta,
        respuesta: op.respuesta,
        frecuencia: op.frecuencia,
        porcentaje: `${pct}%`,
      })
    })
    ws6.addRow([])
  })

  // ================================================================
  // HOJA 7: MATRIZ COMPLETA DE RESPUESTAS
  // ================================================================
  const ws7 = workbook.addWorksheet('Matriz Respuestas')
  ws7.columns = [
    { header: 'Apellidos', key: 'apellidos', width: 20 },
    { header: 'Nombres', key: 'nombres', width: 20 },
    { header: 'ID Pregunta', key: 'pregunta_id', width: 12 },
    { header: 'Respuesta', key: 'respuesta', width: 20 },
    { header: 'Fecha', key: 'fecha', width: 14 },
  ]
  ws7.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } }
  ws7.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '404040' } }
  dataFiltrada.forEach((item: any) => {
    const est = Array.isArray(item.estudiantes) ? item.estudiantes[0] : item.estudiantes
    ws7.addRow({
      apellidos: est?.apellidos ?? '',
      nombres: est?.nombres ?? '',
      pregunta_id: item.pregunta_id ?? '',
      respuesta: item.respuesta ?? '',
      fecha: item.fecha ? String(item.fecha).slice(0, 10) : '',
    })
  })
  ws7.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: 5 } }

  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  saveAs(blob, `Dashboard_Inicial_${ahora}.xlsx`)
}

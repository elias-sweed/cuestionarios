import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import { agruparPorGrado, agruparPorSeccion, emocionesPredominantes } from './dashboard.utils'

// 🔥 Ahora la función es async (esto arregla el error del await)
export const exportarDashboardExcel = async (dataFiltrada: any[]) => {
  const workbook = new ExcelJS.Workbook()

  // ==================== HOJA 1: Respuestas crudas ====================
  const wsCrudas = workbook.addWorksheet('Respuestas Crudas')

  const dataPlana = dataFiltrada.map((item) => ({
    pregunta_id: item.pregunta_id,
    respuesta: item.respuesta,
    grado: item.estudiantes?.grado || 'Sin grado',
    seccion: item.estudiantes?.seccion || 'Sin sección',
  }))

  wsCrudas.columns = [
    { header: 'Pregunta ID', key: 'pregunta_id', width: 15 },
    { header: 'Respuesta', key: 'respuesta', width: 30 },
    { header: 'Grado', key: 'grado', width: 12 },
    { header: 'Sección', key: 'seccion', width: 12 },
  ]
  wsCrudas.addRows(dataPlana)

  // ==================== HOJA 2: Resumen por Grado ====================
  const wsGrado = workbook.addWorksheet('Resumen por Grado')
  const porGrado = agruparPorGrado(dataFiltrada)
  wsGrado.columns = [
    { header: 'Grado', key: 'name', width: 15 },
    { header: 'Cantidad', key: 'value', width: 15 },
  ]
  wsGrado.addRows(porGrado)

  // ==================== HOJA 3: Resumen por Sección ====================
  const wsSeccion = workbook.addWorksheet('Resumen por Sección')
  const porSeccion = agruparPorSeccion(dataFiltrada)
  wsSeccion.columns = [
    { header: 'Sección', key: 'name', width: 15 },
    { header: 'Cantidad', key: 'value', width: 15 },
  ]
  wsSeccion.addRows(porSeccion)

  // ==================== HOJA 4: Emociones ====================
  const wsEmociones = workbook.addWorksheet('Emociones')
  const emociones = emocionesPredominantes(dataFiltrada)
  wsEmociones.columns = [
    { header: 'Emoción', key: 'name', width: 20 },
    { header: 'Cantidad', key: 'value', width: 15 },
  ]
  wsEmociones.addRows(emociones)

  // ==================== DESCARGAR ====================
  const buffer = await workbook.xlsx.writeBuffer()

  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })

  saveAs(blob, `Dashboard_Cuestionario_${new Date().toISOString().slice(0, 10)}.xlsx`)
}
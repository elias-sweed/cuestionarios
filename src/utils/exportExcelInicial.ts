import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import type { Estudiante } from '../types';

// Ayudantes para transformar números en textos con íconos
const mapeoPuntaje = (p: number) => {
  if (p === 0) return "❌ No lo logra";
  if (p === 1) return "⏳ En proceso";
  if (p === 2) return "⭐ Lo logra";
  return "Sin evaluar";
};

const mapeoRiesgo = (r: number) => (r === 1 ? "⚠️ SÍ PRESENTÓ" : "✅ No presentó");

export const descargarReporteInicialExcel = async (
  estudiante: Estudiante,
  respuestas: Record<string, number>,
  riesgos: Record<string, number>,
  preguntas: { id: string; titulo: string; indicador: string }[]
) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Reporte 5 Años');

  // 1. ANCHO DE LAS COLUMNAS
  sheet.getColumn(1).width = 65; // Preguntas anchas
  sheet.getColumn(2).width = 30; // Indicador
  sheet.getColumn(3).width = 25; // Resultado

  // 2. TÍTULO PRINCIPAL (Fondo azul, letra blanca y centrado)
  sheet.mergeCells('A1:C2');
  const titulo = sheet.getCell('A1');
  titulo.value = 'REPORTE DE EVALUACIÓN SOCIOEMOCIONAL - INICIAL (5 AÑOS)';
  titulo.font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  titulo.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F46E5' } }; // Indigo
  titulo.alignment = { vertical: 'middle', horizontal: 'center' };

  sheet.addRow([]); // Fila vacía

  // 3. DATOS DEL ESTUDIANTE
  const filaDatos = sheet.addRow(['DATOS DEL ESTUDIANTE']);
  filaDatos.font = { bold: true, color: { argb: 'FF333333' } };
  filaDatos.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E7FF' } }; // Celeste clarito
  
  sheet.addRow(['Nombres:', estudiante.nombres]);
  sheet.addRow(['Apellidos:', estudiante.apellidos]);
  sheet.addRow(['Grado y Sección:', `Inicial (5 Años) - ${estudiante.seccion}`]);
  
  sheet.addRow([]); // Fila vacía

  // 4. TABLA DE EVALUACIÓN (Encabezados)
  const filaEntrevista = sheet.addRow(['--- RESULTADOS DE LA ENTREVISTA ---', '', '']);
  sheet.mergeCells(`A${filaEntrevista.number}:C${filaEntrevista.number}`);
  filaEntrevista.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  filaEntrevista.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF10B981' } }; // Verde
  filaEntrevista.alignment = { horizontal: 'center' };

  const encabezados = sheet.addRow(['PREGUNTA / ACTIVIDAD', 'DIMENSIÓN (INDICADOR)', 'NIVEL DE LOGRO']);
  encabezados.font = { bold: true };
  encabezados.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } }; // Gris claro

  // 🔥 VARIABLES PARA LOS CÁLCULOS ESTADÍSTICOS
  let totalLogra = 0;
  let totalProceso = 0;
  let totalNoLogra = 0;

  // Llenar las preguntas y contar los resultados
  preguntas.forEach((p) => {
    const puntaje = respuestas[p.id] ?? -1;
    
    // Contamos para el resumen final
    if (puntaje === 2) totalLogra++;
    if (puntaje === 1) totalProceso++;
    if (puntaje === 0) totalNoLogra++;

    sheet.addRow([p.titulo, p.indicador, mapeoPuntaje(puntaje)]);
  });

  sheet.addRow([]); // Fila vacía

  // 5. TABLA DE RIESGOS
  const filaRiesgo = sheet.addRow(['--- FACTORES DE RIESGO OBSERVADOS ---', '', '']);
  sheet.mergeCells(`A${filaRiesgo.number}:C${filaRiesgo.number}`);
  filaRiesgo.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  filaRiesgo.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEF4444' } }; // Rojo peligro
  filaRiesgo.alignment = { horizontal: 'center' };

  const encabezadosRiesgo = sheet.addRow(['CONDICIÓN OBSERVADA POR LA DOCENTE', '', 'ESTADO']);
  encabezadosRiesgo.font = { bold: true };
  encabezadosRiesgo.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } };

  // 🔥 CALCULAMOS EL TOTAL DE RIESGOS ENCONTRADOS
  let totalRiesgosEncontrados = 0;
  const agregarRiesgo = (texto: string, valor: number) => {
    if (valor === 1) totalRiesgosEncontrados++;
    sheet.addRow([texto, '', mapeoRiesgo(valor)]);
  };

  // Llenar riesgos
  agregarRiesgo('Muestra moretones en el cuerpo', riesgos.moretones);
  agregarRiesgo('Muestra marcas enrojecidas', riesgos.marcas);
  agregarRiesgo('Muestra rasguños', riesgos.rasgunos);
  agregarRiesgo('Se presenta desaseado frecuentemente', riesgos.desaseado);
  agregarRiesgo('No reconoce las partes íntimas de su cuerpo', riesgos.partes_intimas);
  agregarRiesgo('Se orina o defeca en su ropa', riesgos.esfinteres);
  agregarRiesgo('Refiere dolor o picor en zona íntima', riesgos.dolor_zona);

  sheet.addRow([]); // Fila vacía

  // 6. 🔥 NUEVA TABLA: CUADRO DE RESUMEN ESTADÍSTICO
  const filaResumen = sheet.addRow(['--- RESUMEN ESTADÍSTICO DEL ALUMNO ---', '', '']);
  sheet.mergeCells(`A${filaResumen.number}:C${filaResumen.number}`);
  filaResumen.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  filaResumen.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } }; // Azul oscuro
  filaResumen.alignment = { horizontal: 'center' };

  const encabezadosResumen = sheet.addRow(['MÉTRICA / INDICADOR', '', 'TOTAL OBTENIDO']);
  encabezadosResumen.font = { bold: true };
  encabezadosResumen.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDBEAFE' } }; // Azul clarito

  // Filas de totales
  const r1 = sheet.addRow(['⭐ Total de preguntas "Logradas"', '', totalLogra]);
  const r2 = sheet.addRow(['⏳ Total de preguntas "En Proceso"', '', totalProceso]);
  const r3 = sheet.addRow(['❌ Total de preguntas "No Logradas"', '', totalNoLogra]);
  const r4 = sheet.addRow(['⚠️ Total de Factores de Riesgo detectados', '', totalRiesgosEncontrados]);
  
  // Ponemos los totales centrados y en negrita para que destaquen
  [r1, r2, r3, r4].forEach(row => {
    row.getCell(3).font = { bold: true, size: 12 };
    row.getCell(3).alignment = { horizontal: 'center' };
  });

  // 7. PONER BORDES A TODAS LAS CELDAS LLENAS
  sheet.eachRow((row) => {
    row.eachCell((cell) => {
      // Solo pone borde si la celda tiene algún valor o color (ignora las filas vacías)
      if (cell.value !== null && cell.value !== undefined && cell.value !== '') {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      }
    });
  });

  // 8. GENERAR Y DESCARGAR EL ARCHIVO
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `Reporte_Inicial_${estudiante.nombres}_${estudiante.apellidos}.xlsx`);
};
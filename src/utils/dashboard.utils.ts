export const agruparPorGrado = (data: any[]) => {
  const conteo: Record<string, number> = {}
  data.forEach((item) => {
    const est = Array.isArray(item.estudiantes) ? item.estudiantes[0] : item.estudiantes
    const gradoRaw = est?.grado != null ? String(est.grado).trim() : "Sin grado"
    const grado = gradoRaw === "0" ? "Inicial" : gradoRaw === "sin_grado" ? "Sin grado" : `${gradoRaw}° Grado`
    conteo[grado] = (conteo[grado] || 0) + 1
  })
  return Object.entries(conteo).map(([name, value]) => ({ name, value }))
}

export const agruparPorSeccion = (data: any[]) => {
  const conteo: Record<string, number> = {}
  data.forEach((item) => {
    const seccion = item.estudiantes?.seccion || "Sin sección"
    conteo[seccion] = (conteo[seccion] || 0) + 1
  })
  return Object.entries(conteo).map(([name, value]) => ({ name, value }))
}

// 🔥 AHORA AGRUPA POR EL TEXTO DE LA PREGUNTA
export const analisisPorPregunta = (data: any[]) => {
  const conteo: Record<string, Record<string, number>> = {}

  data.forEach((item) => {
    const p = item.preguntas?.texto || `Pregunta ID: ${item.pregunta_id}`
    const r = item.respuesta

    if (!conteo[p]) conteo[p] = {}
    conteo[p][r] = (conteo[p][r] || 0) + 1
  })

  return Object.entries(conteo).map(([pregunta, respuestas]) => ({
    pregunta,
    respuestas,
  }))
}

export const emocionesPredominantes = (data: any[]) => {
  const conteo: Record<string, number> = {}
  data.forEach((item) => {
    const r = item.respuesta
    if (typeof r === "string" && r.length <= 2) {
      conteo[r] = (conteo[r] || 0) + 1
    }
  })
  return Object.entries(conteo).map(([name, value]) => ({ name, value }))
}

// 🔥 CONVERSIÓN A ESCALA 1 A 20
export const detectarAlumnosRiesgo = (data: any[]) => {
  const alumnos: Record<string, any> = {}
  
  // Se agregan indicadores críticos tanto de Primaria como Inicial
  const indicadoresRiesgo = new Set(['😢', '😡', '😟', '😞', '😔', '🙁', '😣', '😩', 'NO LOGRA', 'Sí (Riesgo)'])

  data.forEach((item) => {
    const estId = item.estudiante_id
    if (!estId) return

    if (!alumnos[estId]) {
      alumnos[estId] = {
        estudiante_id: estId,
        nombres: item.estudiantes?.nombres || '',
        apellidos: item.estudiantes?.apellidos || '',
        grado: item.estudiantes?.grado,
        seccion: item.estudiantes?.seccion,
        totalRespuestas: 0,
        negativas: 0,
      }
    }

    const resp = item.respuesta
    alumnos[estId].totalRespuestas++
    
    // Si la respuesta exacta es un indicador de riesgo
    if (typeof resp === 'string' && indicadoresRiesgo.has(resp.trim())) {
      alumnos[estId].negativas++
    }
  })

  return Object.values(alumnos)
    .map((alumno: any) => {
      // Porcentaje de riesgo decimal
      const porcentaje = alumno.totalRespuestas > 0 ? alumno.negativas / alumno.totalRespuestas : 0
      
      // Convertir a escala 1 a 20
      const score20 = Math.round(porcentaje * 20)

      let riesgo = 'Bajo'
      if (score20 >= 14) riesgo = 'Alto'       // >= 14 de 20
      else if (score20 >= 8) riesgo = 'Medio'  // 8 a 13 de 20

      return {
        ...alumno,
        score: score20,
        riesgo,
      }
    })
    .filter(a => a.totalRespuestas >= 3) 
    .sort((a, b) => b.score - a.score)   
}
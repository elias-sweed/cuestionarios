export const agruparPorGrado = (data: any[]) => {
  const conteo: Record<string, number> = {}

  data.forEach((item) => {
    const grado = item.estudiantes?.grado || "Sin grado"
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

// 🔥 NUEVAS FUNCIONES (las que te pedí antes)
export const analisisPorPregunta = (data: any[]) => {
  const conteo: Record<number, Record<string, number>> = {}

  data.forEach((item) => {
    const p = item.pregunta_id
    const r = item.respuesta

    if (!conteo[p]) conteo[p] = {}
    conteo[p][r] = (conteo[p][r] || 0) + 1
  })

  return Object.entries(conteo).map(([pregunta, respuestas]) => ({
    pregunta: Number(pregunta),
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

// ==================== DETECTAR ALUMNOS EN RIESGO ====================
export const detectarAlumnosRiesgo = (data: any[]) => {
  const alumnos: Record<string, any> = {}

  // Emociones negativas (puedes editar esta lista)
  const emocionesNegativas = new Set(['😢', '😡', '😟', '😞', '😔', '🙁', '😣', '😩'])

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
    const esEmocion = typeof resp === 'string' && resp.length <= 3

    alumnos[estId].totalRespuestas++
    if (esEmocion && emocionesNegativas.has(resp)) {
      alumnos[estId].negativas++
    }
  })

  return Object.values(alumnos)
    .map((alumno: any) => {
      const score = alumno.totalRespuestas > 0 
        ? alumno.negativas / alumno.totalRespuestas 
        : 0

      let riesgo = 'bajo'
      if (score >= 0.7) riesgo = 'alto'
      else if (score >= 0.4) riesgo = 'medio'

      return {
        ...alumno,
        score: Number(score.toFixed(2)),
        riesgo,
      }
    })
    .filter(a => a.totalRespuestas >= 3) 
    .sort((a, b) => b.score - a.score)   
}
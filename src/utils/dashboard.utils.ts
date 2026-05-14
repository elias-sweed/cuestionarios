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
    const est = Array.isArray(item.estudiantes) ? item.estudiantes[0] : item.estudiantes
    const seccion = est?.seccion || "Sin sección"
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
    const tipoPregunta = String(item.preguntas?.tipo || "").toLowerCase().trim()
    if (tipoPregunta !== "emocion") return

    if (typeof r === "string" && r.trim()) {
      const emocion = r.trim()
      conteo[emocion] = (conteo[emocion] || 0) + 1
    }
  })
  return Object.entries(conteo).map(([name, value]) => ({ name, value }))
}

function getEst(item: any) {
  return Array.isArray(item.estudiantes) ? item.estudiantes[0] : item.estudiantes
}

// 🔥 CONVERSIÓN A ESCALA 1 A 20
export const detectarAlumnosRiesgo = (data: any[], debug = false) => {
  const alumnos: Record<string, any> = {}
  
  // Se agregan indicadores críticos tanto de Primaria como Inicial
  const indicadoresRiesgo = new Set(['😢', '😡', '😟', '😞', '😔', '🙁', '😣', '😩', 'NO LOGRA', 'Sí (Riesgo)'])

  data.forEach((item) => {
    const estId = item.estudiante_id
    if (!estId) return

    if (!alumnos[estId]) {
      const est = getEst(item)
      alumnos[estId] = {
        estudiante_id: estId,
        nombres: est?.nombres || '',
        apellidos: est?.apellidos || '',
        grado: est?.grado,
        seccion: est?.seccion,
        totalRespuestas: 0,
        negativas: 0,
      }
    }

    const resp = item.respuesta
    alumnos[estId].totalRespuestas++
    
    if (typeof resp === 'string' && indicadoresRiesgo.has(resp.trim())) {
      alumnos[estId].negativas++
    }
  })

  const resultado = Object.values(alumnos)
    .map((alumno: any) => {
      const porcentaje = alumno.totalRespuestas > 0 ? alumno.negativas / alumno.totalRespuestas : 0
      const score20 = Math.round(porcentaje * 20)

      let riesgo = 'Bajo'
      if (score20 >= 14) riesgo = 'Alto'
      else if (score20 >= 8) riesgo = 'Medio'

      return {
        ...alumno,
        score: score20,
        riesgo,
      }
    })
    .filter(a => a.totalRespuestas >= 3) 
    .sort((a, b) => b.score - a.score)

  if (debug) {
    console.log('🔍 DEBUG detectarAlumnosRiesgo:')
    resultado.forEach((a: any) => {
      console.log(`  ${a.apellidos}, ${a.nombres} | neg: ${a.negativas}/${a.totalRespuestas} = ${(a.negativas/a.totalRespuestas*100).toFixed(1)}% | score: ${a.score}/20 | riesgo: ${a.riesgo}`)
    })
  }

  return resultado
}

// IDs de preguntas de Inicial (301-312) y factores de riesgo (313-319)
const INICIAL_QUESTION_IDS = new Set([301, 302, 303, 304, 305, 306, 307, 308, 309, 310, 311, 312])
const INICIAL_RIESGO_IDS = new Set([313, 314, 315, 316, 317, 318, 319])

// Mapeo inverso de texto a puntaje
const textToScore = (text: string): number | null => {
  const t = text.trim().toUpperCase()
  if (t === 'LOGRADO') return 2
  if (t === 'EN PROCESO') return 1
  if (t === 'NO LOGRA') return 0
  return null
}

// 🔥 Detección de riesgo específica para Inicial
// Separa las 12 preguntas (puntaje 0-2) de los 7 factores de riesgo (Sí/No)
export const detectarAlumnosRiesgoInicial = (data: any[]) => {
  const alumnos: Record<string, any> = {}

  data.forEach((item) => {
    const estId = item.estudiante_id
    if (!estId) return

    if (!alumnos[estId]) {
      const est = getEst(item)
      alumnos[estId] = {
        estudiante_id: estId,
        nombres: est?.nombres || '',
        apellidos: est?.apellidos || '',
        grado: est?.grado,
        seccion: est?.seccion,
        preguntas: [] as number[],
        riesgosDetectados: 0,
      }
    }

    const pid = Number(item.pregunta_id)
    const resp = item.respuesta

    if (INICIAL_QUESTION_IDS.has(pid)) {
      const score = textToScore(typeof resp === 'string' ? resp : '')
      if (score !== null) {
        alumnos[estId].preguntas.push(score)
      }
    }

    if (INICIAL_RIESGO_IDS.has(pid)) {
      if (typeof resp === 'string' && resp.trim() === 'Sí (Riesgo)') {
        alumnos[estId].riesgosDetectados++
      }
    }
  })

  return Object.values(alumnos)
    .map((alumno: any) => {
      const totalPreguntas = alumno.preguntas.length
      const logradas = alumno.preguntas.filter((s: number) => s === 2).length
      const enProceso = alumno.preguntas.filter((s: number) => s === 1).length
      const noLogra = alumno.preguntas.filter((s: number) => s === 0).length

      let score20 = 0
      let riesgo = 'Bajo'

      if (totalPreguntas > 0) {
        const suma = alumno.preguntas.reduce((a: number, b: number) => a + b, 0)
        const promedio = suma / totalPreguntas // 0 a 2

        const riesgoPreguntas = 1 - (promedio / 2)
        const puntajePreguntas = riesgoPreguntas * 14
        const puntajeRiesgos = Math.min(alumno.riesgosDetectados, 6)

        score20 = Math.round(puntajePreguntas + puntajeRiesgos)
      }

      if (score20 >= 12) riesgo = 'Alto'
      else if (score20 >= 6) riesgo = 'Medio'

      let estado = '✅ Bueno'
      if (riesgo === 'Alto') estado = '🔴 Malo'
      else if (riesgo === 'Medio') estado = '🟡 Regular'

      return {
        ...alumno,
        preguntasLogradas: logradas,
        preguntasEnProceso: enProceso,
        preguntasNoLogra: noLogra,
        puntajeTotalPreguntas: logradas * 2 + enProceso * 1,
        factoresRiesgo: alumno.riesgosDetectados,
        score: score20,
        riesgo,
        estado,
      }
    })
    .filter(a => (a.preguntasLogradas + a.preguntasEnProceso + a.preguntasNoLogra) >= 3)
    .sort((a, b) => b.score - a.score)
}
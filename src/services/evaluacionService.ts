import { supabase } from "../lib/supabaseClient";
import { MAPEO_DB } from "../constants/preguntasInicial";

export const guardarEvaluacionInicialDB = async (
  estudianteId: string, 
  respuestas: Record<string, number>, 
  riesgos: Record<string, number>
) => {
  const fechaActual = new Date().toISOString();
  const payload = [];

  // Transformar puntuaciones (0,1,2) a texto para la BD
  for (const [key, value] of Object.entries(respuestas)) {
    const textoValor = value === 2 ? "LOGRADO" : value === 1 ? "EN PROCESO" : "NO LOGRA";
    payload.push({
      estudiante_id: estudianteId,
      pregunta_id: MAPEO_DB[key],
      respuesta: textoValor,
      fecha: fechaActual
    });
  }

  // Transformar riesgos (checkboxes)
  for (const [key, value] of Object.entries(riesgos)) {
    payload.push({
      estudiante_id: estudianteId,
      pregunta_id: MAPEO_DB[key],
      respuesta: value === 1 ? "Sí (Riesgo)" : "No",
      fecha: fechaActual
    });
  }

  const { error } = await supabase.from("respuestas").insert(payload);
  if (error) throw error;
  
  return true;
};
import { supabase } from "../lib/supabaseClient"

export const getRespuestasDashboard = async () => {
  const { data, error } = await supabase
    .from("respuestas")
    .select(`
      estudiante_id,
      pregunta_id,
      respuesta,
      estudiantes (
        id,
        nombres,
        apellidos,
        grado,
        seccion
      )
    `)
    .order('fecha', { ascending: false })

  if (error) {
    console.error(error)
    throw error
  }

  return data || []
}
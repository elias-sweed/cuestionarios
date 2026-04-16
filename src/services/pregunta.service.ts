import { supabase } from "../lib/supabaseClient"

export const obtenerPreguntasPorNivel = async (nivel: string) => {
  const { data, error } = await supabase
    .from("preguntas")
    .select("*")
    .eq("nivel", nivel)
    .order("orden")

  if (error) throw error

  return data
}
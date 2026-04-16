import { supabase } from "../lib/supabaseClient"
import type { Estudiante } from "../types"

export const crearEstudiante = async (data: Estudiante) => {
  const { data: estudiante, error } = await supabase
    .from("estudiantes")
    .insert([data])
    .select()
    .single()

  if (error) throw error

  return estudiante
}
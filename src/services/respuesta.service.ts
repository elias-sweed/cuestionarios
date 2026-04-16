import { supabase } from "../lib/supabaseClient"
import type { Respuesta } from "../types"

export const guardarRespuesta = async (data: Respuesta) => {
  const { error } = await supabase
    .from("respuestas")
    .insert([data])

  if (error) throw error
}
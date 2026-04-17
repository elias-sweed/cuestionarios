import { supabase } from "../lib/supabaseClient"

export const getRol = async (userId: string) => {
  const { data, error } = await supabase
    .from("roles")
    .select("rol")
    .eq("id", userId)
    .single()

  if (error) throw error

  return data?.rol
}
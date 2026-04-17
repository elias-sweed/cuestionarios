import { supabase } from "../lib/supabaseClient"

export const login = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) throw error

  return data
}

export const logout = async () => {
  await supabase.auth.signOut()
}

export const getSession = async () => {
  const { data } = await supabase.auth.getSession()
  return data.session
}
import { useEffect, useState } from "react"
import { supabase } from "../lib/supabaseClient"

export const useAuth = () => {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Carga inicial de la sesión
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    // Escucha cambios en tiempo real (logout, login, etc.)
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      // Ya no hace falta el "if (!session)" porque el listener ya recibe null cuando se hace logout
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  return { session, loading }
}
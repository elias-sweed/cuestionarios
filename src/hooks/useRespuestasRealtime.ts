import { useEffect, useState } from "react"
import { supabase } from "../lib/supabaseClient"

export const useRespuestasRealtime = () => {
  const [respuestas, setRespuestas] = useState<any[]>([])

  useEffect(() => {
    // cargar inicial
    const fetchData = async () => {
      const { data } = await supabase
        .from("respuestas")
        .select("*, estudiantes(nombres, grado)")

      setRespuestas(data || [])
    }

    fetchData()

    // suscripción realtime
    const channel = supabase
      .channel("respuestas-channel")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "respuestas"
        },
        (payload) => {
          setRespuestas((prev) => [...prev, payload.new])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return respuestas
}
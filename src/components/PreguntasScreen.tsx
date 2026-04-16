import { useEffect, useState } from "react"
import { obtenerPreguntasPorNivel } from "../services/pregunta.service"
import { guardarRespuesta } from "../services/respuesta.service"
import { mapNivel } from "../utils/mapNivel"
import PreguntaRenderer from "./preguntas/PreguntaRenderer"
import type { Pregunta } from "../types"
import ProgressBar from "./ProgressBar"

export default function PreguntasScreen({ estudiante }: any) {
  const [preguntas, setPreguntas] = useState<Pregunta[]>([])
  const [index, setIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  const nivel = mapNivel(estudiante.grado)

  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await obtenerPreguntasPorNivel(nivel)
        setPreguntas(data)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    cargar()
  }, [])

  const handleResponder = async (valor: any) => {
    const pregunta = preguntas[index]

    await guardarRespuesta({
      estudiante_id: estudiante.id,
      pregunta_id: pregunta.id,
      respuesta: valor
    })

    setIndex((prev) => prev + 1)
  }

  if (loading) return <div className="p-4">Cargando...</div>

  if (index >= preguntas.length) {
    return <div className="p-4">✅ Cuestionario terminado</div>
  }

  const pregunta = preguntas[index]

  return (
    <div className="max-w-xl mx-auto p-4 space-y-6">

  <ProgressBar
    actual={index + 1}
    total={preguntas.length}
  />

  <h2 className="text-lg font-semibold">
    Pregunta {index + 1} de {preguntas.length}
  </h2>

  <p className="text-xl">{pregunta.texto}</p>

  <PreguntaRenderer
    pregunta={pregunta}
    onResponder={handleResponder}
  />
</div>
  )
}
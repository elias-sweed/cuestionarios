import type { Pregunta } from "../../types"
import PreguntaOpcion from "./PreguntaOpcion"
import PreguntaEmocion from "./PreguntaEmocion"
import PreguntaAbierta from "./PreguntaAbierta"

interface Props {
  pregunta: Pregunta
  onResponder: (valor: string) => void // Cambiamos de any a string
}

export default function PreguntaRenderer({ pregunta, onResponder }: Props) {

  switch (pregunta.tipo) {
    case "opcion":
      return <PreguntaOpcion pregunta={pregunta} onResponder={onResponder} />

    case "emocion":
      return <PreguntaEmocion pregunta={pregunta} onResponder={onResponder} />

    case "abierto":
      return <PreguntaAbierta pregunta={pregunta} onResponder={onResponder} />

    default:
      return (
        <div className="p-4 bg-yellow-50 text-yellow-700 rounded-xl border border-yellow-200 text-center">
          Tipo de pregunta no soportado: {pregunta.tipo}
        </div>
      )
  }
}
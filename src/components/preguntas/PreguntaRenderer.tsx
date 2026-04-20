import type { Pregunta } from "../../types"
import PreguntaOpcion from "./PreguntaOpcion"
import PreguntaEmocion from "./PreguntaEmocion"
import PreguntaAbierta from "./PreguntaAbierta"
import PreguntaDibujo from "./PreguntaDibujo"
import PreguntaMultiple from "./PreguntaMultiple"

interface Props {
  pregunta: Pregunta
  onResponder: (valor: string) => void
}

export default function PreguntaRenderer({ pregunta, onResponder }: Props) {

  switch (pregunta.tipo) {
    case "opcion":
      return <PreguntaOpcion pregunta={pregunta} onResponder={onResponder} />

    case "emocion":
      return <PreguntaEmocion pregunta={pregunta} onResponder={onResponder} />

    case "abierto":
      return <PreguntaAbierta pregunta={pregunta} onResponder={onResponder} />

    case "dibujo":
      return <PreguntaDibujo pregunta={pregunta} onResponder={onResponder} />

    case "multiple":
      return <PreguntaMultiple pregunta={pregunta} onResponder={onResponder} />

    default:
      return (
        <div className="p-4 bg-yellow-50 text-yellow-700 rounded-xl border border-yellow-200 text-center">
          Tipo de pregunta no soportado: {pregunta.tipo}
        </div>
      )
  }
}
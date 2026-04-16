import type { Pregunta } from "../../types"
import PreguntaOpcion from "./PreguntaOpcion"
import PreguntaEmocion from "./PreguntaEmocion"
import PreguntaAbierta from "./PreguntaAbierta"

interface Props {
  pregunta: Pregunta
  onResponder: (valor: any) => void
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
      return <p>Tipo no soportado</p>
  }
}
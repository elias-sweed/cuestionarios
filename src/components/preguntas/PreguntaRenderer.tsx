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
        /* CAMBIO: Estilo oscuro para el mensaje de error de tipo no soportado */
        <div className="p-6 bg-slate-800/50 text-blue-300 rounded-2xl border border-blue-500/30 text-center shadow-[0_0_15px_rgba(59,130,246,0.2)]">
          <span className="block text-3xl mb-2">🔍</span>
          <p className="font-bold">Tipo de pregunta no reconocido</p>
          <p className="text-sm opacity-70">Soporte para: {pregunta.tipo}</p>
        </div>
      )
  }
}
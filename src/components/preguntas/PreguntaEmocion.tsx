import { useState } from "react"
import type { Pregunta } from "../../types"

interface Props {
  pregunta: Pregunta
  onResponder: (valor: string) => void
}

export default function PreguntaEmocion({ pregunta, onResponder }: Props) {
  const [seleccion, setSeleccion] = useState<string | null>(null)
  const [error, setError] = useState("")

  const handleContinuar = () => {
    if (!seleccion) {
      setError("Selecciona una emoción")
      return
    }

    setError("")
    onResponder(seleccion)
  }

  return (
    <div className="space-y-4 text-center">
      <div className="flex justify-center gap-4 text-4xl">
        {pregunta.opciones?.map((emoji) => (
          <button
            key={emoji}
            onClick={() => setSeleccion(emoji)}
            className={seleccion === emoji ? "scale-125" : ""}
          >
            {emoji}
          </button>
        ))}
      </div>

      {error && <p className="text-red-500">{error}</p>}

      <button onClick={handleContinuar} className="bg-green-600 text-white px-4 py-2 rounded-xl">
        Continuar
      </button>
    </div>
  )
}
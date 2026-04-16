import { useState } from "react"
import type { Pregunta } from "../../types"

interface Props {
  pregunta: Pregunta
  onResponder: (valor: string) => void
}

export default function PreguntaOpcion({ pregunta, onResponder }: Props) {
  const [seleccion, setSeleccion] = useState<string | null>(null)
  const [error, setError] = useState("")

  const handleContinuar = () => {
    if (!seleccion) {
      setError("Selecciona una opción")
      return
    }

    setError("")
    onResponder(seleccion)
  }

  return (
    <div className="space-y-4">
      {pregunta.opciones?.map((op) => (
        <button
          key={op}
          onClick={() => setSeleccion(op)}
          className={`w-full p-3 rounded-xl ${
            seleccion === op ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          {op}
        </button>
      ))}

      {error && <p className="text-red-500">{error}</p>}

      <button onClick={handleContinuar} className="bg-green-600 text-white px-4 py-2 rounded-xl">
        Continuar
      </button>
    </div>
  )
}
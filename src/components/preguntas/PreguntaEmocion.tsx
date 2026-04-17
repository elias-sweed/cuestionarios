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
      setError("Por favor, selecciona cómo te sientes.")
      return
    }

    setError("")
    onResponder(seleccion)
  }

  return (
    <div className="space-y-6 text-center">
      <div className="flex flex-wrap justify-center gap-4">
        {pregunta.opciones?.map((emoji) => (
          <button
            key={emoji}
            onClick={() => {
              setSeleccion(emoji)
              setError("")
            }}
            className={`text-5xl p-4 rounded-2xl transition-all duration-200 ${
              seleccion === emoji 
                ? "bg-blue-100 scale-110 shadow-inner" 
                : "bg-gray-50 hover:bg-gray-100 hover:scale-110 opacity-80 hover:opacity-100"
            }`}
          >
            {emoji}
          </button>
        ))}
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-600 text-sm font-medium rounded-lg border border-red-100 flex items-center gap-2 justify-center">
          <span>⚠️</span> {error}
        </div>
      )}

      <button 
        onClick={handleContinuar} 
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 px-4 rounded-xl transition-all duration-200 shadow-md shadow-blue-600/20"
      >
        Continuar
      </button>
    </div>
  )
}
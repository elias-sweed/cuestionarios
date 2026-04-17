import { useState } from "react"
import type { Pregunta } from "../../types" // Añadido para mantener consistencia

interface Props {
  pregunta: Pregunta
  onResponder: (valor: string) => void
}

export default function PreguntaAbierta({ onResponder }: Props) {
  const [valor, setValor] = useState("")
  const [error, setError] = useState("")

  const handleContinuar = () => {
    if (!valor.trim()) {
      setError("Debes escribir una respuesta antes de continuar.")
      return
    }

    setError("")
    onResponder(valor.trim()) // Usamos trim() para guardar el texto limpio sin espacios extras
  }

  return (
    <div className="space-y-6">
      <textarea
        value={valor}
        onChange={(e) => {
          setValor(e.target.value)
          if (error) setError("")
        }}
        className="w-full border-2 border-gray-200 bg-gray-50 p-4 rounded-xl focus:bg-white focus:ring-0 focus:border-blue-600 outline-none transition-all resize-y min-h-[150px] text-gray-700"
        placeholder="Escribe tu respuesta aquí..."
      />

      {error && (
        <div className="p-3 bg-red-50 text-red-600 text-sm font-medium rounded-lg border border-red-100 flex items-center gap-2">
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
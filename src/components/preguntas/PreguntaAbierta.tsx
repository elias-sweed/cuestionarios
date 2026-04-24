import { useState } from "react"
import type { Pregunta } from "../../types"

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
    onResponder(valor.trim())
  }

  return (
    <div className="space-y-6">
      <textarea
        value={valor}
        onChange={(e) => {
          setValor(e.target.value)
          if (error) setError("")
        }}
        /* Estilo oscuro con foco azul neón */
        className="w-full border-2 border-blue-500/20 bg-slate-800/50 p-4 rounded-2xl focus:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-y min-h-[150px] text-white placeholder:text-slate-500"
        placeholder="Escribe tu respuesta aquí..."
      />

      {error && (
        <div className="p-3 bg-red-900/30 text-red-400 text-sm font-medium rounded-lg border border-red-500/20 flex items-center gap-2 animate-shake">
          <span>⚠️</span> {error}
        </div>
      )}

      <button
        onClick={handleContinuar}
        /* Botón con sombra de resplandor neón */
        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-4 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] active:scale-95"
      >
        Continuar
      </button>
    </div>
  )
}
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

  const opcionesSeguras = pregunta.opciones && pregunta.opciones.length > 0 
    ? pregunta.opciones 
    : ["😄", "😐", "😢"]

  return (
    <div className="space-y-8 text-center">
      {/* Contenedor de emojis */}
      <div className="flex flex-wrap justify-center gap-6">
        {opcionesSeguras.map((emoji) => {
          const isSelected = seleccion === emoji;
          return (
            <button
              key={emoji}
              type="button"
              onClick={() => {
                setSeleccion(emoji)
                setError("")
              }}
              className={`text-6xl p-6 rounded-3xl transition-all duration-300 transform active:scale-90 ${
                isSelected 
                  ? "bg-blue-600/30 scale-125 shadow-[0_0_30px_rgba(37,99,235,0.5)] border-2 border-blue-400 opacity-100" 
                  : "bg-slate-800/40 border-2 border-transparent hover:bg-slate-700/50 hover:scale-110 opacity-60 hover:opacity-100"
              }`}
            >
              <span className={`block transition-transform duration-300 ${isSelected ? 'animate-bounce' : ''}`}>
                {emoji}
              </span>
            </button>
          )
        })}
      </div>

      {/* Mensaje de error neón */}
      {error && (
        <div className="p-3 bg-red-900/30 text-red-400 text-sm font-bold rounded-xl border border-red-500/20 flex items-center gap-2 justify-center animate-shake">
          <span>⚠️</span> {error}
        </div>
      )}

      {/* Botón de continuar con resplandor */}
      <button 
        onClick={handleContinuar} 
        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black text-xl py-4 px-4 rounded-2xl transition-all duration-300 shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_35px_rgba(37,99,235,0.6)] active:scale-95"
      >
        Continuar
      </button>
    </div>
  )
}
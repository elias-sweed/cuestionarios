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
      setError("Por favor, selecciona una opción para continuar.")
      return
    }

    setError("")
    onResponder(seleccion)
  }

  const opcionesSeguras = pregunta.opciones && pregunta.opciones.length > 0 
    ? pregunta.opciones 
    : ["Sí", "No"]

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        {opcionesSeguras.map((op) => {
          const isSelected = seleccion === op;
          return (
            <button
              key={op}
              type="button"
              onClick={() => {
                setSeleccion(op)
                setError("")
              }}
              className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-300 transform active:scale-[0.98] font-bold text-lg ${
                isSelected 
                  ? "border-blue-500 bg-blue-600/20 text-white shadow-[0_0_20px_rgba(59,130,246,0.4)]" 
                  : "border-blue-500/10 bg-slate-800/40 text-blue-100/70 hover:border-blue-500/40 hover:bg-slate-700/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <span>{op}</span>
                {/* Indicador circular neón */}
                <div className={`w-6 h-6 rounded-full border-2 transition-all duration-300 ${
                  isSelected 
                    ? "bg-blue-500 border-transparent shadow-[0_0_10px_rgba(59,130,246,0.8)]" 
                    : "border-blue-500/30 bg-transparent"
                }`}>
                  {isSelected && (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {error && (
        <div className="p-4 bg-red-900/30 text-red-400 text-sm font-bold rounded-xl border border-red-500/20 flex items-center gap-2 animate-shake">
          <span>⚠️</span> {error}
        </div>
      )}

      <button 
        onClick={handleContinuar} 
        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black text-xl py-4 px-4 rounded-2xl transition-all duration-300 shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_35px_rgba(37,99,235,0.6)] active:scale-95"
      >
        Continuar
      </button>
    </div>
  )
}
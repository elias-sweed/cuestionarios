import { useState } from "react"
import type { Pregunta } from "../../types"

interface Props {
  pregunta: Pregunta
  onResponder: (valor: string) => void
}

export default function PreguntaMultiple({ pregunta, onResponder }: Props) {
  const [seleccionados, setSeleccionados] = useState<string[]>([])
  const [error, setError] = useState("")

  const toggleSeleccion = (opcion: string) => {
    if (seleccionados.includes(opcion)) {
      setSeleccionados(seleccionados.filter((item) => item !== opcion))
    } else {
      setSeleccionados([...seleccionados, opcion])
    }
    setError("")
  }

  const handleContinuar = () => {
    if (seleccionados.length === 0) {
      setError("¡Selecciona al menos una actividad que sepas hacer solo!")
      return
    }
    onResponder(seleccionados.join(", "))
  }

  const opcionesSeguras = pregunta.opciones && pregunta.opciones.length > 0 
    ? pregunta.opciones 
    : ["Comer solo 🍎", "Vestirme 👕", "Bañarme 🛀", "Hacer la tarea 📝", "Ordenar mis juguetes 🧸"]

  return (
    <div className="space-y-6">
      <p className="text-center text-blue-400 font-bold mb-2 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]">
        Puedes marcar varias opciones:
      </p>

      <div className="grid gap-4">
        {opcionesSeguras.map((op) => {
          const isSelected = seleccionados.includes(op)
          return (
            <button
              key={op}
              type="button"
              onClick={() => toggleSeleccion(op)}
              className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-300 flex items-center justify-between transform active:scale-[0.98] ${
                isSelected
                  ? "border-blue-500 bg-blue-600/20 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                  : "border-blue-500/10 bg-slate-800/40 text-blue-100/70 hover:border-blue-500/40 hover:bg-slate-700/50"
              }`}
            >
              <span className={`font-bold text-lg transition-colors ${isSelected ? "text-white" : ""}`}>
                {op}
              </span>
              
              {/* Checkbox visual neón */}
              <div className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${
                isSelected 
                  ? "bg-blue-500 border-transparent shadow-[0_0_10px_rgba(59,130,246,0.8)]" 
                  : "border-blue-500/30 bg-transparent"
              }`}>
                {isSelected && <span className="text-white text-sm">✓</span>}
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
import { useState } from "react"
import type { Pregunta } from "../../types"

interface Props {
  pregunta: Pregunta
  onResponder: (valor: string) => void
}

export default function PreguntaDibujo({ pregunta, onResponder }: Props) {
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
      setError("¡Elige al menos una parte tocándola con tu dedito o el mouse! 👆")
      return
    }
    onResponder(seleccionados.join(", "))
  }

  const opciones = pregunta.opciones?.length 
    ? pregunta.opciones 
    : ["Cabeza 👦", "Cara 😊", "Brazos 💪", "Manos ✋", "Piernas 🦵", "Pies 🦶"]

  return (
    <div className="space-y-6">
      <p className="text-center text-blue-400 font-black text-lg mb-4 animate-pulse drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]">
        ¡Puedes elegir todas las que quieras!
      </p>
      
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {opciones.map((op) => {
          const isSelected = seleccionados.includes(op)
          return (
            <button
              key={op}
              type="button"
              onClick={() => toggleSeleccion(op)}
              className={`p-5 rounded-3xl text-lg font-black transition-all duration-300 transform active:scale-90 ${
                isSelected
                  ? "bg-blue-600 text-white scale-105 shadow-[0_0_20px_rgba(37,99,235,0.6)] border-transparent ring-2 ring-blue-300"
                  : "bg-slate-800/40 text-blue-100 border-2 border-blue-500/20 hover:border-blue-400/50 hover:bg-slate-700/50 hover:scale-105"
              }`}
            >
              {op}
            </button>
          )
        })}
      </div>

      {error && (
        <div className="p-4 bg-red-900/30 text-red-400 text-sm font-bold rounded-2xl border-2 border-red-500/20 text-center animate-bounce shadow-[0_0_15px_rgba(239,68,68,0.2)]">
          {error}
        </div>
      )}

      <button
        onClick={handleContinuar}
        className="w-full mt-8 bg-emerald-500 hover:bg-emerald-400 text-white font-black text-xl py-5 px-4 rounded-2xl transition-all duration-300 shadow-[0_0_25px_rgba(16,185,129,0.4)] hover:shadow-[0_0_35px_rgba(16,185,129,0.6)] transform hover:scale-[1.02] active:scale-95"
      >
        ¡Listo, continuar! 🚀
      </button>
    </div>
  )
}
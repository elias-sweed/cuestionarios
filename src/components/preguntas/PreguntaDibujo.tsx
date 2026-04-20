import { useState } from "react"
import type { Pregunta } from "../../types"

interface Props {
  pregunta: Pregunta
  onResponder: (valor: string) => void
}

export default function PreguntaDibujo({ pregunta, onResponder }: Props) {
  // Aquí guardaremos todas las opciones que el niño vaya tocando
  const [seleccionados, setSeleccionados] = useState<string[]>([])
  const [error, setError] = useState("")

  const toggleSeleccion = (opcion: string) => {
    if (seleccionados.includes(opcion)) {
      // Si ya la había tocado, la quitamos
      setSeleccionados(seleccionados.filter((item) => item !== opcion))
    } else {
      // Si no la había tocado, la agregamos
      setSeleccionados([...seleccionados, opcion])
    }
    setError("")
  }

  const handleContinuar = () => {
    if (seleccionados.length === 0) {
      setError("¡Elige al menos una parte tocándola con tu dedito o el mouse! 👆")
      return
    }

    // Unimos las respuestas con coma para guardarlas como un solo texto en Supabase
    onResponder(seleccionados.join(", "))
  }

  // Si tu base de datos no tiene las opciones cargadas para esta pregunta, 
  // usamos estas por defecto que son amigables para niños.
  const opciones = pregunta.opciones?.length 
    ? pregunta.opciones 
    : ["Cabeza 👦", "Cara 😊", "Brazos 💪", "Manos ✋", "Piernas 🦵", "Pies 🦶"]

  return (
    <div className="space-y-6">
      <p className="text-center text-blue-500 font-bold mb-4 animate-pulse">
        ¡Puedes elegir todas las que quieras!
      </p>
      
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {opciones.map((op) => {
          const isSelected = seleccionados.includes(op)
          return (
            <button
              key={op}
              onClick={() => toggleSeleccion(op)}
              className={`p-4 rounded-3xl text-lg font-bold transition-all duration-300 transform ${
                isSelected
                  ? "bg-blue-500 text-white scale-105 shadow-xl shadow-blue-500/40 ring-4 ring-blue-300"
                  : "bg-white text-gray-600 border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 hover:scale-105"
              }`}
            >
              {op}
            </button>
          )
        })}
      </div>

      {error && (
        <div className="p-4 bg-red-100 text-red-600 text-sm font-bold rounded-2xl border-2 border-red-200 text-center animate-bounce">
          {error}
        </div>
      )}

      <button
        onClick={handleContinuar}
        className="w-full mt-8 bg-green-500 hover:bg-green-600 text-white font-black text-xl py-4 px-4 rounded-2xl transition-all duration-200 shadow-lg shadow-green-500/30 transform hover:scale-[1.02]"
      >
        ¡Listo, continuar! 🚀
      </button>
    </div>
  )
}
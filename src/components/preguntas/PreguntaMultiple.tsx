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
    // Guardamos las respuestas separadas por coma
    onResponder(seleccionados.join(", "))
  }

  // SALVAVIDAS: Si en Supabase está NULL, usamos estas opciones típicas para niños
  const opcionesSeguras = pregunta.opciones && pregunta.opciones.length > 0 
    ? pregunta.opciones 
    : ["Comer solo 🍎", "Vestirme 👕", "Bañarme 🛀", "Hacer la tarea 📝", "Ordenar mis juguetes 🧸"]

  return (
    <div className="space-y-6">
      <p className="text-center text-purple-600 font-medium mb-2">
        Puedes marcar varias opciones:
      </p>

      <div className="grid gap-3">
        {opcionesSeguras.map((op) => {
          const isSelected = seleccionados.includes(op)
          return (
            <button
              key={op}
              onClick={() => toggleSeleccion(op)}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-between ${
                isSelected
                  ? "border-purple-500 bg-purple-50 text-purple-700 shadow-sm"
                  : "border-gray-200 bg-white text-gray-700 hover:border-purple-300"
              }`}
            >
              <span className="font-medium">{op}</span>
              {isSelected && <span className="text-purple-500 text-xl">✅</span>}
            </button>
          )
        })}
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-600 text-sm font-medium rounded-lg border border-red-100 flex items-center gap-2">
          <span>⚠️</span> {error}
        </div>
      )}

      <button 
        onClick={handleContinuar} 
        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3.5 px-4 rounded-xl transition-all duration-200 shadow-md shadow-purple-600/20"
      >
        Continuar
      </button>
    </div>
  )
}
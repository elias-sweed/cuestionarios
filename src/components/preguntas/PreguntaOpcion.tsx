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

  // SALVAVIDAS: Si Supabase manda NULL o vacío, usamos "Sí" y "No" por defecto
  const opcionesSeguras = pregunta.opciones && pregunta.opciones.length > 0 
    ? pregunta.opciones 
    : ["Sí", "No"]

  return (
    <div className="space-y-6">
      <div className="grid gap-3">
        {opcionesSeguras.map((op) => (
          <button
            key={op}
            onClick={() => {
              setSeleccion(op)
              setError("") // Limpiamos el error si elige una opción
            }}
            className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 font-medium ${
              seleccion === op 
                ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm" 
                : "border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-gray-50"
            }`}
          >
            {op}
          </button>
        ))}
      </div>

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
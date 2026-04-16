import { useState } from "react"

export default function PreguntaAbierta({ onResponder }: any) {
  const [valor, setValor] = useState("")
  const [error, setError] = useState("")

  const handleContinuar = () => {
    if (!valor.trim()) {
      setError("Debes escribir una respuesta")
      return
    }

    setError("")
    onResponder(valor)
  }

  return (
    <div className="space-y-4">
      <textarea
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        className="w-full border p-3 rounded-xl"
        placeholder="Escribe tu respuesta..."
      />

      {error && <p className="text-red-500">{error}</p>}

      <button
        onClick={handleContinuar}
        className="bg-green-600 text-white px-4 py-2 rounded-xl"
      >
        Continuar
      </button>
    </div>
  )
}
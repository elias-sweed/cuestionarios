import { useState } from "react"
import { crearEstudiante } from "../services/estudiante.service"
import type { Estudiante } from "../types"

interface Props {
  onSuccess: (estudiante: Estudiante) => void
}

export default function FormEstudiante({ onSuccess }: Props) {
  const [form, setForm] = useState({
    nombres: "",
    apellidos: "",
    grado: "",
    seccion: ""
  })

  const [loading, setLoading] = useState(false)

  // Tipado correcto para soportar tanto inputs de texto como selects
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const estudiante = await crearEstudiante(form)
      onSuccess(estudiante) // 🔥 importante
    } catch (error) {
      console.error(error)
      alert("Error al guardar los datos del estudiante")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-3xl shadow-lg shadow-gray-200/50 border border-gray-100 w-full max-w-md space-y-6 animate-fade-in"
      >
        <div className="text-center space-y-2 mb-6">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto text-3xl mb-4">
            👋
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Datos del estudiante</h2>
          <p className="text-sm text-gray-500">Ingresa tu información para comenzar</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 ml-1">Nombres</label>
            <input
              name="nombres"
              required
              placeholder="Ej. Juan Carlos"
              value={form.nombres}
              onChange={handleChange}
              className="w-full border border-gray-200 bg-gray-50 p-3.5 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 ml-1">Apellidos</label>
            <input
              name="apellidos"
              required
              placeholder="Ej. Pérez Gómez"
              value={form.apellidos}
              onChange={handleChange}
              className="w-full border border-gray-200 bg-gray-50 p-3.5 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 ml-1">Grado</label>
              {/* Cambiado a Select por UX: evita errores de escritura en la BD */}
              <select
                name="grado"
                required
                value={form.grado}
                onChange={handleChange}
                className="w-full border border-gray-200 bg-gray-50 p-3.5 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-700"
              >
                <option value="" disabled>Elige...</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
                <option value="6">6</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 ml-1">Sección</label>
              {/* Cambiado a Select por UX */}
              <select
                name="seccion"
                required
                value={form.seccion}
                onChange={handleChange}
                className="w-full border border-gray-200 bg-gray-50 p-3.5 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-700"
              >
                <option value="" disabled>Elige...</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
                <option value="E">E</option>
                <option value="F">F</option>
              </select>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold p-4 rounded-xl transition-all duration-200 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed shadow-md shadow-blue-600/20"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Guardando...
            </span>
          ) : (
            "Comenzar Cuestionario"
          )}
        </button>
      </form>
    </div>
  )
}
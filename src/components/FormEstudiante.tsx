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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
  }

  const handleSelection = (field: "grado" | "seccion", value: string) => {
    // Si elige Inicial ("0"), le asignamos "Única" por defecto para que la BD no moleste
    if (field === "grado" && value === "0") {
      setForm({ ...form, grado: "0", seccion: "Única" })
    } 
    // Si elige otro grado de primaria, limpiamos la sección para que la elija
    else if (field === "grado" && value !== "0") {
      setForm({ ...form, grado: value, seccion: "" })
    } 
    else {
      setForm({ ...form, [field]: value })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 🔥 AQUÍ ESTÁ LA MAGIA: Ya no te bloquea si es Inicial
    if (!form.grado) {
      alert("Por favor, selecciona un grado.")
      return
    }
    if (form.grado !== "0" && !form.seccion) {
      alert("Por favor, selecciona una sección para Primaria.")
      return
    }

    setLoading(true)

    try {
      const estudiante = await crearEstudiante(form)
      onSuccess(estudiante)
    } catch (error) {
      console.error(error)
      alert("Error al guardar los datos del estudiante")
    } finally {
      setLoading(false)
    }
  }

  const gradosPrimaria = ["1", "2", "3", "4", "5", "6"]
  const secciones = ["A", "B", "C", "D", "E", "F"]

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

        <div className="space-y-5">
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

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 ml-1">Grado</label>
            
            {/* BOTÓN ESPECIAL PARA INICIAL */}
            <button
              type="button"
              onClick={() => handleSelection("grado", "0")}
              className={`w-full py-3 mb-2 rounded-xl font-bold transition-all duration-200 ${
                form.grado === "0"
                  ? "bg-pink-500 text-white shadow-md shadow-pink-500/30 border-transparent"
                  : "bg-pink-50 text-pink-600 border border-pink-200 hover:bg-pink-100 hover:border-pink-300"
              }`}
            >
              Inicial (5 Años) 🎈
            </button>

            {/* BOTONES PARA PRIMARIA */}
            <div className="grid grid-cols-6 gap-2">
              {gradosPrimaria.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => handleSelection("grado", g)}
                  className={`py-3 rounded-xl font-bold transition-all duration-200 ${
                    form.grado === g
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/30 border-transparent"
                      : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-blue-50 hover:border-blue-200"
                  }`}
                >
                  {g}°
                </button>
              ))}
            </div>
          </div>

          {/* 🔥 ESTO SE OCULTA MÁGICAMENTE SI ELIGE INICIAL */}
          {form.grado !== "0" && form.grado !== "" && (
            <div className="space-y-2 animate-fade-in">
              <label className="text-sm font-medium text-gray-700 ml-1">Sección</label>
              <div className="grid grid-cols-6 gap-2">
                {secciones.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleSelection("seccion", s)}
                    className={`py-3 rounded-xl font-bold transition-all duration-200 ${
                      form.seccion === s
                        ? "bg-blue-600 text-white shadow-md shadow-blue-600/30 border-transparent"
                        : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-blue-50 hover:border-blue-200"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
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
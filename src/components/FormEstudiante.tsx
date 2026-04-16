import { useState } from "react"
import { crearEstudiante } from "../services/estudiante.service"

export default function FormEstudiante({ onSuccess }: any) {
  const [form, setForm] = useState({
    nombres: "",
    apellidos: "",
    grado: "",
    seccion: ""
  })

  const [loading, setLoading] = useState(false)

  const handleChange = (e: any) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setLoading(true)

    try {
      const estudiante = await crearEstudiante(form)
      onSuccess(estudiante) // 🔥 importante
    } catch (error) {
      console.error(error)
      alert("Error al guardar")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-2xl shadow-md w-80 space-y-4"
      >
        <h2 className="text-xl font-bold text-center">Datos del estudiante</h2>

        <input
          name="nombres"
          placeholder="Nombres"
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />

        <input
          name="apellidos"
          placeholder="Apellidos"
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />

        <input
          name="grado"
          placeholder="Grado"
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />

        <input
          name="seccion"
          placeholder="Sección"
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white p-2 rounded"
        >
          {loading ? "Guardando..." : "Continuar"}
        </button>
      </form>
    </div>
  )
}
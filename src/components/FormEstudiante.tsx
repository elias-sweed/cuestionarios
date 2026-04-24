import { useState } from "react"
import { crearEstudiante } from "../services/estudiante.service"
import type { Estudiante } from "../types"
import Lightning from './Lightning';

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
    if (field === "grado" && value === "0") {
      setForm({ ...form, grado: "0", seccion: "Única" })
    } 
    else if (field === "grado" && value !== "0") {
      setForm({ ...form, grado: value, seccion: "" })
    } 
    else {
      setForm({ ...form, [field]: value })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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
    <div className="flex justify-center items-center min-h-screen p-4">
      <form
        onSubmit={handleSubmit}
        /* CAMBIO: Fondo oscuro semi-transparente (bg-slate-900/80) y borde neón sutil */
        className="relative overflow-hidden bg-slate-900/80 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-blue-500/30 w-full max-w-md space-y-6 animate-fade-in"
      >
        {/* --- EFECTO DENTRO DEL FORMULARIO --- */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-60">
          <Lightning 
            hue={220} /* Azul más eléctrico */
            xOffset={0} 
            speed={0.2} 
            intensity={0.5} 
            size={1} 
          />
        </div>

        {/* --- CONTENIDO DEL FORMULARIO --- */}
        <div className="relative z-10 space-y-6">
          <div className="text-center space-y-2 mb-6">
            <div className="w-16 h-16 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center mx-auto text-3xl mb-4 border border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.5)]">
              👋
            </div>
            <h2 className="text-2xl font-bold text-white shadow-sm">Datos del estudiante</h2>
            <p className="text-sm text-blue-200/70">Ingresa tu información para comenzar</p>
          </div>

          <div className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-blue-100 ml-1">Nombres</label>
              <input
                name="nombres"
                required
                placeholder="Ej. Juan Carlos"
                value={form.nombres}
                onChange={handleChange}
                /* CAMBIO: Inputs oscuros y texto claro */
                className="w-full border border-blue-500/30 bg-slate-800/50 text-white placeholder:text-slate-500 p-3.5 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-blue-100 ml-1">Apellidos</label>
              <input
                name="apellidos"
                required
                placeholder="Ej. Pérez Gómez"
                value={form.apellidos}
                onChange={handleChange}
                className="w-full border border-blue-500/30 bg-slate-800/50 text-white placeholder:text-slate-500 p-3.5 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-blue-100 ml-1">Grado</label>
              
              <button
                type="button"
                onClick={() => handleSelection("grado", "0")}
                className={`w-full py-3 mb-2 rounded-xl font-bold transition-all duration-200 ${
                  form.grado === "0"
                    ? "bg-pink-600 text-white shadow-[0_0_15px_rgba(219,39,119,0.5)] border-transparent"
                    : "bg-pink-900/30 text-pink-400 border border-pink-500/30 hover:bg-pink-900/50"
                }`}
              >
                Inicial (5 Años) 🎈
              </button>

              <div className="grid grid-cols-6 gap-2">
                {gradosPrimaria.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => handleSelection("grado", g)}
                    className={`py-3 rounded-xl font-bold transition-all duration-200 ${
                      form.grado === g
                        ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)] border-transparent"
                        : "bg-slate-800/80 text-blue-300 border border-blue-500/30 hover:bg-slate-700"
                    }`}
                  >
                    {g}°
                  </button>
                ))}
              </div>
            </div>

            {form.grado !== "0" && form.grado !== "" && (
              <div className="space-y-2 animate-fade-in">
                <label className="text-sm font-medium text-blue-100 ml-1">Sección</label>
                <div className="grid grid-cols-6 gap-2">
                  {secciones.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => handleSelection("seccion", s)}
                      className={`py-3 rounded-xl font-bold transition-all duration-200 ${
                        form.seccion === s
                          ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)] border-transparent"
                          : "bg-slate-800/80 text-blue-300 border border-blue-500/30 hover:bg-slate-700"
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
            /* CAMBIO: Botón con brillo neón */
            className="w-full mt-6 bg-blue-600 hover:bg-blue-500 text-white font-bold p-4 rounded-xl transition-all duration-200 flex items-center justify-center disabled:opacity-70 shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_25px_rgba(37,99,235,0.6)]"
          >
            {loading ? "Guardando..." : "Comenzar Cuestionario"}
          </button>
        </div>
      </form>
    </div>
  )
}
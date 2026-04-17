import { useEffect, useState, useMemo } from "react"
import { supabase } from "../lib/supabaseClient"
import { getRespuestasDashboard } from "../services/dashboard.service"
import {
  agruparPorGrado,
  agruparPorSeccion,
  analisisPorPregunta,
  emocionesPredominantes,
  detectarAlumnosRiesgo
} from "../utils/dashboard.utils"
import { exportarDashboardExcel } from "../utils/exportExcel"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer
} from "recharts"

interface EstudianteData {
  id?: string | number
  nombres?: string
  apellidos?: string
  grado?: number | string
  seccion?: string
}

interface RespuestaDashboard {
  estudiantes?: EstudianteData | EstudianteData[]
  [key: string]: unknown
}

interface EmocionData {
  name: string
  value: number
}

interface AnalisisData {
  pregunta: string | number
  respuestas: Record<string, number>
}

interface AlumnoRiesgoData {
  estudiante_id: string | number
  nombres: string
  apellidos: string
  grado: string | number
  seccion: string
  score: number | string
  riesgo: string
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6']

export default function AdminDashboard() {
  const [data, setData] = useState<RespuestaDashboard[]>([])
  const [gradoFiltro, setGradoFiltro] = useState("todos")
  const [seccionFiltro, setSeccionFiltro] = useState("todos")

  const [emociones, setEmociones] = useState<EmocionData[]>([])
  const [analisis, setAnalisis] = useState<AnalisisData[]>([])
  const [alumnosRiesgo, setAlumnosRiesgo] = useState<AlumnoRiesgoData[]>([])

  const dataFiltrada = useMemo(() => {
    return data.filter((item) => {
      const estudianteInfo = Array.isArray(item.estudiantes) ? item.estudiantes[0] : item.estudiantes
      const grado = estudianteInfo?.grado != null ? String(estudianteInfo.grado) : ""
      const seccion = estudianteInfo?.seccion || ""

      const pasaGrado = gradoFiltro === "todos" || grado === gradoFiltro
      const pasaSeccion = seccionFiltro === "todos" || seccion === seccionFiltro

      return pasaGrado && pasaSeccion
    })
  }, [data, gradoFiltro, seccionFiltro])

  const porGrado = useMemo(() => agruparPorGrado(dataFiltrada), [dataFiltrada])
  const porSeccion = useMemo(() => agruparPorSeccion(dataFiltrada), [dataFiltrada])

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await getRespuestasDashboard()
        setData(res)
      } catch (err) {
        console.error(err)
      }
    }
    cargar()
  }, [])

  useEffect(() => {
    setEmociones(emocionesPredominantes(dataFiltrada))
    setAnalisis(analisisPorPregunta(dataFiltrada))
    setAlumnosRiesgo(detectarAlumnosRiesgo(dataFiltrada))
  }, [dataFiltrada])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = "/"
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10 space-y-8">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard Administrativo</h1>
          <p className="text-gray-500 mt-1">Panel de control y resultados del cuestionario</p>
        </div>
        <button
          onClick={handleLogout}
          className="px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-semibold rounded-xl flex items-center gap-2 transition-colors border border-red-200 shadow-sm"
        >
          🚪 Cerrar Sesión
        </button>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <p className="text-sm text-gray-500 font-medium">Mostrando</p>
          <p className="text-2xl font-bold text-blue-600">{dataFiltrada.length} respuestas</p>
        </div>

        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Grado</label>
            <select
              value={gradoFiltro}
              onChange={(e) => setGradoFiltro(e.target.value)}
              className="w-full min-w-[140px] border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
            >
              <option value="todos">Todos los grados</option>
              {[1, 2, 3, 4, 5, 6].map((g) => (
                <option key={g} value={String(g)}>
                  {g}° Grado
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Sección</label>
            <select
              value={seccionFiltro}
              onChange={(e) => setSeccionFiltro(e.target.value)}
              className="w-full min-w-[140px] border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
            >
              <option value="todos">Todas las secciones</option>
              {["A", "B", "C", "D", "E", "F"].map((s) => (
                <option key={s} value={s}>
                  Sección {s}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => exportarDashboardExcel(dataFiltrada)}
            className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl flex items-center gap-2 transition-colors shadow-sm"
          >
            📥 Exportar a Excel
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">Respuestas por grado</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={porGrado}>
                <XAxis dataKey="name" tick={{ fill: '#6b7280' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: '#6b7280' }} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">Respuestas por sección</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={porSeccion}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={60}
                  paddingAngle={5}
                >
                  {porSeccion.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-6">Emociones predominantes</h2>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={emociones}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={120}
                label={(props: { name: string; percent?: number }) => `${props.name} ${((props.percent ?? 0) * 100).toFixed(0)}%`}
              >
                {emociones.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-6">Análisis por pregunta (Frecuencias)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {analisis.map((item) => (
            <div key={item.pregunta} className="bg-gray-50 border border-gray-200 p-5 rounded-xl">
              <p className="font-semibold text-gray-700 mb-4 line-clamp-2">
                Pregunta <span className="text-blue-600">#{item.pregunta}</span>
              </p>
              <div className="space-y-2 text-sm">
                {Object.entries(item.respuestas).map(([resp, count]) => (
                  <div key={resp} className="flex justify-between items-center bg-white px-4 py-2.5 rounded-lg border border-gray-100 shadow-sm">
                    <span className="font-medium text-gray-600 truncate mr-2">{resp}</span>
                    <span className="font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
          ⚠️ Alumnos en riesgo
          <span className="bg-red-100 text-red-700 text-sm py-1 px-3 rounded-full font-bold">
            {alumnosRiesgo.length}
          </span>
        </h2>

        <div className="max-h-[400px] overflow-auto border border-gray-200 rounded-xl">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 sticky top-0 z-10 font-medium">
              <tr>
                <th className="px-6 py-4">Alumno</th>
                <th className="px-6 py-4">Grado / Sección</th>
                <th className="px-6 py-4 text-center">Puntuación</th>
                <th className="px-6 py-4 text-center">Nivel de Riesgo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {alumnosRiesgo.map((alumno) => (
                <tr key={alumno.estudiante_id} className="hover:bg-blue-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-800">
                    {alumno.nombres} {alumno.apellidos}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {alumno.grado}° {alumno.seccion}
                  </td>
                  <td className="px-6 py-4 text-center font-mono font-bold text-gray-700">
                    {alumno.score}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-block px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider ${
                        alumno.riesgo === 'alto'
                          ? 'bg-red-100 text-red-700'
                          : alumno.riesgo === 'medio'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {alumno.riesgo}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {alumnosRiesgo.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <span className="text-4xl mb-3">✅</span>
              <p>No hay alumnos en riesgo bajo estos filtros.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
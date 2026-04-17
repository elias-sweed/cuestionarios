import { useEffect, useState, useMemo } from "react"
import { getRespuestasDashboard } from "../services/dashboard.service"
import {
  agruparPorGrado,
  agruparPorSeccion,
  analisisPorPregunta,
  emocionesPredominantes,
} from "../utils/dashboard.utils"
import { exportarDashboardExcel } from "../utils/exportExcel"
import { detectarAlumnosRiesgo } from "../utils/dashboard.utils"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts"

export default function AdminDashboard() {
  const [data, setData] = useState<any[]>([])           
  const [gradoFiltro, setGradoFiltro] = useState("todos")
  const [seccionFiltro, setSeccionFiltro] = useState("todos")

  // Estados para los análisis nuevos
  const [emociones, setEmociones] = useState<any[]>([])
  const [analisis, setAnalisis] = useState<any[]>([])

  // ====================== FILTRO ======================
  const dataFiltrada = useMemo(() => {
    return data.filter((item) => {
      const grado = item.estudiantes?.grado != null ? String(item.estudiantes.grado) : ""
      const seccion = item.estudiantes?.seccion || ""

      const pasaGrado = gradoFiltro === "todos" || grado === gradoFiltro
      const pasaSeccion = seccionFiltro === "todos" || seccion === seccionFiltro

      return pasaGrado && pasaSeccion
    })
  }, [data, gradoFiltro, seccionFiltro])

  // ====================== CÁLCULOS DERIVADOS ======================
  const porGrado = useMemo(() => agruparPorGrado(dataFiltrada), [dataFiltrada])
  const porSeccion = useMemo(() => agruparPorSeccion(dataFiltrada), [dataFiltrada])

  const [alumnosRiesgo, setAlumnosRiesgo] = useState<any[]>([])

  // ====================== CARGA DE DATOS ======================
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

  // Actualizar análisis cada vez que cambia el filtro
  useEffect(() => {
    setEmociones(emocionesPredominantes(dataFiltrada))
    setAnalisis(analisisPorPregunta(dataFiltrada))
    setAlumnosRiesgo(detectarAlumnosRiesgo(dataFiltrada))
  }, [dataFiltrada])

  return (
    <div className="p-6 space-y-10">
      <h1 className="text-2xl font-bold">Dashboard Administrativo</h1>

      {/* ==================== FILTROS ==================== */}
      <div className="flex gap-4 items-end">
        <div>
          <label className="block text-sm font-medium mb-1">Grado</label>
          <select
            value={gradoFiltro}
            onChange={(e) => setGradoFiltro(e.target.value)}
            className="border rounded px-3 py-2"
          >
            <option value="todos">Todos los grados</option>
            {[1, 2, 3, 4, 5, 6].map((g) => (
              <option key={g} value={String(g)}>
                {g}°
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Sección</label>
          <select
            value={seccionFiltro}
            onChange={(e) => setSeccionFiltro(e.target.value)}
            className="border rounded px-3 py-2"
          >
            <option value="todos">Todas las secciones</option>
            {["A", "B", "C", "D", "E", "F"].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="text-sm text-gray-500">
          Mostrando <strong>{dataFiltrada.length}</strong> respuestas
        </div>
      </div>

      {/* Botón Exportar Excel */}
      <button
      onClick={() => exportarDashboardExcel(dataFiltrada)}
      className="ml-auto px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg flex items-center gap-2"
        >
       📥 Exportar a Excel
      </button>

      {/* ==================== GRÁFICOS ORIGINALES (ahora filtrados) ==================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* POR GRADO */}
        <div>
          <h2 className="font-semibold mb-2">Respuestas por grado</h2>
          <BarChart width={500} height={300} data={porGrado}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#3b82f6" />
          </BarChart>
        </div>

        {/* POR SECCIÓN */}
        <div>
          <h2 className="font-semibold mb-2">Respuestas por sección</h2>
          <PieChart width={400} height={300}>
            <Pie
              data={porSeccion}
              dataKey="value"
              nameKey="name"
              outerRadius={100}
            >
              {porSeccion.map((_, i) => (
                <Cell key={i} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </div>
      </div>

      {/* ==================== EMOCIONES PREDOMINANTES ==================== */}
      <div>
        <h2 className="font-semibold mb-4">Emociones predominantes</h2>
        <PieChart width={400} height={300}>
          <Pie
            data={emociones}
            dataKey="value"
            nameKey="name"
            outerRadius={100}
            label
          >
            {emociones.map((_, i) => (
              <Cell key={i} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </div>

      {/* ==================== ANÁLISIS POR PREGUNTA ==================== */}
      <div>
        <h2 className="font-semibold mb-4">Análisis por pregunta (quién falla más)</h2>
        <div className="space-y-6">
          {analisis.map((item) => (
            <div key={item.pregunta} className="border border-gray-200 p-4 rounded-lg">
              <p className="font-medium mb-3">
                Pregunta <span className="text-blue-600">{item.pregunta}</span>
              </p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {Object.entries(item.respuestas).map(([resp, count]) => (
                  <div key={resp} className="flex justify-between bg-gray-50 px-3 py-2 rounded">
                    <span className="font-mono">{resp}</span>
                    <span className="font-semibold">{count as number}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

          {/* ==================== ALUMNOS EN RIESGO ==================== */}
<div>
  <h2 className="font-semibold mb-4 flex items-center gap-2">
    ⚠️ Alumnos en riesgo 
    <span className="text-sm font-normal text-gray-500">({alumnosRiesgo.length})</span>
  </h2>

  <div className="max-h-96 overflow-auto border rounded-lg">
    <table className="w-full text-sm">
      <thead className="bg-gray-100 sticky top-0">
        <tr>
          <th className="px-4 py-3 text-left">Alumno</th>
          <th className="px-4 py-3 text-left">Grado / Sección</th>
          <th className="px-4 py-3 text-center">Score</th>
          <th className="px-4 py-3 text-center">Riesgo</th>
        </tr>
      </thead>
      <tbody className="divide-y">
        {alumnosRiesgo.map((alumno) => (
          <tr key={alumno.estudiante_id} className="hover:bg-gray-50">
            <td className="px-4 py-3">
              {alumno.nombres} {alumno.apellidos}
            </td>
            <td className="px-4 py-3">
              {alumno.grado}° {alumno.seccion}
            </td>
            <td className="px-4 py-3 text-center font-mono font-bold">
              {alumno.score}
            </td>
            <td className="px-4 py-3 text-center">
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                  alumno.riesgo === 'alto'
                    ? 'bg-red-100 text-red-700'
                    : alumno.riesgo === 'medio'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-green-100 text-green-700'
                }`}
              >
                {alumno.riesgo.toUpperCase()}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>

  {alumnosRiesgo.length === 0 && (
    <p className="text-gray-500 text-center py-8">No hay alumnos en riesgo con los filtros actuales.</p>
  )}
</div>


    </div>
  )
}
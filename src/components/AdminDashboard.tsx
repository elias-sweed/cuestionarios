import { useEffect, useState, useMemo } from "react"
import { createPortal } from "react-dom"
import { getRespuestasDashboard } from "../services/dashboard.service"
import { logout } from "../services/auth.service"
import { supabase } from "../lib/supabaseClient"
import {
  agruparPorGrado,
  agruparPorSeccion,
  analisisPorPregunta,
  emocionesPredominantes,
  detectarAlumnosRiesgo,
  detectarAlumnosRiesgoInicial
} from "../utils/dashboard.utils"

import DashboardFilters from "./dashboard/DashboardFilters"
import { exportarExcelPorGrados } from "../utils/exportExcelPorGrados"
import DashboardCharts from "./dashboard/DashboardCharts"
import DashboardRiesgoTable from "./dashboard/DashboardRiesgoTable"
import DashboardPreguntas from "./dashboard/DashboardPreguntas"
import DashboardRawTable from "./dashboard/DashboardRawTable"
import DashboardAlumnosPorGrado from "./dashboard/DashboardAlumnosPorGrado"
import {
  LogOut, LayoutDashboard, Users, AlertTriangle,
  FileText, BarChart3, ChevronLeft, ChevronRight, Trash2, X, AlertCircle, Filter, GraduationCap
} from "lucide-react"
import DotField from "./DotField"

function ModalEliminar({
  alumno,
  onConfirm,
  onCancel,
  loading,
}: {
  alumno: { nombres: string; apellidos: string; estudiante_id: string } | null
  onConfirm: (modo: "respuestas" | "completo") => void
  onCancel: () => void
  loading: boolean
}) {
  const [modo, setModo] = useState<"respuestas" | "completo">("respuestas")

  // Resetear modo cada vez que abre el modal
  useEffect(() => {
    if (alumno) setModo("respuestas")
  }, [alumno])

  if (!alumno) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-red-500/30 rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl shadow-red-500/10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-500/10 rounded-xl">
            <AlertCircle className="w-6 h-6 text-red-400" />
          </div>
          <h3 className="text-lg font-black text-white">Eliminar registro</h3>
        </div>

        <p className="text-slate-400 text-sm mb-1">Alumno seleccionado:</p>
        <p className="text-cyan-400 font-black text-base mb-6 capitalize">
          {alumno.nombres} {alumno.apellidos}
        </p>

        {/* Selector de modo */}
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">
          ¿Qué deseas eliminar?
        </p>
        <div className="space-y-2 mb-6">
          <button
            onClick={() => setModo("respuestas")}
            className={`w-full flex items-start gap-3 p-4 rounded-2xl border text-left transition-all ${
              modo === "respuestas"
                ? "bg-orange-500/10 border-orange-500/40 text-orange-300"
                : "bg-slate-800/40 border-white/5 text-slate-400 hover:border-white/10"
            }`}
          >
            <div className={`mt-0.5 w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
              modo === "respuestas" ? "border-orange-400" : "border-slate-600"
            }`}>
              {modo === "respuestas" && <div className="w-2 h-2 rounded-full bg-orange-400" />}
            </div>
            <div>
              <p className="font-black text-sm">Solo las respuestas</p>
              <p className="text-xs opacity-60 mt-0.5">
                Borra todas las respuestas del cuestionario. El estudiante permanece en la base de datos y puede volver a responder.
              </p>
            </div>
          </button>

          <button
            onClick={() => setModo("completo")}
            className={`w-full flex items-start gap-3 p-4 rounded-2xl border text-left transition-all ${
              modo === "completo"
                ? "bg-red-500/10 border-red-500/40 text-red-300"
                : "bg-slate-800/40 border-white/5 text-slate-400 hover:border-white/10"
            }`}
          >
            <div className={`mt-0.5 w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
              modo === "completo" ? "border-red-400" : "border-slate-600"
            }`}>
              {modo === "completo" && <div className="w-2 h-2 rounded-full bg-red-400" />}
            </div>
            <div>
              <p className="font-black text-sm">Eliminar todo (alumno completo)</p>
              <p className="text-xs opacity-60 mt-0.5">
                Borra las respuestas Y el registro del estudiante. No se puede deshacer.
              </p>
            </div>
          </button>
        </div>

        {/* Advertencia según modo */}
        <div className={`text-xs mb-6 rounded-2xl p-4 border ${
          modo === "completo"
            ? "bg-red-500/10 border-red-500/20 text-red-400/80"
            : "bg-slate-800/50 border-white/5 text-slate-500"
        }`}>
          {modo === "completo"
            ? "⚠️ Eliminarás respuestas + el registro del estudiante. Esta acción es irreversible."
            : "ℹ️ Solo se eliminan las respuestas. El registro del estudiante permanece."}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-3 rounded-2xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 font-bold text-sm transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={() => onConfirm(modo)}
            disabled={loading}
            className={`flex-1 py-3 rounded-2xl font-black text-sm transition-all border flex items-center justify-center gap-2 ${
              modo === "completo"
                ? "bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white border-red-500/30"
                : "bg-orange-500/20 hover:bg-orange-500 text-orange-400 hover:text-white border-orange-500/30"
            }`}
          >
            {loading ? (
              <span className="animate-pulse">Eliminando...</span>
            ) : (
              <><Trash2 className="w-4 h-4" /> {modo === "completo" ? "Eliminar todo" : "Eliminar respuestas"}</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Componente principal ─────────────────────────────────────────────────────
type NivelDashboard = "primaria" | "inicial"

export default function AdminDashboard({ nivel = "primaria" }: { nivel?: NivelDashboard }) {
  const [data, setData] = useState<any[]>([])
  const [gradoFiltro, setGradoFiltro] = useState("todos")
  const [seccionFiltro, setSeccionFiltro] = useState("todos")
  const [activeTab, setActiveTab] = useState("stats")
  const [sidebarAbierto, setSidebarAbierto] = useState(true)
  const esDashboardInicial = nivel === "inicial"

  // Estado para el modal de eliminar
  const [alumnoAEliminar, setAlumnoAEliminar] = useState<{
    nombres: string; apellidos: string; estudiante_id: string
  } | null>(null)
  const [eliminando, setEliminando] = useState(false)
  const [mensajeExito, setMensajeExito] = useState("")

  const cargar = async () => {
    try {
      const res = await getRespuestasDashboard()
      setData(res || [])
    } catch (err) { console.error(err) }
  }

  useEffect(() => {
    cargar()
    const intervalo = setInterval(() => { cargar() }, 30000)
    return () => clearInterval(intervalo)
  }, [])

  const dataFiltrada = useMemo(() => {
    return data.filter((item: any) => {
      const est = Array.isArray(item.estudiantes) ? item.estudiantes[0] : item.estudiantes
      const grado = est?.grado != null ? String(est.grado).trim() : "sin_grado"
      const seccion = est?.seccion ? String(est.seccion).trim().toUpperCase() : ""

      const esNivelValido = esDashboardInicial
        ? grado === "0"
        : ["1", "2", "3", "4", "5", "6"].includes(grado)
      if (!esNivelValido) return false

      const esPrimaria = ["1", "2", "3", "4", "5", "6"].includes(grado)
      const pasaGrado = gradoFiltro === "todos" || grado === String(gradoFiltro).trim()
      const pasaSeccion = seccionFiltro === "todos"
        || (esDashboardInicial
          ? (seccionFiltro === "ÚNICA" && seccion === "ÚNICA")
          : seccion === seccionFiltro.toUpperCase())

      return (esDashboardInicial ? true : esPrimaria) && pasaGrado && pasaSeccion
    })
  }, [data, gradoFiltro, seccionFiltro, esDashboardInicial])

  // ── Función para eliminar respuestas ──────────────────────────────────────
 const handleEliminar = async (modo: "respuestas" | "completo") => {
  if (!alumnoAEliminar) return
  setEliminando(true)
  try {
    // Paso 1: siempre eliminar respuestas primero
    const { error: errorResp } = await supabase
      .from("respuestas")
      .delete()
      .eq("estudiante_id", alumnoAEliminar.estudiante_id)

    if (errorResp) throw errorResp

    // Paso 2: si modo completo, eliminar también el estudiante
    if (modo === "completo") {
      const { error: errorEst } = await supabase
        .from("estudiantes")
        .delete()
        .eq("id", alumnoAEliminar.estudiante_id)

      if (errorEst) throw errorEst
    }

    const msg = modo === "completo"
      ? `${alumnoAEliminar.nombres} eliminado/a completamente.`
      : `Respuestas de ${alumnoAEliminar.nombres} eliminadas correctamente.`

    setMensajeExito(msg)
    setAlumnoAEliminar(null)
    setTimeout(() => setMensajeExito(""), 4000)
    await cargar()
  } catch (err) {
    console.error("Error al eliminar:", err)
  } finally {
    setEliminando(false)
  }
}

 const handleEliminarMasivo = async (
  alumnos: { nombres: string; apellidos: string; estudiante_id: string }[],
  modo: "respuestas" | "completo"
 ) => {
  if (alumnos.length === 0) return
  const ids = alumnos.map(a => a.estudiante_id)
  setEliminando(true)
  try {
    const { error: errorResp } = await supabase
      .from("respuestas")
      .delete()
      .in("estudiante_id", ids)
    if (errorResp) throw errorResp

    if (modo === "completo") {
      const { error: errorEst } = await supabase
        .from("estudiantes")
        .delete()
        .in("id", ids)
      if (errorEst) throw errorEst
    }

    const msg = modo === "completo"
      ? `Se eliminaron completamente ${alumnos.length} alumnos.`
      : `Se eliminaron las respuestas de ${alumnos.length} alumnos.`
    setMensajeExito(msg)
    setTimeout(() => setMensajeExito(""), 4000)
    await cargar()
  } catch (err) {
    console.error("Error en eliminación masiva:", err)
  } finally {
    setEliminando(false)
  }
 }

  return (
    <div className="flex h-screen bg-[#050505] text-white font-sans overflow-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <DotField bulgeStrength={30} dotRadius={0.8} dotSpacing={25} cursorRadius={200} cursorForce={0.1} gradientFrom="#0891b2" gradientTo="#020617" sparkle={false} />
      </div>

      {/* ── SIDEBAR FIJO Y COLAPSABLE ───────────────────────────────────── */}
      <aside
        className={`
          relative z-20 shrink-0 flex flex-col
          border-r border-white/5 bg-black/40 backdrop-blur-xl
          transition-all duration-300 ease-in-out
          ${sidebarAbierto ? "w-64" : "w-16"}
        `}
        style={{ height: "100vh", position: "sticky", top: 0 }}
      >
        {/* Cabecera del sidebar */}
        <div className={`flex items-center p-5 border-b border-white/5 ${sidebarAbierto ? "justify-between" : "justify-center"}`}>
          {sidebarAbierto && (
            <div className="flex items-center gap-3">
              <LayoutDashboard className="text-cyan-400 w-6 h-6 shrink-0" />
              <span className="font-black tracking-tighter text-xl whitespace-nowrap">SISTEMA</span>
            </div>
          )}
          <button
            onClick={() => setSidebarAbierto(!sidebarAbierto)}
            className="p-2 rounded-xl text-slate-500 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all border border-transparent hover:border-cyan-500/20"
            title={sidebarAbierto ? "Colapsar menú" : "Expandir menú"}
          >
            {sidebarAbierto ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>

        {/* Navegación */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <SidebarItem
            icon={<LayoutDashboard className="w-5 h-5 shrink-0" />}
            label={esDashboardInicial ? "Dashboard Primaria" : "Dashboard Inicial"}
            active={false}
            onClick={() => {
              window.location.href = esDashboardInicial
                ? "/admin/primaria/dashboard"
                : "/admin/inicial/dashboard"
            }}
            collapsed={!sidebarAbierto}
          />
          <SidebarItem icon={<BarChart3 className="w-5 h-5 shrink-0" />} label="Estadísticas" active={activeTab === "stats"} onClick={() => setActiveTab("stats")} collapsed={!sidebarAbierto} />
          <SidebarItem icon={<FileText className="w-5 h-5 shrink-0" />} label="Frecuencias" active={activeTab === "questions"} onClick={() => setActiveTab("questions")} collapsed={!sidebarAbierto} />
          <SidebarItem icon={<AlertTriangle className="w-5 h-5 shrink-0" />} label="Riesgo (1-20)" active={activeTab === "risk"} onClick={() => setActiveTab("risk")} collapsed={!sidebarAbierto} />
          <SidebarItem icon={<Users className="w-5 h-5 shrink-0" />} label="Detalle Alumnos" active={activeTab === "raw"} onClick={() => setActiveTab("raw")} collapsed={!sidebarAbierto} />
          <SidebarItem icon={<GraduationCap className="w-5 h-5 shrink-0" />} label="Alumnos por Grado" active={activeTab === "alumnos"} onClick={() => setActiveTab("alumnos")} collapsed={!sidebarAbierto} />
          
          {/* Separador */}
          <div className="pt-3 pb-1">
            {sidebarAbierto && (
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest px-3 pb-1">
                Gestión
              </p>
            )}
          </div>

          {/* Botón Eliminar respuestas */}
          <SidebarItem
            icon={<Trash2 className="w-5 h-5 shrink-0" />}
            label="Eliminar respuestas"
            active={activeTab === "eliminar"}
            onClick={() => setActiveTab("eliminar")}
            collapsed={!sidebarAbierto}
            danger
          />
        </nav>

        {/* Botón cerrar sesión — siempre al fondo, siempre visible */}
        <div className="p-3 border-t border-white/5">
          <button
            onClick={async () => { await logout(); window.location.replace("/") }}
            className={`
              w-full flex items-center gap-3 p-3
              text-slate-500 hover:text-red-400 hover:bg-red-500/10
              rounded-2xl transition-all font-bold text-xs tracking-widest
              border border-transparent hover:border-red-500/20
              ${sidebarAbierto ? "justify-start px-4" : "justify-center"}
            `}
            title="Cerrar sesión"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {sidebarAbierto && <span>CERRAR SESIÓN</span>}
          </button>
        </div>
      </aside>

      {/* ── CONTENIDO PRINCIPAL (scrolleable, sidebar NO se mueve) ────────── */}
      <main className="relative z-10 flex-1 overflow-y-auto p-8 md:p-10">

        {/* Toast de éxito */}
        {mensajeExito && (
          <div className="fixed top-6 right-6 z-50 flex items-center gap-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold text-sm px-5 py-4 rounded-2xl shadow-xl backdrop-blur-xl animate-fade-in">
            ✓ {mensajeExito}
            <button onClick={() => setMensajeExito("")} className="ml-2 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <header className="mb-10 flex flex-col xl:flex-row xl:justify-between xl:items-end gap-6">
          <div>
            <h2 className="text-4xl font-black tracking-tighter uppercase text-white drop-shadow-md">
              {activeTab === "stats" && "Panel General"}
              {activeTab === "questions" && "Análisis por Pregunta"}
              {activeTab === "risk" && "Atención Prioritaria"}
              {activeTab === "raw" && "Auditoría Completa"}
              {activeTab === "alumnos" && "Alumnos por Grado y Sección"}
              {activeTab === "eliminar" && "Eliminar Respuestas"}
            </h2>
            <p className="text-cyan-400/70 font-bold text-xs tracking-[0.3em] mt-2">
              Mostrando {dataFiltrada.length} de {data.length} registros (Límite: 10,000)
            </p>
          </div>

{activeTab !== "eliminar" && (
  <div className="flex flex-col sm:flex-row items-end gap-3">
    <DashboardFilters
      grado={gradoFiltro} seccion={seccionFiltro} total={dataFiltrada.length}
      onGradoChange={setGradoFiltro} onSeccionChange={setSeccionFiltro} dataFiltrada={dataFiltrada}
      nivel={nivel}
    />
    <button
      onClick={() => exportarExcelPorGrados(data, nivel)}
      className="group px-5 py-3.5 bg-cyan-500/10 hover:bg-cyan-500 text-cyan-400 hover:text-white font-black rounded-2xl flex items-center gap-2 border border-cyan-500/20 transition-all duration-300 shadow-lg shadow-cyan-500/5 active:scale-95"
      title="Exportar reporte organizado por grados y secciones"
    >
      <svg className="w-5 h-5 group-hover:-translate-y-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <span className="text-xs tracking-widest uppercase">Por Grados</span>
    </button>
  </div>
)}
        </header>

        <div className="animate-fade-in">
          {activeTab === "stats" && (
            <DashboardCharts
              porGrado={agruparPorGrado(dataFiltrada)}
              porSeccion={agruparPorSeccion(dataFiltrada)}
              emociones={emocionesPredominantes(dataFiltrada)}
            />
          )}
          {activeTab === "questions" && (
            <DashboardPreguntas analisis={analisisPorPregunta(dataFiltrada)} />
          )}
          {activeTab === "risk" && (
            <DashboardRiesgoTable
              alumnos={esDashboardInicial ? detectarAlumnosRiesgoInicial(dataFiltrada) : detectarAlumnosRiesgo(dataFiltrada)}
              totalData={dataFiltrada.length}
            />
          )}
          {activeTab === "raw" && (
            <DashboardRawTable data={dataFiltrada} />
          )}
          {activeTab === "alumnos" && (
            <DashboardAlumnosPorGrado data={data} nivel={nivel} />
          )}

          {/* ── PESTAÑA ELIMINAR ─────────────────────────────────────── */}
          {activeTab === "eliminar" && (
            <TablaEliminar
              data={data}
              nivel={nivel}
              eliminando={eliminando}
              onEliminarMasivo={handleEliminarMasivo}
              onSolicitarEliminar={(alumno) => setAlumnoAEliminar(alumno)}
            />
          )}
        </div>
      </main>

      {/* Modal de confirmación */}
      <ModalEliminar
        alumno={alumnoAEliminar}
        onConfirm={(modo) => handleEliminar(modo)}
        onCancel={() => setAlumnoAEliminar(null)}
        loading={eliminando}
      />
    </div>
  )
}

// ── Tabla de alumnos con botón eliminar ──────────────────────────────────────
function TablaEliminar({
  data,
  nivel,
  eliminando,
  onEliminarMasivo,
  onSolicitarEliminar,
}: {
  data: any[]
  nivel: NivelDashboard
  eliminando: boolean
  onEliminarMasivo: (
    alumnos: { nombres: string; apellidos: string; estudiante_id: string }[],
    modo: "respuestas" | "completo"
  ) => Promise<void>
  onSolicitarEliminar: (alumno: { nombres: string; apellidos: string; estudiante_id: string }) => void
}) {
  const [busqueda, setBusqueda] = useState("")
  const [soloDuplicados, setSoloDuplicados] = useState(false)
  const [gradoFiltro, setGradoFiltro] = useState("todos")
  const [seccionFiltro, setSeccionFiltro] = useState("todos")
  const [seleccionados, setSeleccionados] = useState<Set<string>>(new Set())
  const [modalMasivo, setModalMasivo] = useState(false)
  const [page, setPage] = useState(1)
  const itemsPerPage = 20

  // Construir lista única de alumnos con conteo de respuestas
  const alumnos = useMemo(() => {
    const mapa: Record<string, { nombres: string; apellidos: string; grado: string; seccion: string; total: number }> = {}
    data.forEach((item: any) => {
      const id = item.estudiante_id
      if (!id) return
      const est = Array.isArray(item.estudiantes) ? item.estudiantes[0] : item.estudiantes
      const gradoEstudiante = est?.grado != null ? String(est.grado).trim() : ""
      const esGradoValido = nivel === "inicial"
        ? gradoEstudiante === "0"
        : ["1", "2", "3", "4", "5", "6"].includes(gradoEstudiante)
      if (!esGradoValido) return
      if (!mapa[id]) {
        mapa[id] = {
          nombres: est?.nombres || "—",
          apellidos: est?.apellidos || "—",
          grado: est?.grado != null ? String(est.grado) : "—",
          seccion: est?.seccion || "—",
          total: 0,
        }
      }
      mapa[id].total++
    })
    return Object.entries(mapa)
      .map(([id, v]) => ({ estudiante_id: id, ...v }))
      .sort((a, b) => `${a.apellidos}${a.nombres}`.localeCompare(`${b.apellidos}${b.nombres}`))
  }, [data, nivel])

  // Detectar duplicados
  const duplicados = useMemo(() => {
    const clave = (a: typeof alumnos[0]) =>
      `${a.apellidos}${a.nombres}`.toLowerCase().replace(/\s+/g, "")
    const grupos: Record<string, typeof alumnos> = {}
    alumnos.forEach(a => {
      const k = clave(a)
      if (!grupos[k]) grupos[k] = []
      grupos[k].push(a)
    })
    const ids = new Set<string>()
    Object.values(grupos).forEach(g => {
      if (g.length > 1) g.forEach(a => ids.add(a.estudiante_id))
    })
    return ids
  }, [alumnos])

  // Lista filtrada
  const filtrados = useMemo(() => {
    let lista = alumnos

    if (gradoFiltro !== "todos")
      lista = lista.filter(a => a.grado === gradoFiltro)

    if (seccionFiltro !== "todos")
      lista = lista.filter(a => {
        const s = a.seccion.trim().toUpperCase()
        return seccionFiltro === "ÚNICA" ? s === "ÚNICA" : s === seccionFiltro.toUpperCase()
      })

    if (soloDuplicados)
      lista = lista.filter(a => duplicados.has(a.estudiante_id))

    if (busqueda.trim()) {
      const q = busqueda.toLowerCase()
      lista = lista.filter(a =>
        a.nombres.toLowerCase().includes(q) ||
        a.apellidos.toLowerCase().includes(q)
      )
    }

    return lista
  }, [alumnos, busqueda, soloDuplicados, duplicados, gradoFiltro, seccionFiltro])

  // Limpiar selección cuando cambia el filtro
  useEffect(() => {
    setSeleccionados(new Set())
    setPage(1)
  }, [gradoFiltro, seccionFiltro, soloDuplicados, busqueda])

  const todosSeleccionados = filtrados.length > 0 && filtrados.every(a => seleccionados.has(a.estudiante_id))

  const toggleTodos = () => {
    if (todosSeleccionados) {
      setSeleccionados(new Set())
    } else {
      setSeleccionados(new Set(filtrados.map(a => a.estudiante_id)))
    }
  }

  const toggleUno = (id: string) => {
    setSeleccionados(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const alumnosSeleccionados = alumnos.filter(a => seleccionados.has(a.estudiante_id))
  const totalPages = Math.max(1, Math.ceil(filtrados.length / itemsPerPage))
  const filtradosPaginados = filtrados.slice((page - 1) * itemsPerPage, page * itemsPerPage)

  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  return (
    <div className="space-y-4">

      {/* ── FILTROS DE GRADO Y SECCIÓN ─────────────────────────────── */}
      <div className="flex flex-wrap items-end gap-4 bg-slate-900/50 backdrop-blur-xl p-5 rounded-3xl border border-white/5">

        {/* Grado */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
            <Filter className="w-3 h-3 text-cyan-500" /> Grado
          </label>
          <select
            value={gradoFiltro}
            onChange={e => setGradoFiltro(e.target.value)}
            className="min-w-36 border border-white/10 bg-slate-950/50 text-white rounded-2xl px-4 py-2.5 focus:ring-2 focus:ring-cyan-500/50 outline-none transition-all text-sm font-bold appearance-none cursor-pointer hover:border-cyan-500/30"
          >
            {nivel === "inicial" ? (
              <>
                <option value="todos" className="bg-slate-900">Inicial</option>
                <option value="0" className="bg-slate-900">Inicial (5 años)</option>
              </>
            ) : (
              <>
                <option value="todos" className="bg-slate-900">Todos los grados</option>
                {[1, 2, 3, 4, 5, 6].map(g => (
                  <option key={g} value={String(g)} className="bg-slate-900">{g}° Grado</option>
                ))}
              </>
            )}
          </select>
        </div>

        {/* Sección */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
            <Filter className="w-3 h-3 text-cyan-500" /> Sección
          </label>
          <select
            value={seccionFiltro}
            onChange={e => setSeccionFiltro(e.target.value)}
            className="min-w-36 border border-white/10 bg-slate-950/50 text-white rounded-2xl px-4 py-2.5 focus:ring-2 focus:ring-cyan-500/50 outline-none transition-all text-sm font-bold appearance-none cursor-pointer hover:border-cyan-500/30"
          >
            <option value="todos" className="bg-slate-900">Todas las secciones</option>
            {nivel === "inicial" ? (
              <option value="ÚNICA" className="bg-slate-900">Sección Única</option>
            ) : (
              ["A", "B", "C", "D", "E", "F"].map(s => (
                <option key={s} value={s} className="bg-slate-900">Sección {s}</option>
              ))
            )}
          </select>
        </div>

        {/* Buscador */}
        <div className="flex-1 min-w-48 space-y-1.5">
          <label className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
            <Filter className="w-3 h-3 text-cyan-500" /> Buscar
          </label>
          <input
            type="text"
            placeholder="Nombre o apellido..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            className="w-full bg-slate-950/50 border border-white/10 text-white placeholder-slate-600 rounded-2xl px-4 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-cyan-500/40 transition-all"
          />
        </div>

        {/* Toggle duplicados */}
        <button
          onClick={() => setSoloDuplicados(!soloDuplicados)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-black text-xs tracking-widest uppercase border transition-all whitespace-nowrap self-end ${
            soloDuplicados
              ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
              : "bg-slate-800/50 text-slate-500 border-white/10 hover:text-amber-400 hover:border-amber-500/30"
          }`}
        >
          ⚠️ Duplicados
          {duplicados.size > 0 && (
            <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-black ${
              soloDuplicados ? "bg-amber-500/30 text-amber-300" : "bg-slate-700 text-slate-400"
            }`}>
              {duplicados.size}
            </span>
          )}
        </button>

        {/* Contador */}
        <p className="text-xs text-slate-500 font-bold whitespace-nowrap self-end pb-2.5">
          {filtrados.length} alumnos
        </p>
      </div>

      {/* ── BARRA DE ACCIÓN MASIVA (aparece cuando hay selección) ──── */}
      {seleccionados.size > 0 && (
        <div className="flex items-center justify-between gap-4 bg-red-500/10 border border-red-500/25 rounded-2xl px-5 py-3 animate-fade-in">
          <p className="text-red-400 font-black text-sm">
            {seleccionados.size} alumno{seleccionados.size > 1 ? "s" : ""} seleccionado{seleccionados.size > 1 ? "s" : ""}
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSeleccionados(new Set())}
              className="text-xs font-bold text-slate-500 hover:text-slate-300 transition-colors px-3 py-1.5 rounded-xl hover:bg-white/5"
            >
              Deseleccionar todo
            </button>
            <button
              onClick={() => setModalMasivo(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white font-black text-xs rounded-xl border border-red-500/30 transition-all active:scale-95"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Eliminar seleccionados
            </button>
          </div>
        </div>
      )}

      {/* Alerta duplicados */}
      {duplicados.size > 0 && !soloDuplicados && (
        <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl px-5 py-3">
          <span className="text-amber-400 text-sm">⚠️</span>
          <p className="text-amber-400/80 text-xs font-bold">
            Se detectaron <span className="text-amber-400">{duplicados.size} registros duplicados</span>. Usa el filtro "Duplicados" para ubicarlos.
          </p>
        </div>
      )}

      {/* ── TABLA ─────────────────────────────────────────────────── */}
      <div className="bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-left">
                {/* Checkbox seleccionar todos */}
                <th className="px-4 py-4 w-10">
                  <button
                    onClick={toggleTodos}
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                      todosSeleccionados
                        ? "bg-red-500 border-red-500"
                        : "border-slate-600 hover:border-red-400"
                    }`}
                  >
                    {todosSeleccionados && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12">
                        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>
                </th>
                <th className="px-4 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Alumno</th>
                <th className="px-4 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Grado / Sección</th>
                <th className="px-4 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Respuestas</th>
                <th className="px-4 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Acción</th>
              </tr>
            </thead>
            <tbody>
              {filtradosPaginados.map((alumno, i) => {
                const esDuplicado = duplicados.has(alumno.estudiante_id)
                const estaSeleccionado = seleccionados.has(alumno.estudiante_id)
                return (
                  <tr
                    key={alumno.estudiante_id}
                    onClick={() => toggleUno(alumno.estudiante_id)}
                    className={`
                      border-b border-white/5 transition-colors cursor-pointer
                      ${estaSeleccionado
                        ? "bg-red-500/10 hover:bg-red-500/15"
                        : esDuplicado
                          ? "bg-amber-500/5 hover:bg-amber-500/10"
                          : i % 2 === 0
                            ? "hover:bg-white/2"
                            : "bg-white/1 hover:bg-white/2"
                      }
                    `}
                  >
                    {/* Checkbox individual */}
                    <td className="px-4 py-4" onClick={e => { e.stopPropagation(); toggleUno(alumno.estudiante_id) }}>
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                        estaSeleccionado
                          ? "bg-red-500 border-red-500"
                          : "border-slate-600 hover:border-red-400"
                      }`}>
                        {estaSeleccionado && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12">
                            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        {esDuplicado && (
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                        )}
                        <div>
                          <p className={`font-bold capitalize ${
                            estaSeleccionado ? "text-red-300" : esDuplicado ? "text-amber-200" : "text-white"
                          }`}>
                            {alumno.nombres} {alumno.apellidos}
                          </p>
                          <p className="text-[10px] text-slate-600 font-mono mt-0.5">{alumno.estudiante_id.slice(0, 8)}…</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <span className="text-cyan-400 font-black">
                        {nivel === "inicial" ? "Inicial" : `${alumno.grado}°`}
                      </span>
                      <span className="text-slate-500 font-bold ml-2">Sec. {alumno.seccion}</span>
                    </td>

                    <td className="px-4 py-4 text-center">
                      <span className={`inline-block font-black text-xs px-3 py-1 rounded-full ${
                        esDuplicado ? "bg-amber-500/20 text-amber-400" : "bg-slate-800 text-slate-300"
                      }`}>
                        {alumno.total}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-center" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => onSolicitarEliminar({
                          nombres: alumno.nombres,
                          apellidos: alumno.apellidos,
                          estudiante_id: alumno.estudiante_id,
                        })}
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 font-bold text-xs rounded-xl border border-red-500/20 hover:border-red-500/40 transition-all active:scale-95"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Eliminar
                      </button>
                    </td>
                  </tr>
                )
              })}
              {filtrados.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-600 font-bold">
                    {soloDuplicados ? "¡No hay duplicados detectados!" : "No se encontraron alumnos."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-between items-center mt-2">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
          Mostrando {filtradosPaginados.length} de {filtrados.length} alumnos
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white disabled:opacity-30 transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage(p => p + 1)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white disabled:opacity-30 transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ── MODAL ELIMINACIÓN MASIVA ───────────────────────────────── */}
      {modalMasivo && (
        <ModalMasivo
          alumnos={alumnosSeleccionados}
          loading={eliminando}
          onConfirm={async (modo) => {
            await onEliminarMasivo(
              alumnosSeleccionados.map(a => ({
                nombres: a.nombres,
                apellidos: a.apellidos,
                estudiante_id: a.estudiante_id,
              })),
              modo
            )
            setModalMasivo(false)
            setSeleccionados(new Set())
          }}
          onCancel={() => setModalMasivo(false)}
        />
      )}
    </div>
  )
}

// ── Modal confirmación eliminación masiva ────────────────────────────────────
function ModalMasivo({
  alumnos,
  loading,
  onConfirm,
  onCancel,
}: {
  alumnos: { nombres: string; apellidos: string; estudiante_id: string }[]
  loading: boolean
  onConfirm: (modo: "respuestas" | "completo") => void
  onCancel: () => void
}) {
  const [modo, setModo] = useState<"respuestas" | "completo">("respuestas")

  if (typeof document === "undefined") return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-red-500/30 rounded-3xl p-8 max-w-lg w-full mx-4 shadow-2xl shadow-red-500/10 z-70">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-500/10 rounded-xl">
            <AlertCircle className="w-6 h-6 text-red-400" />
          </div>
          <h3 className="text-lg font-black text-white">
            Eliminar {alumnos.length} alumno{alumnos.length > 1 ? "s" : ""}
          </h3>
        </div>

        {/* Lista de alumnos seleccionados */}
        <div className="max-h-36 overflow-y-auto mb-5 space-y-1 pr-1">
          {alumnos.map(a => (
            <div key={a.estudiante_id} className="flex items-center gap-2 bg-slate-800/50 rounded-xl px-3 py-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
              <span className="text-white text-xs font-bold capitalize">
                {a.nombres} {a.apellidos} ({a.estudiante_id.slice(0, 8)}…)
              </span>
            </div>
          ))}
        </div>

        {/* Selector modo */}
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">¿Qué deseas eliminar?</p>
        <div className="space-y-2 mb-5">
          <button
            type="button"
            onClick={() => setModo("respuestas")}
            disabled={loading}
            className={`w-full flex items-start gap-3 p-3.5 rounded-2xl border text-left transition-all ${
              modo === "respuestas"
                ? "bg-orange-500/10 border-orange-500/40 text-orange-300"
                : "bg-slate-800/40 border-white/5 text-slate-400 hover:border-white/10"
            }`}
          >
            <div className={`mt-0.5 w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
              modo === "respuestas" ? "border-orange-400" : "border-slate-600"
            }`}>
              {modo === "respuestas" && <div className="w-2 h-2 rounded-full bg-orange-400" />}
            </div>
            <div>
              <p className="font-black text-sm">Solo las respuestas</p>
              <p className="text-xs opacity-60 mt-0.5">Los estudiantes permanecen en la base de datos.</p>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setModo("completo")}
            disabled={loading}
            className={`w-full flex items-start gap-3 p-3.5 rounded-2xl border text-left transition-all ${
              modo === "completo"
                ? "bg-red-500/10 border-red-500/40 text-red-300"
                : "bg-slate-800/40 border-white/5 text-slate-400 hover:border-white/10"
            }`}
          >
            <div className={`mt-0.5 w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
              modo === "completo" ? "border-red-400" : "border-slate-600"
            }`}>
              {modo === "completo" && <div className="w-2 h-2 rounded-full bg-red-400" />}
            </div>
            <div>
              <p className="font-black text-sm">Eliminar todo (alumno completo)</p>
              <p className="text-xs opacity-60 mt-0.5">Borra respuestas y el registro del estudiante. Irreversible.</p>
            </div>
          </button>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-3 rounded-2xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 font-bold text-sm transition-all"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => onConfirm(modo)}
            disabled={loading}
            className={`flex-1 py-3 rounded-2xl font-black text-sm transition-all border flex items-center justify-center gap-2 ${
              modo === "completo"
                ? "bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white border-red-500/30"
                : "bg-orange-500/20 hover:bg-orange-500 text-orange-400 hover:text-white border-orange-500/30"
            }`}
          >
            {loading ? (
              <span className="animate-pulse">Eliminando...</span>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                {modo === "completo" ? "Eliminar todo" : "Eliminar respuestas"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

// ── SidebarItem actualizado (con prop collapsed y danger) ────────────────────
function SidebarItem({
  icon, label, active, onClick, collapsed, danger
}: {
  icon: React.ReactNode
  label: string
  active: boolean
  onClick: () => void
  collapsed?: boolean
  danger?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={collapsed ? label : undefined}
      className={`
        w-full flex items-center gap-3 rounded-2xl font-bold text-sm transition-all
        ${collapsed ? "justify-center px-3 py-3" : "px-4 py-3"}
        ${danger
          ? active
            ? "bg-red-500/10 text-red-400 border border-red-500/30"
            : "text-slate-600 hover:text-red-400 hover:bg-red-500/10 border border-transparent"
          : active
            ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 translate-x-1"
            : "text-slate-500 hover:text-slate-300 hover:bg-white/5 border border-transparent"
        }
      `}
    >
      {icon}
      {!collapsed && <span className="truncate">{label}</span>}
    </button>
  )
}
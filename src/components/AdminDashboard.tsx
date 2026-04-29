import { useEffect, useState, useMemo } from "react"
import { getRespuestasDashboard } from "../services/dashboard.service"
import { logout } from "../services/auth.service"
import {
  agruparPorGrado,
  agruparPorSeccion,
  analisisPorPregunta,
  emocionesPredominantes,
  detectarAlumnosRiesgo
} from "../utils/dashboard.utils"

import DashboardFilters from "./dashboard/DashboardFilters"
import DashboardCharts from "./dashboard/DashboardCharts"
import DashboardRiesgoTable from "./dashboard/DashboardRiesgoTable"
import DashboardPreguntas from "./dashboard/DashboardPreguntas"
import DashboardRawTable from "./dashboard/DashboardRawTable"
import { LogOut, LayoutDashboard, Users, AlertTriangle, FileText, BarChart3 } from "lucide-react"
import DotField from "./DotField"

export default function AdminDashboard() {
  const [data, setData] = useState<any[]>([]);
  const [gradoFiltro, setGradoFiltro] = useState("todos")
  const [seccionFiltro, setSeccionFiltro] = useState("todos")
  const [activeTab, setActiveTab] = useState("stats") // stats, questions, risk, raw

  const cargar = async () => {
    try {
      const res = await getRespuestasDashboard()
      setData(res || [])
    } catch (err) { console.error(err) }
  }

useEffect(() => {
    // Carga inicial al abrir el panel
    cargar();
    
    // Actualización silenciosa automática cada 30 segundos
    // Así no colapsas Supabase aunque 500 niños estén haciendo clics
    const intervalo = setInterval(() => {
      cargar();
    }, 30000);

    return () => clearInterval(intervalo);
  }, []);

const dataFiltrada = useMemo(() => {
  return data.filter((item: any) => {
    const est = Array.isArray(item.estudiantes) ? item.estudiantes[0] : item.estudiantes
    const grado = est?.grado != null ? String(est.grado).trim() : "sin_grado"
    const seccion = est?.seccion ? String(est.seccion).trim().toUpperCase() : ""

    const pasaGrado = gradoFiltro === "todos" || grado === String(gradoFiltro).trim()

    // Inicial tiene seccion "Única" — si filtramos por sección y el alumno
    // es de Inicial, solo pasa si el filtro de grado lo seleccionó explícitamente
    const esInicial = grado === "0"
    const pasaSeccion = seccionFiltro === "todos" 
      || (esInicial ? false : seccion === seccionFiltro.toUpperCase())

    return pasaGrado && pasaSeccion
  })
}, [data, gradoFiltro, seccionFiltro])

  return (
    <div className="flex min-h-screen bg-[#050505] text-white font-sans overflow-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <DotField bulgeStrength={30} dotRadius={0.8} dotSpacing={25} cursorRadius={200} cursorForce={0.1} gradientFrom="#0891b2" gradientTo="#020617" sparkle={false} />
      </div>

      {/* SIDEBAR IZQUIERDO */}
      <aside className="relative z-20 w-64 border-r border-white/5 bg-black/40 backdrop-blur-xl flex flex-col">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-8">
            <LayoutDashboard className="text-cyan-400 w-8 h-8" />
            <span className="font-black tracking-tighter text-2xl">SISTEMA</span>
          </div>
          
          <nav className="space-y-3">
            <SidebarItem icon={<BarChart3 />} label="Estadísticas" active={activeTab === 'stats'} onClick={() => setActiveTab('stats')} />
            <SidebarItem icon={<FileText />} label="Frecuencias" active={activeTab === 'questions'} onClick={() => setActiveTab('questions')} />
            <SidebarItem icon={<AlertTriangle />} label="Riesgo (1-20)" active={activeTab === 'risk'} onClick={() => setActiveTab('risk')} />
            <SidebarItem icon={<Users />} label="Detalle Alumnos" active={activeTab === 'raw'} onClick={() => setActiveTab('raw')} />
          </nav>
        </div>

        <div className="mt-auto p-6">
          <button onClick={async () => { await logout(); window.location.replace("/") }} 
            className="w-full flex items-center justify-center gap-3 p-4 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-2xl transition-all font-bold text-xs tracking-widest border border-transparent hover:border-red-500/20">
            <LogOut className="w-4 h-4" /> CERRAR SESIÓN
          </button>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="relative z-10 flex-1 overflow-y-auto p-8 md:p-12">
        <header className="mb-10 flex flex-col xl:flex-row xl:justify-between xl:items-end gap-6">
          <div>
            <h2 className="text-4xl font-black tracking-tighter uppercase text-white drop-shadow-md">
              {activeTab === 'stats' && "Panel General"}
              {activeTab === 'questions' && "Análisis por Pregunta"}
              {activeTab === 'risk' && "Atención Prioritaria"}
              {activeTab === 'raw' && "Auditoría Completa"}
            </h2>
            <p className="text-cyan-400/70 font-bold text-xs tracking-[0.3em] mt-2">
              Mostrando {dataFiltrada.length} de {data.length} registros (Límite: 10,000)
            </p>
          </div>
          
          <DashboardFilters 
            grado={gradoFiltro} seccion={seccionFiltro} total={dataFiltrada.length}
            onGradoChange={setGradoFiltro} onSeccionChange={setSeccionFiltro} dataFiltrada={dataFiltrada}
          />
        </header>

        <div className="animate-fade-in">
          {activeTab === 'stats' && (
            <DashboardCharts 
              porGrado={agruparPorGrado(dataFiltrada)} 
              porSeccion={agruparPorSeccion(dataFiltrada)} 
              emociones={emocionesPredominantes(dataFiltrada)} 
            />
          )}
          
          {activeTab === 'questions' && (
            <DashboardPreguntas analisis={analisisPorPregunta(dataFiltrada)} />
          )}

          {activeTab === 'risk' && (
            <DashboardRiesgoTable 
              alumnos={detectarAlumnosRiesgo(dataFiltrada)} 
              totalData={dataFiltrada.length} 
            />
          )}

          {/* LA NUEVA TABLA QUE QUERÍAS */}
          {activeTab === 'raw' && (
             <DashboardRawTable data={dataFiltrada} />
          )}
        </div>
      </main>
    </div>
  )
}

function SidebarItem({ icon, label, active, onClick }: any) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-sm transition-all shadow-sm ${
      active ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 translate-x-2' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5 border border-transparent'
    }`}>
      {icon} {label}
    </button>
  )
}
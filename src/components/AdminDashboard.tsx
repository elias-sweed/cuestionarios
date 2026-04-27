import { useEffect, useState, useMemo } from "react"
import { supabase } from "../lib/supabaseClient"
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
import { LogOut, LayoutDashboard } from "lucide-react"
import DotField from "./DotField" // Importamos el fondo

export default function AdminDashboard() {
  const [data, setData] = useState<any[]>([]);
  const [gradoFiltro, setGradoFiltro] = useState("todos")
  const [seccionFiltro, setSeccionFiltro] = useState("todos")

  const cargar = async () => {
    try {
      const res = await getRespuestasDashboard()
      setData(res || [])
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    cargar()
    const channel = supabase.channel("realtime-respuestas")
      .on("postgres_changes", { event: "*", schema: "public", table: "respuestas" }, () => cargar())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  const dataFiltrada = useMemo(() => {
    return data.filter((item: any) => {
      const est = Array.isArray(item.estudiantes) ? item.estudiantes[0] : item.estudiantes
      const grado = est?.grado != null ? String(est.grado).trim() : ""
      const seccion = est?.seccion ? String(est.seccion).trim().toUpperCase() : ""
      return (gradoFiltro === "todos" || grado === gradoFiltro) && 
             (seccionFiltro === "todos" || seccion === seccionFiltro.toUpperCase())
    })
  }, [data, gradoFiltro, seccionFiltro])

  return (
    <div className="relative min-h-screen bg-[#050505] p-6 md:p-12 space-y-10 font-sans overflow-x-hidden">
      {/* Fondo de puntos: Ajustado para que no distraiga (fuerza y brillo menor) */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <DotField
          dotRadius={0.8}
          dotSpacing={25}
          bulgeStrength={30}
          glowRadius={250}
          sparkle={false} // Desactivado para que no distraiga al leer datos
          cursorRadius={200}
          cursorForce={0.1}
          gradientFrom="#0891b2" // Cian
          gradientTo="#020617"   // Negro azulado
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-10">
        {/* Header con estilo Glass */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-3xl shadow-[0_0_20px_rgba(6,182,212,0.15)] text-cyan-400">
              <LayoutDashboard className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-white tracking-tighter">SISTEMA CONTROL</h1>
              <p className="text-cyan-400/50 font-bold uppercase text-xs tracking-[0.3em]">Gestión de Resultados v2.0</p>
            </div>
          </div>
          
          <button 
            onClick={async () => { await logout(); window.location.replace("/") }} 
            className="group flex items-center gap-3 px-8 py-4 bg-slate-900/50 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-4xl border border-white/5 transition-all font-black text-xs tracking-widest shadow-xl backdrop-blur-md"
          >
            <LogOut className="w-5 h-5 group-hover:rotate-12 transition-transform" /> CERRAR SESIÓN
          </button>
        </div>

        {/* Contenedores de secciones con espaciado */}
        <div className="grid gap-10">
          <DashboardFilters 
            grado={gradoFiltro} 
            seccion={seccionFiltro} 
            total={dataFiltrada.length}
            onGradoChange={setGradoFiltro}
            onSeccionChange={setSeccionFiltro}
            dataFiltrada={dataFiltrada}
          />

          <DashboardCharts 
            porGrado={agruparPorGrado(dataFiltrada)} 
            porSeccion={agruparPorSeccion(dataFiltrada)} 
            emociones={emocionesPredominantes(dataFiltrada)} 
          />

          <DashboardPreguntas analisis={analisisPorPregunta(dataFiltrada)} />

          <DashboardRiesgoTable 
            alumnos={detectarAlumnosRiesgo(dataFiltrada)} 
            totalData={dataFiltrada.length} 
          />
        </div>
      </div>
    </div>
  )
}
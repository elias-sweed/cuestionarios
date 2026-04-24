import { exportarDashboardExcel } from "../../utils/exportExcel"
import { Download, Filter, Activity } from "lucide-react"

interface Props {
  grado: string
  seccion: string
  total: number
  onGradoChange: (v: string) => void
  onSeccionChange: (v: string) => void
  dataFiltrada: any[]
}

export default function DashboardFilters({ grado, seccion, total, onGradoChange, onSeccionChange, dataFiltrada }: Props) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900/50 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/5 shadow-2xl">
      
      {/* Contador de Respuestas */}
      <div className="space-y-1">
        <p className="flex items-center gap-2 text-xs font-black text-cyan-400 uppercase tracking-[0.2em]">
          <Activity className="w-4 h-4 animate-pulse" /> Estado Actual
        </p>
        <p className="text-4xl font-black text-white tracking-tighter">
          {total} <span className="text-lg font-medium text-slate-500 tracking-normal italic">respuestas</span>
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-4">
        {/* Selector de Grado */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase ml-1 tracking-widest">
            <Filter className="w-3 h-3 text-cyan-500" /> Grado Académico
          </label>
          <select
            value={grado}
            onChange={(e) => onGradoChange(e.target.value)}
            className="min-w-[160px] border border-white/10 bg-slate-950/50 text-white rounded-2xl px-4 py-3.5 focus:bg-slate-900 focus:ring-2 focus:ring-cyan-500/50 outline-none transition-all text-sm font-bold appearance-none cursor-pointer hover:border-cyan-500/30"
          >
            <option value="todos" className="bg-slate-900">Todos los grados</option>
            <option value="0" className="bg-slate-900">Inicial (5 años)</option> 
            {[1, 2, 3, 4, 5, 6].map((g) => (
                <option key={g} value={String(g)} className="bg-slate-900">{g}° Grado</option>
            ))}
          </select>
        </div>

        {/* Selector de Sección */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase ml-1 tracking-widest">
            <Filter className="w-3 h-3 text-cyan-500" /> Sección
          </label>
          <select
            value={seccion}
            onChange={(e) => onSeccionChange(e.target.value)}
            className="min-w-[160px] border border-white/10 bg-slate-950/50 text-white rounded-2xl px-4 py-3.5 focus:bg-slate-900 focus:ring-2 focus:ring-cyan-500/50 outline-none transition-all text-sm font-bold appearance-none cursor-pointer hover:border-cyan-500/30"
          >
            <option value="todos" className="bg-slate-900">Todas las secciones</option>
            {["A", "B", "C", "D", "E", "F"].map((s) => (
                <option key={s} value={s} className="bg-slate-900">Sección {s}</option>
            ))}
          </select>
        </div>

        {/* Botón Exportar */}
        <button
          onClick={() => exportarDashboardExcel(dataFiltrada)}
          className="group px-8 py-3.5 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white font-black rounded-2xl flex items-center gap-2 border border-emerald-500/20 transition-all duration-300 shadow-lg shadow-emerald-500/5 active:scale-95"
        >
          <Download className="w-5 h-5 group-hover:-translate-y-1 transition-transform" /> 
          <span className="text-xs tracking-widest uppercase">Exportar Excel</span>
        </button>
      </div>
    </div>
  )
}
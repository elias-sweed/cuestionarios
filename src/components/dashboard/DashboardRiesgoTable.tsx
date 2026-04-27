import { CheckCircle2, Inbox, ShieldAlert } from "lucide-react"

interface Props {
  alumnos: any[]
  totalData: number
}

export default function DashboardRiesgoTable({ alumnos, totalData }: Props) {
  return (
    <div className="bg-slate-900/50 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/5 shadow-2xl">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-3">
          <ShieldAlert className="w-6 h-6 text-red-500" />
          Atención Prioritaria
        </h2>
        
        {alumnos.length > 0 && (
          <span className="bg-red-500/10 border border-red-500/50 text-red-500 text-[10px] py-2 px-4 rounded-xl font-black animate-pulse tracking-[0.2em]">
            {alumnos.length} CASOS CRÍTICOS DETECTADOS
          </span>
        )}
      </div>

      <div className="overflow-hidden border border-white/5 rounded-3xl bg-slate-950/20">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-slate-900/80 text-slate-500 font-black uppercase tracking-widest text-[10px]">
              <tr>
                <th className="px-6 py-5 border-b border-white/5">Estudiante</th>
                <th className="px-6 py-5 border-b border-white/5">Grado / Sección</th>
                <th className="px-6 py-5 border-b border-white/5 text-center">Puntaje</th>
                <th className="px-6 py-5 border-b border-white/5 text-center">Nivel Riesgo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {alumnos.map((alumno) => (
                <tr key={alumno.estudiante_id} className="hover:bg-white/2 transition-colors group">
                  <td className="px-6 py-5 font-bold text-slate-200 uppercase italic tracking-wide group-hover:text-white transition-colors">
                    {alumno.nombres} {alumno.apellidos}
                  </td>
                  <td className="px-6 py-5 font-medium text-slate-500">
                    <span className="bg-slate-900 px-3 py-1 rounded-lg border border-white/5">
                      {alumno.grado === '0' ? 'Inicial' : `${alumno.grado}°`} - {alumno.seccion}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className="font-black text-white bg-slate-900 w-10 h-10 inline-flex items-center justify-center rounded-full border border-white/10 shadow-inner">
                      {alumno.score}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                      alumno.riesgo === 'alto' 
                        ? 'bg-red-500/10 border-red-500/30 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.1)]' 
                        : alumno.riesgo === 'medio' 
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' 
                        : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        alumno.riesgo === 'alto' ? 'bg-red-500 animate-ping' : 
                        alumno.riesgo === 'medio' ? 'bg-amber-500' : 'bg-emerald-500'
                      }`} />
                      {alumno.riesgo}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Estado: Sin datos */}
        {totalData === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-slate-600 bg-slate-950/40">
            <Inbox className="w-16 h-16 mb-4 opacity-10" />
            <p className="text-xl font-black uppercase tracking-[0.2em] opacity-40">Sin Registros</p>
            <p className="text-xs font-medium tracking-widest uppercase opacity-30 mt-2">Esperando entrada de datos del sistema...</p>
          </div>
        )}

        {/* Estado: Todo OK */}
        {totalData > 0 && alumnos.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 bg-emerald-500/2">
            <div className="relative mb-6">
              <CheckCircle2 className="w-20 h-20 text-emerald-500/20" />
              <CheckCircle2 className="w-20 h-20 text-emerald-500 absolute inset-0 blur-xl opacity-40" />
            </div>
            <p className="text-2xl font-black uppercase tracking-tighter text-emerald-500">Sistema Seguro</p>
            <p className="text-xs font-bold text-emerald-500/50 uppercase tracking-[0.3em] mt-2">No se detectaron anomalías en el grupo actual</p>
          </div>
        )}
      </div>
    </div>
  )
}
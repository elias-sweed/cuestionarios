import { Inbox, ShieldAlert } from "lucide-react"

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
            {alumnos.length} CASOS DETECTADOS
          </span>
        )}
      </div>

      <div className="overflow-hidden border border-white/5 rounded-3xl bg-slate-950/20">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/80 border-b border-white/5">
                <th className="px-6 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">Estudiante</th>
                <th className="px-6 py-5 text-xs font-black text-slate-500 uppercase tracking-widest text-center">Grado y Sección</th>
                <th className="px-6 py-5 text-xs font-black text-slate-500 uppercase tracking-widest text-center">Riesgo Detectado</th>
                <th className="px-6 py-5 text-xs font-black text-slate-500 uppercase tracking-widest text-center">Puntuación (Escala 20)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {alumnos.map((alumno) => (
                <tr key={alumno.estudiante_id} className="hover:bg-white/2 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-300">
                    {alumno.nombres} {alumno.apellidos}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="bg-cyan-500/10 text-cyan-400 px-3 py-1 rounded-lg font-bold text-xs border border-cyan-500/20">
                      {alumno.grado}° "{alumno.seccion}"
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-4 py-2 inline-flex items-center gap-2 rounded-xl font-black text-[10px] uppercase tracking-widest border ${
                      alumno.riesgo === 'Alto' ? 'bg-red-500/10 text-red-400 border-red-500/30' :
                      alumno.riesgo === 'Medio' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                      'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    }`}>
                      {alumno.riesgo}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {/* 🔥 AQUÍ MOSTRAMOS LA ESCALA 1 A 20 🔥 */}
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-xl font-black text-white">{alumno.score}</span>
                      <span className="text-xs font-medium text-slate-500">/ 20</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalData === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-slate-600">
            <Inbox className="w-16 h-16 mb-4 opacity-10" />
            <p className="text-xl font-black uppercase tracking-[0.2em] opacity-40">Sin Registros</p>
          </div>
        )}
      </div>
    </div>
  )
}
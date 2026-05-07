import { useState } from "react"
import { MessageSquare } from "lucide-react"

interface Props {
  analisis: any[]
}

export default function DashboardPreguntas({ analisis }: Props) {
  const [expandida, setExpandida] = useState<Record<number, boolean>>({})
  const LIMITE_VISIBLE = 5

  return (
    <div className="bg-slate-900/50 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/5 shadow-2xl">
      <h2 className="text-xl font-black text-white mb-8 tracking-tight flex items-center gap-3">
        <MessageSquare className="w-6 h-6 text-cyan-400" />
        Frecuencia de Respuestas
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {analisis.map((item, idx) => {
          const respuestasOrdenadas = Object.entries(item.respuestas ?? {})
            .map(([resp, count]) => ({ resp, count: Number(count) || 0 }))
            .sort((a, b) => b.count - a.count)

          const total = respuestasOrdenadas.reduce((acc, r) => acc + r.count, 0)
          const mostrarTodas = !!expandida[idx]
          const respuestasVisibles = mostrarTodas
            ? respuestasOrdenadas
            : respuestasOrdenadas.slice(0, LIMITE_VISIBLE)
          const hayMas = respuestasOrdenadas.length > LIMITE_VISIBLE

          return (
            <div
              key={idx}
              className="bg-slate-950/40 border border-white/5 p-6 rounded-3xl hover:border-cyan-500/30 transition-all duration-300 group"
            >
              <p className="font-bold text-cyan-300 text-sm mb-2 leading-relaxed">
                {item.pregunta}
              </p>
              <p className="text-[11px] text-slate-500 font-semibold mb-5">
                Mostrando {respuestasVisibles.length} de {respuestasOrdenadas.length} respuestas distintas
              </p>

              <div className="space-y-2">
                {respuestasVisibles.map(({ resp, count }) => {
                  const porcentaje = total > 0 ? (count / total) * 100 : 0
                  return (
                    <div
                      key={resp}
                      className="bg-slate-900/50 px-4 py-3 rounded-xl border border-white/5 group-hover:border-white/10 transition-colors"
                    >
                      <div className="flex justify-between items-center gap-3">
                        <span className="font-medium text-slate-300 text-xs truncate">
                          {resp}
                        </span>
                        <span className="font-black text-cyan-400 bg-cyan-950/50 px-3 py-1.5 rounded-lg border border-cyan-500/20 text-xs whitespace-nowrap">
                          {count} ({porcentaje.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="mt-2 h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-cyan-500/70 rounded-full"
                          style={{ width: `${Math.min(porcentaje, 100)}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>

              {hayMas && (
                <button
                  type="button"
                  onClick={() => setExpandida(prev => ({ ...prev, [idx]: !prev[idx] }))}
                  className="mt-4 text-xs font-black tracking-wide text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  {mostrarTodas ? "Ver menos" : `Ver ${respuestasOrdenadas.length - LIMITE_VISIBLE} más`}
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
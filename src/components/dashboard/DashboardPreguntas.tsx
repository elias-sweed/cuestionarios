import { MessageSquare } from "lucide-react"

interface Props {
  analisis: any[]
}

export default function DashboardPreguntas({ analisis }: Props) {
  return (
    <div className="bg-slate-900/50 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/5 shadow-2xl">
      <h2 className="text-xl font-black text-white mb-8 tracking-tight flex items-center gap-3">
        <MessageSquare className="w-6 h-6 text-cyan-400" />
        Frecuencia de Respuestas
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {analisis.map((item) => (
          <div 
            key={item.pregunta} 
            className="bg-slate-950/40 border border-white/5 p-6 rounded-3xl hover:border-cyan-500/30 transition-all duration-300 group"
          >
            <p className="font-black text-slate-500 text-[10px] uppercase tracking-[0.2em] mb-4 flex justify-between items-center">
              Identificador 
              <span className="text-cyan-400 bg-cyan-400/10 px-2 py-1 rounded-lg">
                ID: {item.pregunta}
              </span>
            </p>
            
            <div className="space-y-2">
              {Object.entries(item.respuestas).map(([resp, count]) => (
                <div 
                  key={resp} 
                  className="flex justify-between items-center bg-slate-900/50 px-4 py-3 rounded-xl border border-white/5 group-hover:border-white/10 transition-colors"
                >
                  <span className="font-bold text-slate-300 text-xs truncate mr-2">
                    {resp}
                  </span>
                  <span className="font-black text-cyan-400 bg-cyan-950/50 border border-cyan-500/20 px-3 py-1 rounded-lg text-[10px] shadow-[0_0_10px_rgba(6,182,212,0.1)]">
                    {String(count)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
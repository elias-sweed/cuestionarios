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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {analisis.map((item, idx) => (
          <div 
            key={idx} 
            className="bg-slate-950/40 border border-white/5 p-6 rounded-3xl hover:border-cyan-500/30 transition-all duration-300 group"
          >
            {/* 🔥 AQUÍ MUESTRA LA PREGUNTA COMPLETA 🔥 */}
            <p className="font-bold text-cyan-300 text-sm mb-6 leading-relaxed">
              {item.pregunta}
            </p>
            
            <div className="space-y-2">
              {Object.entries(item.respuestas).map(([resp, count]) => (
                <div 
                  key={resp} 
                  className="flex justify-between items-center bg-slate-900/50 px-4 py-3 rounded-xl border border-white/5 group-hover:border-white/10 transition-colors"
                >
                  <span className="font-medium text-slate-300 text-xs truncate mr-4">
                    {resp}
                  </span>
                  <span className="font-black text-cyan-400 bg-cyan-950/50 px-3 py-1.5 rounded-lg border border-cyan-500/20 text-xs">
                    {Number(count)}
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
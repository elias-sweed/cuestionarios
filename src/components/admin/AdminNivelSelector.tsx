import type { ReactNode } from "react"
import { motion } from "framer-motion"
import { GraduationCap, School, ArrowRight } from "lucide-react"
import DotField from "../DotField"

type NivelCardProps = {
  titulo: string
  descripcion: string
  icono: ReactNode
  href: string
}

function NivelCard({ titulo, descripcion, icono, href }: NivelCardProps) {
  return (
    <button
      type="button"
      onClick={() => window.location.replace(href)}
      className="group relative overflow-hidden w-full text-left bg-slate-900/80 backdrop-blur-2xl p-6 rounded-3xl border border-cyan-500/20 shadow-[0_0_30px_rgba(0,0,0,0.35)] hover:border-cyan-400/50 hover:shadow-[0_0_40px_rgba(8,145,178,0.25)] transition-all active:scale-[0.99]"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-400/5 to-cyan-500/0 translate-x-[-120%] group-hover:translate-x-[120%] transition-transform duration-700" />
      <div className="relative z-10 flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
            {icono}
          </div>
          <h3 className="text-xl font-black text-white tracking-tight">{titulo}</h3>
          <p className="text-sm text-cyan-100/60 font-medium">{descripcion}</p>
        </div>
        <ArrowRight className="w-5 h-5 mt-1 text-cyan-300/70 group-hover:text-cyan-300 group-hover:translate-x-1 transition-all shrink-0" />
      </div>
    </button>
  )
}

export default function AdminNivelSelector() {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#050505] p-4 overflow-hidden">
      <div className="fixed inset-0 z-0">
        <DotField
          dotRadius={1}
          dotSpacing={20}
          bulgeStrength={50}
          glowRadius={300}
          sparkle={true}
          cursorRadius={300}
          cursorForce={0.2}
          gradientFrom="#0891b2"
          gradientTo="#1e3a8a"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-3xl"
      >
        <div className="bg-slate-900/70 backdrop-blur-2xl rounded-[2.5rem] border border-cyan-500/20 p-8 md:p-10 shadow-[0_0_50px_rgba(0,0,0,0.45)]">
          <div className="text-center space-y-2 mb-8">
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">Selecciona el nivel</h2>
            <p className="text-cyan-100/50 text-sm md:text-base font-medium">
              Elige a qué dashboard deseas ingresar.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <NivelCard
              titulo="Dashboard Primaria"
              descripcion="Estadísticas, frecuencias, riesgo y auditoría para 1° a 6°."
              icono={<GraduationCap className="w-6 h-6" />}
              href="/admin/primaria/dashboard"
            />
            <NivelCard
              titulo="Dashboard Inicial"
              descripcion="Panel exclusivo para registros de Inicial."
              icono={<School className="w-6 h-6" />}
              href="/admin/inicial/dashboard"
            />
          </div>
        </div>
      </motion.div>
    </div>
  )
}

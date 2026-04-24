import { useEffect, useState } from "react"
import { obtenerPreguntasPorNivel } from "../services/pregunta.service"
import { guardarRespuesta } from "../services/respuesta.service"
import { mapNivel } from "../utils/mapNivel"
import PreguntaRenderer from "./preguntas/PreguntaRenderer"
import type { Pregunta, Estudiante } from "../types"
import ProgressBar from "./ProgressBar"
import DotField from "./DotField" // Importamos el fondo

interface Props {
  estudiante: Estudiante
}

export default function PreguntasScreen({ estudiante }: Props) {
  const [preguntas, setPreguntas] = useState<Pregunta[]>([])
  const [index, setIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [isAnswering, setIsAnswering] = useState(false)

  const nivel = mapNivel(estudiante.grado)

  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await obtenerPreguntasPorNivel(nivel)
        setPreguntas(data)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [nivel])

  const handleResponder = async (valor: unknown) => {
    if (isAnswering) return 
    setIsAnswering(true)
    
    const pregunta = preguntas[index]

    try {
      await guardarRespuesta({
        estudiante_id: estudiante.id as string,
        pregunta_id: pregunta.id,
        respuesta: valor
      })
      setTimeout(() => {
        setIndex((prev) => prev + 1)
        setIsAnswering(false)
      }, 300)
    } catch (error) {
      console.error("Error al guardar respuesta:", error)
      setIsAnswering(false)
    }
  }

  // Fondo común para todos los estados
  const FondoLayout = ({ children }: { children: React.ReactNode }) => (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-[#0a0f1a]">
      <div className="fixed inset-0 z-0">
        <DotField
          dotRadius={1.2}
          dotSpacing={16}
          bulgeStrength={60}
          glowRadius={200}
          sparkle={false}
          waveAmplitude={0}
          cursorRadius={400}
          cursorForce={0.15}
          bulgeOnly
          gradientFrom="#2563eb"
          gradientTo="#1e3a8a"
          glowColor="#0f172a"
        />
      </div>
      <div className="relative z-10 w-full flex justify-center">
        {children}
      </div>
    </div>
  )

  if (loading) {
    return (
      <FondoLayout>
        <div className="flex flex-col items-center">
          <div className="h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
          <p className="mt-4 text-blue-200 font-medium animate-pulse">Preparando tu cuestionario...</p>
        </div>
      </FondoLayout>
    )
  }

  if (index >= preguntas.length) {
    return (
      <FondoLayout>
        <div className="bg-slate-900/80 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-blue-500/30 text-center max-w-md w-full animate-fade-in">
          <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl border border-green-500/50">
            ✅
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">¡Cuestionario Terminado!</h2>
          <p className="text-blue-100/70 mb-8">Gracias por tus respuestas, {estudiante.nombres}.</p>
          
          <button 
            onClick={() => window.location.reload()} 
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 px-4 rounded-xl transition-all duration-200 shadow-[0_0_20px_rgba(37,99,235,0.4)]"
          >
            Siguiente alumno 🔄
          </button>
        </div>
      </FondoLayout>
    )
  }

  const pregunta = preguntas[index]

  return (
    <FondoLayout>
      <div className="max-w-2xl w-full bg-slate-900/80 backdrop-blur-md rounded-3xl shadow-2xl border border-blue-500/30 overflow-hidden">
        
        {/* Header con Progreso */}
        <div className="px-6 py-5 border-b border-white/10 bg-white/5">
          <ProgressBar actual={index + 1} total={preguntas.length} />
          <p className="text-sm text-blue-300 font-medium mt-3">
            Pregunta {index + 1} de {preguntas.length}
          </p>
        </div>

        {/* Cuerpo de la Pregunta */}
        <div key={pregunta.id} className="p-6 sm:p-8 animate-fade-in">
          <h2 className="text-2xl font-semibold text-white mb-8 leading-relaxed">
            {pregunta.texto}
          </h2>

          <div className={`transition-opacity duration-300 ${isAnswering ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
            <PreguntaRenderer
              pregunta={pregunta}
              onResponder={handleResponder}
            />
          </div>
        </div>
        
      </div>
    </FondoLayout>
  )
}
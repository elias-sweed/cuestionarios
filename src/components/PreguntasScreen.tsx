import { useEffect, useState } from "react"
import { obtenerPreguntasPorNivel } from "../services/pregunta.service"
import { guardarRespuesta } from "../services/respuesta.service"
import { mapNivel } from "../utils/mapNivel"
import PreguntaRenderer from "./preguntas/PreguntaRenderer"
import type { Pregunta, Estudiante } from "../types" // Importamos los tipos
import ProgressBar from "./ProgressBar"

interface Props {
  estudiante: Estudiante
}

export default function PreguntasScreen({ estudiante }: Props) {
  const [preguntas, setPreguntas] = useState<Pregunta[]>([])
  const [index, setIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [isAnswering, setIsAnswering] = useState(false) // Previene doble clic rápido

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
    if (isAnswering) return // Evita que el alumno guarde dos veces si da clic rápido
    setIsAnswering(true)
    
    const pregunta = preguntas[index]

    try {
      await guardarRespuesta({
        estudiante_id: estudiante.id as string,
        pregunta_id: pregunta.id,
        respuesta: valor
      })
      // Pequeña pausa para que se sienta natural el cambio
      setTimeout(() => {
        setIndex((prev) => prev + 1)
        setIsAnswering(false)
      }, 300)
    } catch (error) {
      console.error("Error al guardar respuesta:", error)
      setIsAnswering(false)
    }
  }

  // ESTADO: Cargando
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-500 font-medium">Preparando tu cuestionario...</p>
        </div>
      </div>
    )
  }

// ESTADO: Finalizado
  if (index >= preguntas.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center max-w-md w-full animate-fade-in">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
            ✅
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">¡Cuestionario Terminado!</h2>
          <p className="text-gray-600 mb-8">Gracias por tus respuestas, {estudiante.nombres}.</p>
          
          <button 
            onClick={() => window.location.reload()} 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 px-4 rounded-xl transition-all duration-200 shadow-md shadow-blue-600/20"
          >
            Siguiente alumno 🔄
          </button>
        </div>
      </div>
    )
  }

  const pregunta = preguntas[index]

  // ESTADO: Cuestionario Activo
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-lg shadow-gray-200/50 border border-gray-100 overflow-hidden">
        
        {/* Header con Progreso */}
        <div className="bg-white px-6 py-5 border-b border-gray-100">
          <ProgressBar actual={index + 1} total={preguntas.length} />
          <p className="text-sm text-gray-500 font-medium mt-2">
            Pregunta {index + 1} de {preguntas.length}
          </p>
        </div>

        {/* Cuerpo de la Pregunta (El `key` fuerza la re-animación al cambiar de índice) */}
        <div key={pregunta.id} className="p-6 sm:p-8 animate-fade-in">
          <h2 className="text-2xl font-semibold text-gray-800 mb-8 leading-relaxed">
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
    </div>
  )
}
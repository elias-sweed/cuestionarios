import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Estudiante } from "../types";
import { PREGUNTAS_INICIAL, FACTORES_RIESGO_CONFIG } from "../constants/preguntasInicial";
import { guardarEvaluacionInicialDB } from "../services/evaluacionService";
import { descargarReporteInicialExcel } from "../utils/exportExcelInicial";
// Importamos el nuevo componente optimizado en lugar de LiquidEther
import SoftAurora from "./SoftAurora";

interface Props {
  estudiante: Estudiante;
}

export default function CuestionarioInicial({ estudiante }: Props) {
  const [paso, setPaso] = useState(0);
  const [direction, setDirection] = useState(0);
  const [loading, setLoading] = useState(false);

  const [respuestas, setRespuestas] = useState<Record<string, number>>({});
  const [riesgos, setRiesgos] = useState<Record<string, number>>({
    moretones: 0, marcas: 0, rasgunos: 0, desaseado: 0,
    partes_intimas: 0, esfinteres: 0, dolor_zona: 0
  });

  const handleCalificar = (puntaje: number) => {
    const preguntaActual = PREGUNTAS_INICIAL[paso];
    setRespuestas((prev) => ({ ...prev, [preguntaActual.id]: puntaje }));
    setDirection(1);
    setPaso(paso + 1);
  };

  const handleToggleRiesgo = (id: string) => {
    setRiesgos((prev) => ({ ...prev, [id]: prev[id] === 0 ? 1 : 0 }));
  };

  const finalizarYGuardar = async () => {
    setLoading(true);
    try {
      await guardarEvaluacionInicialDB(estudiante.id as string, respuestas, riesgos);
    } catch (err) {
      console.error("Error BD", err);
      alert("Hubo un error guardando en la Base de Datos, pero se descargará tu reporte.");
    } finally {
      await descargarReporteInicialExcel(estudiante, respuestas, riesgos as any, PREGUNTAS_INICIAL);
      alert("¡Evaluación finalizada! El Reporte Excel se ha descargado.");
      setLoading(false);
      window.location.reload();
    }
  };

  const esFaseRiesgos = paso === PREGUNTAS_INICIAL.length;
  const preguntaActual = !esFaseRiesgos ? PREGUNTAS_INICIAL[paso] : null;

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 500 : -500, opacity: 0, scale: 0.9 }),
    center: { zIndex: 1, x: 0, opacity: 1, scale: 1 },
    exit: (dir: number) => ({ zIndex: 0, x: dir < 0 ? 500 : -500, opacity: 0, scale: 0.9 })
  };

  return (
    <div className="min-h-screen relative flex flex-col p-4 md:p-8 font-sans overflow-hidden bg-[#08142b]">
      
      {/* 🌌 NUEVO FONDO SOFT AURORA MÁS LIGERO Y CON SUS COLORES */}
      <div className="absolute inset-0 z-0 opacity-80">
        <SoftAurora
          speed={0.6}
          scale={1.5}
          brightness={1}
          color1="#0891b2" // Turquesa
          color2="#0ea5e9" // Celeste
          noiseFrequency={2.5}
          noiseAmplitude={1}
          bandHeight={0.5}
          bandSpread={1}
          octaveDecay={0.1}
          layerOffset={0}
          colorSpeed={1}
          enableMouseInteraction
          mouseInfluence={0.25}
        />
      </div>

      <div className="relative z-10 flex-1 flex flex-col max-w-5xl mx-auto w-full">
        {/* CABECERA */}
        <header className="bg-white/10 backdrop-blur-2xl border border-white/20 px-6 py-4 rounded-3xl shadow-2xl flex justify-between items-center mb-6">
          <div>
            <h1 className="text-xl font-black text-white tracking-tight">Evaluación Inicial</h1>
            <p className="text-sm text-cyan-200/70 italic">Alumno: {estudiante.nombres}</p>
          </div>
          <div className="bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 px-5 py-2 rounded-2xl font-black text-sm uppercase tracking-tighter shadow-lg">
            {esFaseRiesgos ? "FASE FINAL" : `PROGRESO: ${paso + 1} / ${PREGUNTAS_INICIAL.length}`}
          </div>
        </header>

        {/* CONTENEDOR DE ANIMACIÓN */}
        <div className="flex-1 relative flex flex-col">
          <AnimatePresence custom={direction} mode="wait">
            {!esFaseRiesgos && preguntaActual ? (
              <motion.div
                key={preguntaActual.id}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
                className="flex-1 flex flex-col gap-6"
              >
                {/* PREGUNTA PARA EL NIÑO */}
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-[40px] shadow-2xl flex-1 flex flex-col items-center justify-center p-8 text-center">
                  <h2 className="text-3xl md:text-5xl font-black text-white leading-tight mb-8 drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
                    {preguntaActual.titulo}
                  </h2>
                  
                  <div className="relative group">
                    {preguntaActual.imagen ? (
                      <img 
                        src={preguntaActual.imagen} 
                        alt="Cartilla" 
                        className="max-h-95 w-auto object-contain rounded-4xl border-8 border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="w-64 h-64 rounded-full bg-cyan-500/10 border-4 border-dashed border-cyan-400/30 flex items-center justify-center">
                        <span className="text-6xl animate-pulse">📢</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* BOTONES DOCENTE */}
                <div className="bg-slate-900/60 backdrop-blur-xl border border-cyan-500/20 rounded-4xl p-6 shadow-2xl">
                  <p className="text-center text-xs font-black text-cyan-400 uppercase tracking-[0.2em] mb-4">
                    Panel de Calificación
                  </p>
                  <div className="grid grid-cols-3 gap-4">
                    <button onClick={() => handleCalificar(0)} className="group py-5 rounded-2xl font-black text-lg bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500 hover:text-white transition-all shadow-lg active:scale-90">
                      NO LOGRA
                    </button>
                    <button onClick={() => handleCalificar(1)} className="group py-5 rounded-2xl font-black text-lg bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500 hover:text-white transition-all shadow-lg active:scale-90">
                      EN PROCESO
                    </button>
                    <button onClick={() => handleCalificar(2)} className="group py-5 rounded-2xl font-black text-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500 hover:text-white transition-all shadow-lg active:scale-90">
                      LOGRADO
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              /* SECCIÓN RIESGOS */
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900/80 backdrop-blur-3xl border border-white/10 max-w-2xl mx-auto w-full rounded-[40px] shadow-2xl p-8 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-cyan-400 via-sky-500 to-blue-600" />
                <div className="text-center mb-8">
                  <span className="text-5xl mb-2 block">📋</span>
                  <h2 className="text-2xl font-black text-white">Factores de Riesgo</h2>
                  <p className="text-cyan-200/50 text-sm">Observación directa del docente</p>
                </div>

                <div className="space-y-3 mb-8">
                  {FACTORES_RIESGO_CONFIG.map((riesgo) => (
                    <label key={riesgo.id} className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer ${riesgos[riesgo.id] === 1 ? 'border-red-500/50 bg-red-500/10' : 'border-white/5 bg-white/5 hover:bg-white/10'}`}>
                      <span className="text-white font-medium text-sm">{riesgo.label}</span>
                      <input 
                        type="checkbox" 
                        className="w-6 h-6 rounded-lg bg-slate-800 border-white/10 text-red-500 focus:ring-red-500"
                        checked={riesgos[riesgo.id] === 1} 
                        onChange={() => handleToggleRiesgo(riesgo.id)} 
                      />
                    </label>
                  ))}
                </div>

                <button 
                  disabled={loading} 
                  onClick={finalizarYGuardar} 
                  className="w-full py-5 rounded-2xl font-black text-xl text-white bg-linear-to-r from-cyan-500 to-blue-600 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-cyan-900/40 disabled:opacity-50"
                >
                  {loading ? "GUARDANDO..." : "FINALIZAR EVALUACIÓN 🚀"}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
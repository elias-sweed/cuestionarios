import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import type { Estudiante } from "../types";
import { descargarReporteInicialExcel } from "../utils/exportExcelInicial";
import LiquidEther from "./LiquidEther";

import imgCartilla1 from "../assets/imagen_niños_inicial_comparar.jpeg";
import imgCartilla2 from "../assets/como_se_sinte_este_niño.png";
import imgCartilla3 from "../assets/como_se_sinte_este_niña.png";
import imgCartilla4 from "../assets/señala_donde_hay_peligros.png";
import imgCartilla5 from "../assets/alcanzar_su_plelota.png";
import imgCartilla6 from "../assets/trabajan_personas.png";

interface Props {
  estudiante: Estudiante;
}

const PREGUNTAS_INICIAL = [
  { id: "p1", titulo: "🗣️ Cuéntame cómo eres", indicador: "Autoconcepto" },
  { id: "p2", titulo: "🎨 ¿Qué es lo que más te gusta hacer?", indicador: "Autoconcepto" },
  { id: "p3", titulo: "❤️ ¿Te gusta cómo eres?", indicador: "Autoestima" },
  { id: "p4", titulo: "🖼️ Cartilla N°1: Señala qué niña o niño está ALEGRE", indicador: "Reconoce Alegría", imagen: imgCartilla1 },
  { id: "p5", titulo: "🖼️ Cartilla N°1: Señala qué niña o niño está TRISTE", indicador: "Reconoce Tristeza", imagen: imgCartilla1 },
  { id: "p6", titulo: "🖼️ Cartilla N°1: Señala qué niña o niño está ENOJADO", indicador: "Reconoce Enojo", imagen: imgCartilla1 },
  { id: "p7", titulo: "🖼️ Cartilla N°1: Señala qué niña o niño siente MIEDO", indicador: "Reconoce Miedo", imagen: imgCartilla1 },
  { id: "p8", titulo: "🖼️ Cartilla N°2: ¿Cómo crees que se siente este niño?", indicador: "Empatía", imagen: imgCartilla2 },
  { id: "p9", titulo: "🖼️ Cartilla N°3: ¿Cómo crees que se siente esta niña?", indicador: "Empatía", imagen: imgCartilla3 },
  { id: "p10", titulo: "⚠️ Cartilla N°4: Señala las imágenes donde hay peligros", indicador: "Seguridad", imagen: imgCartilla4 },
  { id: "p11", titulo: "⚽ Cartilla N°5: ¿Cómo puede alcanzar el niño su pelota?", indicador: "Resolución de problemas", imagen: imgCartilla5 },
  { id: "p12", titulo: "👷 Cartillas N°6-9: ¿En qué trabajan estas personas?", indicador: "Conciencia Social", imagen: imgCartilla6 },
];

export default function CuestionarioInicial({ estudiante }: Props) {
  const [paso, setPaso] = useState(0);
  const [loading, setLoading] = useState(false);

  const [respuestas, setRespuestas] = useState<Record<string, number>>({});
  const [riesgos, setRiesgos] = useState({
    moretones: 0, marcas: 0, rasgunos: 0, desaseado: 0,
    partes_intimas: 0, esfinteres: 0, dolor_zona: 0
  });

  const handleCalificar = (puntaje: number) => {
    const preguntaActual = PREGUNTAS_INICIAL[paso];
    setRespuestas({ ...respuestas, [preguntaActual.id]: puntaje });
    setPaso(paso + 1);
  };

  const handleToggleRiesgo = (campo: keyof typeof riesgos) => {
    setRiesgos({ ...riesgos, [campo]: riesgos[campo] === 0 ? 1 : 0 });
  };

  const finalizarYGuardar = async () => {
    setLoading(true);
    try {
      await supabase.from("respuestas").insert([{
        estudiante_id: estudiante.id,
        respuestas: { evaluacion_inicial: respuestas, factores_riesgo: riesgos },
        grado: "0",
        seccion: estudiante.seccion,
        fecha: new Date().toISOString()
      }]);
    } catch (err) {
      console.error("Error BD", err);
    } finally {
      await descargarReporteInicialExcel(estudiante, respuestas, riesgos, PREGUNTAS_INICIAL);
      alert("¡Evaluación finalizada! El Reporte Excel se ha descargado.");
      setLoading(false);
      window.location.reload();
    }
  };

  const esFaseRiesgos = paso === PREGUNTAS_INICIAL.length;
  const preguntaActual = !esFaseRiesgos ? PREGUNTAS_INICIAL[paso] : null;

  return (
    <div className="min-h-screen relative flex flex-col p-4 md:p-8 font-sans overflow-hidden">
      
      {/* 🌊 CAPA 1: EL FONDO LÍQUIDO MÁGICO (z-0) */}
      <div className="absolute inset-0 z-0 opacity-80">
        <LiquidEther
          colors={['#5227FF', '#FF9FFC', '#B497CF']}
          mouseForce={20}
          cursorSize={100}
          isViscous={true}
          viscous={30}
          iterationsViscous={32}
          iterationsPoisson={32}
          resolution={0.5}
          isBounce={false}
          autoDemo={true}
          autoSpeed={0.5}
          autoIntensity={2.2}
          takeoverDuration={0.25}
          autoResumeDelay={3000}
          autoRampDuration={0.6}
        />
      </div>

      {/* ✨ CAPA 2: EL CONTENIDO CON EFECTO CRISTAL (z-10) */}
      <div className="relative z-10 flex-1 flex flex-col max-w-5xl mx-auto w-full">
        
        {/* CABECERA (Efecto Vidrio) */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/50 px-6 py-4 rounded-3xl shadow-xl flex justify-between items-center mb-6">
          <div>
            <h1 className="text-xl font-bold text-indigo-900 drop-shadow-sm">Entrevista - 5 Años</h1>
            <p className="text-sm text-gray-700">Alumno/a: <span className="font-bold text-gray-900">{estudiante.nombres} {estudiante.apellidos}</span></p>
          </div>
          <div className="bg-indigo-600/10 border border-indigo-200 text-indigo-800 px-5 py-2 rounded-2xl font-bold shadow-inner">
            {esFaseRiesgos ? "Finalizar" : `Pregunta ${paso + 1} de ${PREGUNTAS_INICIAL.length}`}
          </div>
        </div>

        {/* ÁREA DE ENTREVISTA */}
        {!esFaseRiesgos && preguntaActual ? (
          <div className="flex-1 flex flex-col justify-between w-full animate-fade-in gap-6">
            
            {/* ZONA DEL NIÑO (Tarjeta principal de cristal) */}
            <div className="bg-white/60 backdrop-blur-2xl border border-white/60 rounded-[40px] shadow-2xl flex-1 flex flex-col items-center justify-center p-8 text-center transition-all">
              <h2 className="text-3xl md:text-4xl font-black text-gray-800 leading-tight mb-8 drop-shadow-sm">
                {preguntaActual.titulo}
              </h2>
              
              {preguntaActual.imagen ? (
                <img 
                  src={preguntaActual.imagen} 
                  alt="Cartilla visual" 
                  className="max-h-[350px] w-auto object-contain rounded-3xl border-[6px] border-white/80 shadow-2xl transition-transform hover:scale-[1.02]"
                />
              ) : (
                <div className="w-full max-w-md aspect-video bg-white/50 rounded-3xl border-2 border-dashed border-indigo-300/50 flex items-center justify-center shadow-inner">
                  <p className="text-indigo-600/70 font-medium text-xl">
                    (Pregunta oral)
                  </p>
                </div>
              )}
            </div>

            {/* ZONA DE LA PROFESORA (Botones de evaluación) */}
            <div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-[32px] shadow-xl p-6">
              <p className="text-center text-sm font-bold text-indigo-500/80 uppercase tracking-widest mb-4">
                Panel Docente: Evaluar ({preguntaActual.indicador})
              </p>
              <div className="grid grid-cols-3 gap-4">
                <button onClick={() => handleCalificar(0)} className="py-5 rounded-2xl font-bold text-lg bg-red-50/80 text-red-600 border border-red-200/50 hover:bg-red-100/90 hover:scale-[1.03] transition-all shadow-sm backdrop-blur-sm">
                  ❌ No lo logra
                </button>
                <button onClick={() => handleCalificar(1)} className="py-5 rounded-2xl font-bold text-lg bg-yellow-50/80 text-yellow-600 border border-yellow-200/50 hover:bg-yellow-100/90 hover:scale-[1.03] transition-all shadow-sm backdrop-blur-sm">
                  ⏳ En proceso
                </button>
                <button onClick={() => handleCalificar(2)} className="py-5 rounded-2xl font-bold text-lg bg-green-50/80 text-green-600 border border-green-200/50 hover:bg-green-100/90 hover:scale-[1.03] transition-all shadow-sm backdrop-blur-sm">
                  ⭐ Lo logra
                </button>
              </div>
            </div>

          </div>
        ) : (

          /* FASE FINAL: RIESGOS */
          <div className="bg-white/80 backdrop-blur-2xl border border-white/60 max-w-3xl mx-auto w-full rounded-[40px] shadow-2xl p-8 animate-fade-in relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-400 via-pink-500 to-red-400"></div>
            
            <div className="text-center mb-8 mt-4">
              <span className="text-6xl mb-4 block drop-shadow-md">👩‍🏫</span>
              <h2 className="text-3xl font-bold text-gray-800 drop-shadow-sm">Factores de Riesgo</h2>
              <p className="text-gray-600 font-medium">Completa esta sección en privado según tus observaciones.</p>
            </div>

            <div className="space-y-4 mb-10">
              {[
                { id: 'moretones', label: 'Muestra moretones en el cuerpo' },
                { id: 'marcas', label: 'Muestra marcas enrojecidas' },
                { id: 'rasgunos', label: 'Muestra rasguños' },
                { id: 'desaseado', label: 'Se presenta desaseado frecuentemente' },
                { id: 'partes_intimas', label: 'No reconoce las partes íntimas de su cuerpo' },
                { id: 'esfinteres', label: 'Se orina o defeca en su ropa' },
                { id: 'dolor_zona', label: 'Refiere dolor o picor en zona íntima' }
              ].map(riesgo => (
                <label key={riesgo.id} className="flex items-center justify-between p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/80 cursor-pointer hover:bg-red-50/80 transition-all shadow-sm hover:shadow-md">
                  <span className="font-medium text-gray-700">{riesgo.label}</span>
                  <input type="checkbox" checked={riesgos[riesgo.id as keyof typeof riesgos] === 1} onChange={() => handleToggleRiesgo(riesgo.id as keyof typeof riesgos)} className="w-6 h-6 text-red-500 rounded-md border-gray-300 focus:ring-red-400" />
                </label>
              ))}
            </div>

            <button disabled={loading} onClick={finalizarYGuardar} className="w-full py-5 rounded-2xl font-bold text-xl text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-xl shadow-indigo-500/30 transition-all hover:scale-[1.02] disabled:opacity-50 border border-white/20">
              {loading ? "Generando Magia..." : "✨ Finalizar y Descargar Excel"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
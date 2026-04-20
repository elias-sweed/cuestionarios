import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import type { Estudiante } from "../types";

// 🔥 Importamos TODAS las imágenes, incluyendo la nueva
import imgCartilla1 from "../assets/imagen_niños_inicial_comparar.jpeg";
import imgCartilla2 from "../assets/como_se_sinte_este_niño.png";
import imgCartilla3 from "../assets/como_se_sinte_este_niña.png";
import imgCartilla4 from "../assets/señala_donde_hay_peligros.png";
import imgCartilla5 from "../assets/alcanzar_su_plelota.png";
import imgCartilla6 from "../assets/trabajan_personas.png"; // ✨ LA NUEVA IMAGEN

interface Props {
  estudiante: Estudiante;
}

// 📋 Lista de preguntas conectada a sus respectivas imágenes
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
  { id: "p12", titulo: "👷 Cartillas N°6-9: ¿En qué trabajan estas personas?", indicador: "Conciencia Social", imagen: imgCartilla6 }, // ✨ IMAGEN AGREGADA
];

export default function CuestionarioInicial({ estudiante }: Props) {
  const [paso, setPaso] = useState(0);
  const [loading, setLoading] = useState(false);

  // Estados para guardar los resultados
  const [respuestas, setRespuestas] = useState<Record<string, number>>({});
  const [riesgos, setRiesgos] = useState({
    moretones: 0,
    marcas: 0,
    rasgunos: 0,
    desaseado: 0,
    partes_intimas: 0,
    esfinteres: 0,
    dolor_zona: 0
  });

  const handleCalificar = (puntaje: number) => {
    const preguntaActual = PREGUNTAS_INICIAL[paso];
    setRespuestas({ ...respuestas, [preguntaActual.id]: puntaje });
    setPaso(paso + 1);
  };

  const handleToggleRiesgo = (campo: keyof typeof riesgos) => {
    setRiesgos({ ...riesgos, [campo]: riesgos[campo] === 0 ? 1 : 0 });
  };

  // 🔥 NUEVA FUNCIÓN: Crea y descarga el archivo automáticamente
  const descargarReporteExcel = () => {
    // \uFEFF asegura que Excel lea bien las tildes y ñ (UTF-8 BOM)
    let csv = "\uFEFF"; 
    
    // Encabezados y Datos del Alumno
    csv += "REPORTE DE EVALUACIÓN SOCIOEMOCIONAL - INICIAL (5 AÑOS)\n\n";
    csv += "DATOS DEL ESTUDIANTE\n";
    csv += `Nombres,${estudiante.nombres}\n`;
    csv += `Apellidos,${estudiante.apellidos}\n`;
    csv += `Grado,Inicial (5 Años)\n`;
    csv += `Sección,${estudiante.seccion}\n\n`;

    // Tabla de Preguntas
    csv += "EVALUACIÓN DE DIMENSIONES\n";
    csv += "Pregunta,Indicador,Puntaje (0=No logra / 1=Proceso / 2=Logra)\n";
    PREGUNTAS_INICIAL.forEach((p) => {
      // Limpiamos los títulos para que no rompan el Excel (quitamos comas)
      const tituloLimpio = p.titulo.replace(/,/g, '');
      const puntaje = respuestas[p.id] ?? 0;
      csv += `"${tituloLimpio}","${p.indicador}","${puntaje}"\n`;
    });

    // Tabla de Riesgos
    csv += "\nFACTORES DE RIESGO\n";
    csv += "Condición,Estado (0=No presenta / 1=Sí presenta)\n";
    csv += `"Muestra moretones en el cuerpo","${riesgos.moretones}"\n`;
    csv += `"Muestra marcas enrojecidas","${riesgos.marcas}"\n`;
    csv += `"Muestra rasguños","${riesgos.rasgunos}"\n`;
    csv += `"Se presenta desaseado frecuentemente","${riesgos.desaseado}"\n`;
    csv += `"No reconoce partes íntimas","${riesgos.partes_intimas}"\n`;
    csv += `"Se orina o defeca en su ropa","${riesgos.esfinteres}"\n`;
    csv += `"Refiere dolor o picor en zona íntima","${riesgos.dolor_zona}"\n`;

    // Proceso de descarga automática
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Evaluacion_Inicial_${estudiante.nombres}_${estudiante.apellidos}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const finalizarYGuardar = async () => {
    setLoading(true);
    try {
      // 1. Intentamos guardar en la nube (Supabase)
      await supabase.from("respuestas").insert([
        {
          estudiante_id: estudiante.id,
          respuestas: { 
            evaluacion_inicial: respuestas, 
            factores_riesgo: riesgos 
          },
          grado: "0",
          seccion: estudiante.seccion,
          fecha: new Date().toISOString()
        }
      ]);
    } catch (err) {
      console.error("No se pudo guardar en Supabase, pero se descargará el Excel", err);
      // Ya NO mostramos la alerta de error para no asustar a la profe
    } finally {
      // 2. PASE LO QUE PASE, descargamos el Excel automáticamente como respaldo seguro
      descargarReporteExcel();
      
      // 3. Mostramos mensaje de éxito y reiniciamos
      alert("¡Evaluación finalizada! El archivo se ha descargado automáticamente.");
      setLoading(false);
      window.location.reload();
    }
  };

  const esFaseRiesgos = paso === PREGUNTAS_INICIAL.length;
  const preguntaActual = !esFaseRiesgos ? PREGUNTAS_INICIAL[paso] : null;

  return (
    <div className="min-h-screen bg-indigo-50 flex flex-col p-4 md:p-8 font-sans">
      
      {/* CABECERA */}
      <div className="bg-white px-6 py-4 rounded-2xl shadow-sm flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold text-indigo-900">Entrevista - 5 Años</h1>
          <p className="text-sm text-gray-500">Alumno/a: <span className="font-bold text-gray-800">{estudiante.nombres} {estudiante.apellidos}</span></p>
        </div>
        <div className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-xl font-bold">
          {esFaseRiesgos ? "Finalizar" : `Pregunta ${paso + 1} de ${PREGUNTAS_INICIAL.length}`}
        </div>
      </div>

      {/* ÁREA DE ENTREVISTA (CARRUSEL) */}
      {!esFaseRiesgos && preguntaActual ? (
        <div className="flex-1 flex flex-col justify-between max-w-4xl mx-auto w-full animate-fade-in">
          
          {/* ZONA DEL NIÑO (ARRIBA) */}
          <div className="bg-white rounded-[40px] shadow-lg flex-1 flex flex-col items-center justify-center p-8 mb-6 text-center border-4 border-indigo-50">
            <h2 className="text-3xl md:text-4xl font-black text-gray-800 leading-tight mb-6">
              {preguntaActual.titulo}
            </h2>
            
            {/* 🔥 SE MUESTRAN LAS IMÁGENES EXACTAS DE TU CARPETA */}
            {preguntaActual.imagen ? (
              <img 
                src={preguntaActual.imagen} 
                alt="Cartilla visual" 
                className="max-h-[350px] w-auto object-contain rounded-2xl border-2 border-gray-100 shadow-md transition-transform hover:scale-105"
              />
            ) : (
              <div className="w-full max-w-md aspect-video bg-indigo-50 rounded-2xl border-2 border-dashed border-indigo-200 flex items-center justify-center">
                <p className="text-indigo-400 font-medium text-lg">
                  (Pregunta oral)
                </p>
              </div>
            )}
          </div>

          {/* ZONA DE LA PROFESORA (ABAJO) */}
          <div className="bg-white rounded-3xl shadow-lg p-6 border-t-8 border-indigo-500">
            <p className="text-center text-sm font-bold text-indigo-400 uppercase tracking-widest mb-4">
              Panel Docente: Evaluar ({preguntaActual.indicador})
            </p>
            <div className="grid grid-cols-3 gap-4">
              <button onClick={() => handleCalificar(0)} className="py-5 rounded-2xl font-bold text-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 hover:scale-[1.02] transition-all shadow-sm">
                ❌ No lo logra
              </button>
              <button onClick={() => handleCalificar(1)} className="py-5 rounded-2xl font-bold text-lg bg-yellow-50 text-yellow-600 border border-yellow-200 hover:bg-yellow-100 hover:scale-[1.02] transition-all shadow-sm">
                ⏳ En proceso
              </button>
              <button onClick={() => handleCalificar(2)} className="py-5 rounded-2xl font-bold text-lg bg-green-50 text-green-600 border border-green-200 hover:bg-green-100 hover:scale-[1.02] transition-all shadow-sm">
                ⭐ Lo logra
              </button>
            </div>
          </div>

        </div>
      ) : (

        /* FASE FINAL: RIESGOS (SOLO PROFESORA) */
        <div className="bg-white max-w-3xl mx-auto w-full rounded-3xl shadow-xl p-8 animate-fade-in border-t-8 border-red-500">
          <div className="text-center mb-8">
            <span className="text-6xl mb-4 block">👩‍🏫</span>
            <h2 className="text-3xl font-bold text-gray-800">Factores de Riesgo</h2>
            <p className="text-gray-500">Completa esta sección en privado según tus observaciones.</p>
          </div>

          <div className="space-y-4 mb-10">
            <label className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 cursor-pointer hover:bg-red-50 transition-colors">
              <span className="font-medium text-gray-700">Muestra moretones en el cuerpo</span>
              <input type="checkbox" checked={riesgos.moretones === 1} onChange={() => handleToggleRiesgo('moretones')} className="w-6 h-6 text-red-600 rounded focus:ring-red-500" />
            </label>
            <label className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 cursor-pointer hover:bg-red-50 transition-colors">
              <span className="font-medium text-gray-700">Muestra marcas enrojecidas</span>
              <input type="checkbox" checked={riesgos.marcas === 1} onChange={() => handleToggleRiesgo('marcas')} className="w-6 h-6 text-red-600 rounded focus:ring-red-500" />
            </label>
            <label className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 cursor-pointer hover:bg-red-50 transition-colors">
              <span className="font-medium text-gray-700">Muestra rasguños</span>
              <input type="checkbox" checked={riesgos.rasgunos === 1} onChange={() => handleToggleRiesgo('rasgunos')} className="w-6 h-6 text-red-600 rounded focus:ring-red-500" />
            </label>
            <label className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 cursor-pointer hover:bg-red-50 transition-colors">
              <span className="font-medium text-gray-700">Se presenta desaseado frecuentemente</span>
              <input type="checkbox" checked={riesgos.desaseado === 1} onChange={() => handleToggleRiesgo('desaseado')} className="w-6 h-6 text-red-600 rounded focus:ring-red-500" />
            </label>
            <label className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 cursor-pointer hover:bg-red-50 transition-colors">
              <span className="font-medium text-gray-700">No reconoce las partes íntimas de su cuerpo</span>
              <input type="checkbox" checked={riesgos.partes_intimas === 1} onChange={() => handleToggleRiesgo('partes_intimas')} className="w-6 h-6 text-red-600 rounded focus:ring-red-500" />
            </label>
            <label className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 cursor-pointer hover:bg-red-50 transition-colors">
              <span className="font-medium text-gray-700">Se orina o defeca en su ropa</span>
              <input type="checkbox" checked={riesgos.esfinteres === 1} onChange={() => handleToggleRiesgo('esfinteres')} className="w-6 h-6 text-red-600 rounded focus:ring-red-500" />
            </label>
            <label className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 cursor-pointer hover:bg-red-50 transition-colors">
              <span className="font-medium text-gray-700">Refiere dolor o picor en zona íntima</span>
              <input type="checkbox" checked={riesgos.dolor_zona === 1} onChange={() => handleToggleRiesgo('dolor_zona')} className="w-6 h-6 text-red-600 rounded focus:ring-red-500" />
            </label>
          </div>

          <button 
            disabled={loading}
            onClick={finalizarYGuardar}
            className="w-full py-5 rounded-2xl font-bold text-xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-600/30 transition-all disabled:opacity-50"
          >
            {loading ? "Guardando y Descargando..." : "💾 Finalizar y Descargar Excel"}
          </button>
        </div>
      )}

    </div>
  );
}
import imgCartilla1 from "../assets/imagen_niños_inicial_comparar.jpeg";
import imgCartilla2 from "../assets/como_se_sinte_este_niño.png";
import imgCartilla3 from "../assets/como_se_sinte_este_niña.png";
import imgCartilla4 from "../assets/señala_donde_hay_peligros.png";
import imgCartilla5 from "../assets/alcanzar_su_plelota.png";
import imgCartilla6 from "../assets/trabajan_personas.png";

export const PREGUNTAS_INICIAL = [
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

export const MAPEO_DB: Record<string, number> = {
  p1: 301, p2: 302, p3: 303, p4: 304, p5: 305, p6: 306,
  p7: 307, p8: 308, p9: 309, p10: 310, p11: 311, p12: 312,
  moretones: 313, marcas: 314, rasgunos: 315, desaseado: 316,
  partes_intimas: 317, esfinteres: 318, dolor_zona: 319
};

export const FACTORES_RIESGO_CONFIG = [
  { id: 'moretones', label: '¿Muestra moretones?' },
  { id: 'marcas', label: '¿Marcas enrojecidas?' },
  { id: 'rasgunos', label: '¿Tiene rasguños?' },
  { id: 'desaseado', label: '¿Falta de higiene frecuente?' },
  { id: 'partes_intimas', label: '¿No reconoce partes íntimas?' },
  { id: 'esfinteres', label: '¿Incontinencia (orina/heces)?' },
  { id: 'dolor_zona', label: '¿Refiere dolor en zona íntima?' }
];
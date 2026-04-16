export interface Estudiante {
  id?: string
  nombres: string
  apellidos: string
  grado: string
  seccion: string
}

export interface Respuesta {
  id?: string
  estudiante_id: string
  pregunta_id: number
  respuesta: any
}

export type TipoPregunta = "opcion" | "emocion" | "abierto" | "multiple" | "dibujo"

export interface Pregunta {
  id: number
  texto: string
  tipo: TipoPregunta
  nivel: string
  opciones?: string[]
  orden: number
}
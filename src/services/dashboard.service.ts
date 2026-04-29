import { supabase } from "../lib/supabaseClient"

export const getRespuestasDashboard = async () => {
  let todaLaData: any[] = [];
  let from = 0;
  const limiteMaximo = 1000;
  let hayMasDatos = true;

  // BUCLE: Pedirá a Supabase de 1000 en 1000 hasta que ya no quede nada
  while (hayMasDatos) {
    const { data, error } = await supabase
      .from("respuestas")
      .select(`
        estudiante_id,
        pregunta_id,
        respuesta,
        fecha,
        estudiantes (
          id,
          nombres,
          apellidos,
          grado,
          seccion
        ),
        preguntas (
          texto,
          nivel
        )
      `)
      .order('fecha', { ascending: false })
      .range(from, from + limiteMaximo - 1);

    if (error) {
      console.error("Error al traer datos de Supabase:", error);
      throw error;
    }

    if (data && data.length > 0) {
      // Unimos los nuevos 1000 a la lista total
      todaLaData = [...todaLaData, ...data];
      from += limiteMaximo; // Preparamos la búsqueda para los siguientes 1000
      
      // Si nos devolvió menos de 1000, significa que llegamos al final exacto
      if (data.length < limiteMaximo) {
        hayMasDatos = false;
      }
    } else {
      // Si la búsqueda viene vacía, rompemos el bucle
      hayMasDatos = false;
    }
  }

  return todaLaData;
}
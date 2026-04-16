export const mapNivel = (grado: string) => {
  if (grado === "1" || grado === "2") return "primaria_1_2"
  if (grado === "3" || grado === "4") return "primaria_3_4"
  if (grado === "5" || grado === "6") return "primaria_5_6"
  return "inicial"
}
import { useRespuestasRealtime } from "../hooks/useRespuestasRealtime"

export default function AdminDashboard() {
  const respuestas = useRespuestasRealtime()

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Dashboard en tiempo real</h1>

      <div className="grid gap-4">
        {respuestas.map((r, i) => (
          <div key={i} className="p-4 border rounded-xl">
            <p><strong>Alumno:</strong> {r.estudiantes?.nombres}</p>
            <p><strong>Pregunta:</strong> {r.pregunta_id}</p>
            <p><strong>Respuesta:</strong> {JSON.stringify(r.respuesta)}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
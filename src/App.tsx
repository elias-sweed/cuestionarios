import { useState } from "react"
import FormEstudiante from "./components/FormEstudiante"
import PreguntasScreen from "./components/PreguntasScreen"
import AdminDashboard from "./components/AdminDashboard"
import AdminLogin from "./components/admin/AdminLogin"
import type { Estudiante } from "./types" // Importamos tu interfaz

function App() {
  // Reemplazamos <any> por <Estudiante | null>
  const [estudiante, setEstudiante] = useState<Estudiante | null>(null)

  const path = window.location.pathname

  if (path === "/admin/login") {
    return <AdminLogin />
  }

  if (path.startsWith("/admin")) {
    return <AdminDashboard />
  }

  // APP ALUMNOS
  if (!estudiante) {
    return <FormEstudiante onSuccess={setEstudiante} />
  }

  return <PreguntasScreen estudiante={estudiante} />
}

export default App
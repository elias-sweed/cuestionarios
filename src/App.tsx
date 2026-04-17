import { useState } from "react"
import FormEstudiante from "./components/FormEstudiante"
import PreguntasScreen from "./components/PreguntasScreen"
import AdminDashboard from "./components/AdminDashboard"
import AdminLogin from "./components/admin/AdminLogin"

function App() {
  const [estudiante, setEstudiante] = useState<any>(null)

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
import { useState } from "react"
import FormEstudiante from "./components/FormEstudiante"
import PreguntasScreen from "./components/PreguntasScreen"
import AdminDashboard from "./components/AdminDashboard"

function App() {
  const [estudiante, setEstudiante] = useState<any>(null)

  const isAdmin = window.location.pathname === "/admin"

  if (isAdmin) {
    return <AdminDashboard />
  }

  if (!estudiante) {
    return <FormEstudiante onSuccess={setEstudiante} />
  }

  return <PreguntasScreen estudiante={estudiante} />
}

export default App
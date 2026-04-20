import { useState } from "react"
import FormEstudiante from "./components/FormEstudiante"
import PreguntasScreen from "./components/PreguntasScreen"
import CuestionarioInicial from "./components/CuestionarioInicial" // Importamos el nuevo
import AdminDashboard from "./components/AdminDashboard"
import AdminLogin from "./components/admin/AdminLogin"
import { useAuth } from "./hooks/useAuth"
import type { Estudiante } from "./types"

function App() {
  const [estudiante, setEstudiante] = useState<Estudiante | null>(null)

  const { session, loading } = useAuth()

  const path = window.location.pathname

  // 🔐 RUTA DE LOGIN ADMIN
  if (path === "/admin/login") {
    if (loading) return <div>Cargando...</div>
    
    // Si ya está logueado → lo manda directo al dashboard
    if (session) {
      window.location.replace("/admin")
      return null
    }
    
    return <AdminLogin />
  }

  // 🔐 RUTAS PROTEGIDAS DEL ADMIN
  if (path.startsWith("/admin")) {
    if (loading) return <div>Cargando...</div>

    // Si no hay sesión → lo manda al login
    if (!session) {
      window.location.replace("/admin/login")
      return null
    }

    return <AdminDashboard />
  }

  // 👨‍🎓 APP NORMAL PARA ESTUDIANTES
  if (!estudiante) {
    return <FormEstudiante onSuccess={setEstudiante} />
  }

  // 🔥 LA MAGIA ESTÁ AQUÍ: Si es Inicial (0), va al nuevo cuestionario interactivo
  if (estudiante.grado === "0") {
    return <CuestionarioInicial estudiante={estudiante} />
  }

  // Si es Primaria (1 a 6), va al cuestionario normal
  return <PreguntasScreen estudiante={estudiante} />
}

export default App
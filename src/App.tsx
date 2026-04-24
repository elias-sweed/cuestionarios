import { useState } from "react"
import FormEstudiante from "./components/FormEstudiante"
import PreguntasScreen from "./components/PreguntasScreen"
import CuestionarioInicial from "./components/CuestionarioInicial" // Importamos el nuevo
import AdminDashboard from "./components/AdminDashboard"
import AdminLogin from "./components/admin/AdminLogin"
import { useAuth } from "./hooks/useAuth"
import type { Estudiante } from "./types"
import DotField from "./components/DotField"

function App() {
  const [estudiante, setEstudiante] = useState<Estudiante | null>(null)
  const { session, loading } = useAuth()
  const path = window.location.pathname

  // Función para renderizar el contenido según el estado
  const renderContent = () => {
    if (path === "/admin/login") {
      if (loading) return <div>Cargando...</div>
      if (session) {
        window.location.replace("/admin")
        return null
      }
      return <AdminLogin />
    }

    if (path.startsWith("/admin")) {
      if (loading) return <div>Cargando...</div>
      if (!session) {
        window.location.replace("/admin/login")
        return null
      }
      return <AdminDashboard />
    }

    if (!estudiante) {
      return <FormEstudiante onSuccess={setEstudiante} />
    }

    if (estudiante.grado === "0") {
      return <CuestionarioInicial estudiante={estudiante} />
    }

    return <PreguntasScreen estudiante={estudiante} />
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* CAPA DE FONDO */}
      <div className="fixed inset-0 z-0">
        <DotField
          dotRadius={1.5}
          dotSpacing={14}
          bulgeStrength={67}
          glowRadius={160}
          sparkle={false}
          waveAmplitude={0}
          cursorRadius={500}
          cursorForce={0.1}
          bulgeOnly
          gradientFrom="#A855F7"
          gradientTo="#B497CF"
          glowColor="#120F17"
        />
      </div>

      {/* CAPA DE CONTENIDO */}
      <div className="relative z-10">
        {renderContent()}
      </div>
    </div>
  )
}

export default App
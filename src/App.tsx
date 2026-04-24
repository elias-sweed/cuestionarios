import { useState } from "react"
import FormEstudiante from "./components/FormEstudiante"
import PreguntasScreen from "./components/PreguntasScreen"
import CuestionarioInicial from "./components/CuestionarioInicial"
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
      if (loading) return <div className="text-white text-center mt-20">Cargando...</div>
      if (session) {
        window.location.replace("/admin")
        return null
      }
      return <AdminLogin />
    }

    if (path.startsWith("/admin")) {
      if (loading) return <div className="text-white text-center mt-20">Cargando...</div>
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
    <div className="relative min-h-screen w-full overflow-hidden bg-[#0a0f1a]">
      {/* CAPA DE FONDO GLOBAL */}
      <div className="fixed inset-0 z-0">
        <DotField
          dotRadius={1.2}
          dotSpacing={16}
          bulgeStrength={60}
          glowRadius={200}
          sparkle={false}
          waveAmplitude={0}
          cursorRadius={400}
          cursorForce={0.15}
          bulgeOnly
          /* Colores ajustados a Azul Neón para combinar con el Rayo */
          gradientFrom="#2563eb" 
          gradientTo="#1e3a8a"
          glowColor="#0f172a"
        />
      </div>

      {/* CAPA DE CONTENIDO */}
      <div className="relative z-10 w-full min-h-screen">
        {renderContent()}
      </div>
    </div>
  )
}

export default App
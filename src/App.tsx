import { useState } from "react"
import FormEstudiante from "./components/FormEstudiante"
import PreguntasScreen from "./components/PreguntasScreen"
import CuestionarioInicial from "./components/CuestionarioInicial"
import AdminDashboard from "./components/AdminDashboard"
import AdminLogin from "./components/admin/AdminLogin"
import AdminNivelSelector from "./components/admin/AdminNivelSelector"
import OfflineDetector from "./components/OfflineDetector"
import { useAuth } from "./hooks/useAuth"
import type { Estudiante } from "./types"
import DotField from "./components/DotField"

function App() {
  // Cambio: Ahora el estado inicial siempre es null, sin revisar localStorage
  const [estudiante, setEstudiante] = useState<Estudiante | null>(null)
  
  const { session, loading } = useAuth()
  const path = window.location.pathname

  // Cambio: Solo actualizamos el estado en memoria, sin guardar en localStorage
  const handleEstudianteSuccess = (est: Estudiante) => {
    setEstudiante(est)
  }

  const renderContent = () => {
    if (path === "/admin/login") {
      if (loading) return <div className="text-white text-center mt-20">Cargando...</div>
      if (session) {
        window.location.replace("/admin/seleccion")
        return null
      }
      return <AdminLogin />
    }

    if (path === "/admin/seleccion") {
      if (loading) return <div className="text-white text-center mt-20">Cargando...</div>
      if (!session) {
        window.location.replace("/admin/login")
        return null
      }
      return <AdminNivelSelector />
    }

    if (path === "/admin") {
      if (loading) return <div className="text-white text-center mt-20">Cargando...</div>
      if (!session) {
        window.location.replace("/admin/login")
        return null
      }
      window.location.replace("/admin/seleccion")
      return null
    }

    if (path === "/admin/inicial/dashboard") {
      if (loading) return <div className="text-white text-center mt-20">Cargando...</div>
      if (!session) {
        window.location.replace("/admin/login")
        return null
      }
      return <AdminDashboard nivel="inicial" />
    }

    if (path === "/admin/primaria/dashboard") {
      if (loading) return <div className="text-white text-center mt-20">Cargando...</div>
      if (!session) {
        window.location.replace("/admin/login")
        return null
      }
      return <AdminDashboard nivel="primaria" />
    }

    if (path.startsWith("/admin")) {
      if (loading) return <div className="text-white text-center mt-20">Cargando...</div>
      if (!session) {
        window.location.replace("/admin/login")
        return null
      }
      return <AdminDashboard nivel="primaria" />
    }

    if (!estudiante) {
      return <FormEstudiante onSuccess={handleEstudianteSuccess} />
    }

    if (estudiante.grado === "0") {
      return <CuestionarioInicial estudiante={estudiante} />
    }

    return <PreguntasScreen estudiante={estudiante} />
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#0a0f1a]">
      <OfflineDetector />
      
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
          gradientFrom="#2563eb" 
          gradientTo="#1e3a8a"
          glowColor="#0f172a"
        />
      </div>

      <div className="relative z-10 w-full min-h-screen">
        {renderContent()}
      </div>
    </div>
  )
}

export default App
import { useState } from "react"
import { motion } from "framer-motion"
import { login } from "../../services/auth.service"
import { Lock, Mail, Key, Loader2, AlertCircle } from "lucide-react" // Iconos pro
import DotField from "../DotField"

export default function AdminLogin() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      await login(email, password)
      window.location.href = "/admin"
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("Credenciales incorrectas")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#050505] p-4 overflow-hidden">
      {/* Fondo de puntos con un color más serio (Cian/Azul frío) */}
      <div className="fixed inset-0 z-0">
        <DotField
          dotRadius={1}
          dotSpacing={20}
          bulgeStrength={50}
          glowRadius={300}
          sparkle={true}
          cursorRadius={300}
          cursorForce={0.2}
          gradientFrom="#0891b2" // Cian
          gradientTo="#1e3a8a"   // Azul oscuro
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <form
          onSubmit={handleLogin}
          className="bg-slate-900/80 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-cyan-500/20 shadow-[0_0_50px_rgba(0,0,0,0.5)] space-y-6"
        >
          {/* Header del Formulario */}
          <div className="text-center space-y-2">
            <div className="relative w-20 h-20 bg-cyan-500/10 border border-cyan-500/30 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
              <Lock className="w-10 h-10 text-cyan-400" />
              <div className="absolute inset-0 bg-cyan-400/20 blur-2xl rounded-full animate-pulse" />
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight">Panel Admin</h2>
            <p className="text-cyan-100/50 text-sm font-medium">Portal de Gestión Segura</p>
          </div>

          <div className="space-y-4">
            {/* Input Email */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-cyan-400 uppercase tracking-widest ml-1">Email Corporativo</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                <input
                  type="email"
                  required
                  placeholder="admin@jimenezpimentel.edu.pe"
                  className="w-full bg-slate-950/50 border border-white/10 p-4 pl-12 rounded-2xl text-white outline-none focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/10 transition-all placeholder:text-slate-600"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Input Password */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-cyan-400 uppercase tracking-widest ml-1">Contraseña de Acceso</label>
              <div className="relative group">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full bg-slate-950/50 border border-white/10 p-4 pl-12 rounded-2xl text-white outline-none focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/10 transition-all placeholder:text-slate-600"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold rounded-xl flex items-center gap-3"
            >
              <AlertCircle className="w-5 h-5 shrink-0" />
              {error}
            </motion.div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="group relative w-full bg-cyan-600 hover:bg-cyan-500 text-white font-black py-4 rounded-2xl transition-all duration-300 shadow-[0_0_20px_rgba(8,145,178,0.3)] hover:shadow-[0_0_30px_rgba(8,145,178,0.5)] active:scale-[0.98] disabled:opacity-50 flex justify-center items-center overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
            
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                AUTENTICANDO...
              </span>
            ) : (
              "INGRESAR AL SISTEMA"
            )}
          </button>
        </form>

        <p className="text-center mt-8 text-slate-500 text-xs font-medium">
          &copy; {new Date().getFullYear()} Sistema de Gestión Escolar • Acceso Restringido
        </p>
      </motion.div>
    </div>
  )
}
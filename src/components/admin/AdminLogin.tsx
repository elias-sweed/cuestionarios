import { useState } from "react"
import { login } from "../../services/auth.service"

export default function AdminLogin() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault() // Evita que la página recargue al hacer submit
    setError("")
    setIsLoading(true)

    try {
      await login(email, password)
      window.location.href = "/admin"
    } catch (err: unknown) {
      // Tipado seguro para el error
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("Error al iniciar sesión")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-sm p-8 bg-white rounded-3xl shadow-lg shadow-gray-200/50 border border-gray-100 space-y-6 animate-fade-in"
      >
        <div className="text-center space-y-2 mb-2">
          <div className="w-16 h-16 bg-gray-900 text-white rounded-full flex items-center justify-center mx-auto text-2xl mb-4">
            🔒
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Acceso Admin</h2>
          <p className="text-sm text-gray-500">Ingresa tus credenciales para continuar</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 ml-1">Correo Electrónico</label>
            <input
              type="email"
              required
              placeholder="admin@colegio.com"
              className="w-full border border-gray-200 bg-gray-50 p-3.5 rounded-xl focus:bg-white focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 ml-1">Contraseña</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              className="w-full border border-gray-200 bg-gray-50 p-3.5 rounded-xl focus:bg-white focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-600 text-sm font-medium rounded-lg border border-red-100 text-center">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3.5 px-4 rounded-xl transition-all duration-200 shadow-md flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Verificando...
            </span>
          ) : (
            "Ingresar"
          )}
        </button>
      </form>
    </div>
  )
}
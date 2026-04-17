import { useState } from "react"
import { login } from "../../services/auth.service"

export default function AdminLogin() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleLogin = async () => {
    try {
      await login(email, password)
      window.location.href = "/admin"
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="p-6 bg-white rounded-xl shadow w-80 space-y-4">
        <h2 className="text-xl font-bold">Admin Login</h2>

        <input
          placeholder="Email"
          className="w-full border p-2"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border p-2"
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="text-red-500">{error}</p>}

        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 text-white p-2 rounded"
        >
          Ingresar
        </button>
      </div>
    </div>
  )
}
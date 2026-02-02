import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import { authAPI } from '../api/auth.api'
import '../styles/auth.css'

export default function Login() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((state) => state.setAuth)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await authAPI.login(username, password)
      const { access, refresh, user } = response.data

      setAuth(user, access, refresh)
      localStorage.setItem('access_token', access)
      localStorage.setItem('refresh_token', refresh)

      navigate('/dashboard')
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.detail ||
          'Error de autenticación'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Foodies</h1>
        <p className="login-subtitle">Sistema de Gestión de Restaurante</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Usuario</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ingresa tu usuario"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingresa tu contraseña"
              disabled={loading}
              required
            />
          </div>

          <button type="submit" disabled={loading} className="login-button">
            {loading ? 'Autenticando...' : 'Ingresar'}
          </button>
        </form>

        <p className="login-footer">© 2026 Foodies - Todos los derechos reservados</p>
      </div>
    </div>
  )
}

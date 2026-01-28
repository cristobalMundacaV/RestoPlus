import { Link, useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import '../styles/layouts.css'

export default function DashboardLayout({ children }) {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    navigate('/')
  }

  return (
    <div className="layout-container">
      <nav className="navbar">
        <div className="navbar-brand">RestoPlusV2</div>
        <div className="navbar-user">
          <span>{user?.username || 'Usuario'}</span>
          <button onClick={handleLogout} className="btn-logout">
            Salir
          </button>
        </div>
      </nav>

      <div className="layout-content">
        <aside className="sidebar">
          <nav className="sidebar-nav">
            <Link to="/dashboard" className="nav-link">📊 Dashboard</Link>
            <Link to="/pedidos" className="nav-link">📋 Pedidos</Link>
            <Link to="/ventas" className="nav-link">💰 Ventas</Link>
            <Link to="/mesas" className="nav-link">🪑 Mesas</Link>
            <Link to="/productos" className="nav-link">🍽️ Productos</Link>
            <Link to="/inventario" className="nav-link">📦 Inventario</Link>
            <Link to="/cajas" className="nav-link">💳 Cajas</Link>
            <Link to="/restaurantes" className="nav-link">🏪 Restaurantes</Link>
            <Link to="/usuarios" className="nav-link">👤 Usuarios</Link>
            <Link to="/reportes" className="nav-link">📊 Reportes</Link>
            <Link to="/cocina" className="nav-link">👨‍🍳 Cocina</Link>
          </nav>
        </aside>

        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  )
}

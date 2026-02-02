import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import useAuthStore from '../store/authStore'
import '../styles/layouts.css'

export default function DashboardLayout({ children }) {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [collapsed, setCollapsed] = useState(true)

  const handleLogout = () => {
    logout()
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    navigate('/')
  }

  return (
    <div className="layout-container">
      <nav className="navbar">
        <div className="navbar-brand">
          <Link to="/dashboard" className="navbar-logo-link">
            <img src="/img/Logo.PNG" alt="Foodies" className="navbar-logo" />
          </Link>
        </div>
        <div className="navbar-user">
          <span className="user-name">👤 {user?.username || 'Usuario'}</span>
          <button onClick={handleLogout} className="btn-logout">
            Salir
          </button>
        </div>
      </nav>

      <div className="layout-content">
        <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
          <nav className="sidebar-nav">
            <Link to="/dashboard" className="nav-link">
              <span className="nav-icon">📊</span>
              <span className="nav-text">Dashboard</span>
            </Link>
            <Link to="/pedidos" className="nav-link">
              <span className="nav-icon">📋</span>
              <span className="nav-text">Pedidos</span>
            </Link>
            <Link to="/ventas" className="nav-link">
              <span className="nav-icon">💰</span>
              <span className="nav-text">Ventas</span>
            </Link>
            <Link to="/productos" className="nav-link">
              <span className="nav-icon">🍽️</span>
              <span className="nav-text">Productos</span>
            </Link>
            <Link to="/inventario" className="nav-link">
              <span className="nav-icon">📦</span>
              <span className="nav-text">Inventario</span>
            </Link>
            <Link to="/cajas" className="nav-link">
              <span className="nav-icon">💳</span>
              <span className="nav-text">Cajas</span>
            </Link>
            <Link to="/restaurantes" className="nav-link">
              <span className="nav-icon">🏪</span>
              <span className="nav-text">Restaurantes</span>
            </Link>
            <Link to="/usuarios" className="nav-link">
              <span className="nav-icon">👤</span>
              <span className="nav-text">Usuarios</span>
            </Link>
            <Link to="/reportes" className="nav-link">
              <span className="nav-icon">📊</span>
              <span className="nav-text">Reportes</span>
            </Link>
            <Link to="/cocina" className="nav-link">
              <span className="nav-icon">👨‍🍳</span>
              <span className="nav-text">Cocina</span>
            </Link>
          </nav>
        </aside>

        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  )
}

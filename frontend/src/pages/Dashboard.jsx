import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import { biAPI } from '../api/otros.api'
import { formatMoney } from '../utils/formatters'
import '../styles/dashboard.css'

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuthStore()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/')
    } else {
      cargarDatos()
    }
  }, [isAuthenticated, navigate])

  const cargarDatos = async () => {
    const today = new Date()
    const fecha = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`
    try {
      const [ventasDiaResult, resumenResult] = await Promise.allSettled([
        biAPI.ventasPorDia({ fecha }),
        biAPI.resumenCaja(),
      ])

      setData({
        ventasDia: ventasDiaResult.status === 'fulfilled' ? ventasDiaResult.value.data : null,
        resumen: resumenResult.status === 'fulfilled' ? resumenResult.value.data : null,
      })
    } catch (error) {
      console.error('Error cargando datos:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Panel de Control</h1>
        <p>Bienvenido {user?.username || 'Usuario'}</p>
      </div>

      {loading ? (
        <div className="loading">Cargando...</div>
      ) : (
        <>
          <div className="dashboard-grid">
            <div className="card">
              <h3>📋 Pedidos Hoy</h3>
              <p className="card-value">0</p>
            </div>
            <div className="card">
              <h3>💰 Ventas Hoy</h3>
              <p className="card-value">{data?.resumen?.total ? formatMoney(data.resumen.total) : '$0'}</p>
            </div>
            <div className="card">
              <h3>🪑 Mesas Ocupadas</h3>
              <p className="card-value">0</p>
            </div>
            <div className="card">
              <h3>⏰ Última Venta</h3>
              <p className="card-value">--:--</p>
            </div>
          </div>

          <div className="section">
            <h2>Acciones Rápidas</h2>
            <div className="button-grid">
              <button className="action-button" onClick={() => navigate('/pedidos')}>Nuevo Pedido</button>
              <button className="action-button" onClick={() => navigate('/ventas')}>Nueva Venta</button>
              <button className="action-button" onClick={() => navigate('/cajas')}>Abrir Caja</button>
              <button className="action-button" onClick={() => navigate('/mesas')}>Ver Mesas</button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

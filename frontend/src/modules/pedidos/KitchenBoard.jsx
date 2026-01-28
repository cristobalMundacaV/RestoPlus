import { useEffect, useState } from 'react'
import { pedidosAPI, detallesAPI } from '../../api/ventas.api'
import './kitchen.css'

const estadoLabel = {
  ABIERTO: 'Abierto',
  EN_PREPARACION: 'En preparación',
  SERVIDO: 'Servido',
  CERRADO: 'Cerrado',
  CANCELADO: 'Cancelado',
}

export default function KitchenBoard() {
  const [pedidos, setPedidos] = useState([])
  const [detalles, setDetalles] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    cargarPedidos()
    const interval = setInterval(cargarPedidos, 10000)
    return () => clearInterval(interval)
  }, [])

  const cargarPedidos = async () => {
    setLoading(true)
    try {
      const res = await pedidosAPI.list({ estado: 'EN_PREPARACION' })
      const data = res.data.results || res.data
      setPedidos(data)

      const detallesMap = {}
      await Promise.all(
        data.map(async (pedido) => {
          const detRes = await detallesAPI.list({ pedido: pedido.id })
          detallesMap[pedido.id] = detRes.data.results || detRes.data
        })
      )
      setDetalles(detallesMap)
    } catch (error) {
      console.error('Error cargando pedidos cocina:', error)
    } finally {
      setLoading(false)
    }
  }

  const marcarServido = async (pedidoId) => {
    try {
      await pedidosAPI.cambiarEstado(pedidoId, 'SERVIDO')
      cargarPedidos()
    } catch (error) {
      alert('No se pudo marcar como servido')
    }
  }

  if (loading) return <div className="loading">Cargando pedidos...</div>

  return (
    <div className="kitchen-container">
      <div className="kitchen-header">
        <h1>Cocina - Pedidos en preparación</h1>
        <button className="btn-secondary" onClick={cargarPedidos}>Actualizar</button>
      </div>

      <div className="kitchen-grid">
        {pedidos.map((pedido) => (
          <div key={pedido.id} className="kitchen-card">
            <div className="kitchen-title">
              Pedido #{pedido.id}
            </div>
            <div className="kitchen-info">
              <span>Mesa: {pedido.mesa_numero || 'Mostrador'}</span>
              <span>Estado: {estadoLabel[pedido.estado] || pedido.estado}</span>
              <span>Hora: {new Date(pedido.fecha_pedido).toLocaleTimeString('es-CL')}</span>
            </div>

            <div className="kitchen-items">
              {(detalles[pedido.id] || []).map((item) => (
                <div key={item.id} className="kitchen-item">
                  <span>{item.nombre_producto}</span>
                  <span>x {item.cantidad}</span>
                </div>
              ))}
            </div>

            <button className="btn-primary" onClick={() => marcarServido(pedido.id)}>
              Marcar como Servido
            </button>
          </div>
        ))}
      </div>

      {!pedidos.length && (
        <div className="empty-state">
          <p>No hay pedidos en preparación</p>
        </div>
      )}
    </div>
  )
}

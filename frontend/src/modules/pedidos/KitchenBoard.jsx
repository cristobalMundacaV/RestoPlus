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
      const detallesMap = {}
      await Promise.all(
        data.map(async (pedido) => {
          const detRes = await detallesAPI.list({ pedido: pedido.id })
          const raw = detRes.data.results || detRes.data
          const filtrados = raw.filter((item) =>
            ['COMIDA', 'CONGELADOS'].includes(item.categoria_producto)
          )
          detallesMap[pedido.id] = filtrados
        })
      )
      const pedidosConItems = data.filter((pedido) => (detallesMap[pedido.id] || []).length > 0)
      setPedidos(pedidosConItems)
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

  const actualizarEstimado = async (pedidoId, minutos) => {
    const value = Math.max(0, Number(minutos) || 0)
    try {
      await pedidosAPI.update(pedidoId, { tiempo_estimado_minutos: value })
      cargarPedidos()
    } catch (error) {
      alert('No se pudo actualizar el tiempo estimado')
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
              <span>Ingreso: {new Date(pedido.fecha_pedido).toLocaleTimeString('es-CL')}</span>
              <span>
                Inicio prep: {pedido.fecha_preparacion ? new Date(pedido.fecha_preparacion).toLocaleTimeString('es-CL') : '—'}
              </span>
              <span>
                Completado: {pedido.fecha_servido ? new Date(pedido.fecha_servido).toLocaleTimeString('es-CL') : '—'}
              </span>
            </div>

            <div className="kitchen-estimate">
              <label htmlFor={`estimado-${pedido.id}`}>Tiempo estimado (min)</label>
              <input
                id={`estimado-${pedido.id}`}
                type="number"
                min="0"
                defaultValue={pedido.tiempo_estimado_minutos || ''}
                onBlur={(e) => actualizarEstimado(pedido.id, e.target.value)}
              />
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

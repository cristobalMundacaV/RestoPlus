import { useEffect, useState } from 'react'
import { pedidosAPI, detallesAPI } from '../../api/ventas.api'
import { mesasAPI } from '../../api/otros.api'
import { productosAPI } from '../../api/productos.api'
import PedidoForm from './PedidoForm'
import './pedidos.css'

const estadoLabel = {
  ABIERTO: 'Abierto',
  EN_PREPARACION: 'En preparación',
  SERVIDO: 'Servido',
  CERRADO: 'Cerrado',
  CANCELADO: 'Cancelado',
}

export default function PedidosList() {
  const [pedidos, setPedidos] = useState([])
  const [mesas, setMesas] = useState([])
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    setLoading(true)
    try {
      const [pedRes, mesasRes, prodRes] = await Promise.all([
        pedidosAPI.list(),
        mesasAPI.mesas(),
        productosAPI.list({ activo: true, disponible: true }),
      ])
      setPedidos(pedRes.data.results || pedRes.data)
      setMesas(mesasRes.data.results || mesasRes.data)
      setProductos(prodRes.data.results || prodRes.data)
    } catch (error) {
      console.error('Error cargando pedidos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenForm = () => setShowForm(true)
  const handleCloseForm = () => {
    setShowForm(false)
    cargarDatos()
  }

  const handleEstado = async (pedidoId, estado) => {
    try {
      await pedidosAPI.cambiarEstado(pedidoId, estado)
      cargarDatos()
    } catch (error) {
      alert('No se pudo cambiar el estado')
    }
  }

  if (loading) return <div className="loading">Cargando pedidos...</div>

  return (
    <div className="pedidos-container">
      <div className="pedidos-header">
        <h1>Pedidos</h1>
        <button className="btn-primary" onClick={handleOpenForm}>+ Nuevo Pedido</button>
      </div>

      <div className="pedidos-grid">
        {pedidos.map((pedido) => (
          <div key={pedido.id} className="pedido-card">
            <div className="pedido-title">
              Pedido: {new Date(pedido.fecha_pedido).toLocaleString('es-CL')}
            </div>
            <div className="pedido-info">
              <span>Mesa: {pedido.mesa_numero || 'Mostrador'}</span>
              <span>Estado: {estadoLabel[pedido.estado] || pedido.estado}</span>
            </div>
            <div className="pedido-actions">
              <button
                className="btn-secondary btn-preparacion"
                onClick={() => handleEstado(pedido.id, 'EN_PREPARACION')}
              >
                En preparación
              </button>
              <button
                className="btn-secondary btn-servido"
                onClick={() => handleEstado(pedido.id, 'SERVIDO')}
              >
                Servido
              </button>
              <button
                className="btn-secondary btn-cerrar"
                onClick={() => handleEstado(pedido.id, 'CERRADO')}
              >
                Cerrar
              </button>
            </div>
          </div>
        ))}
      </div>

      {!pedidos.length && (
        <div className="empty-state">
          <p>No hay pedidos activos</p>
          <button className="btn-primary" onClick={handleOpenForm}>Crear primer pedido</button>
        </div>
      )}

      {showForm && (
        <PedidoForm
          mesas={mesas}
          productos={productos}
          onClose={handleCloseForm}
          onCreateDetalle={(detalle) => detallesAPI.create(detalle)}
          onCreatePedido={(data) => pedidosAPI.create(data)}
        />
      )}
    </div>
  )
}

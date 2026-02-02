import { useEffect, useState } from 'react'
import { ventasAPI, pedidosAPI, cajasAPI, detallesAPI } from '../../api/ventas.api'
import VentaForm from './VentaForm'
import { formatMoney, formatDate } from '../../utils/formatters'
import './ventas.css'

const metodoPagoLabel = {
  EFECTIVO: 'Efectivo',
  TARJETA_CREDITO: 'Tarjeta de Crédito',
  TARJETA_DEBITO: 'Tarjeta de Débito',
  TRANSFERENCIA: 'Transferencia',
  MIXTOS: 'Pagos Mixtos',
}

export default function VentasList() {
  const [ventas, setVentas] = useState([])
  const [pedidos, setPedidos] = useState([])
  const [cajas, setCajas] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [detalleVenta, setDetalleVenta] = useState(null)
  const [detalleItems, setDetalleItems] = useState([])
  const [detalleLoading, setDetalleLoading] = useState(false)

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    setLoading(true)
    try {
      const [ventasRes, pedidosRes, cajasRes] = await Promise.all([
        ventasAPI.list(),
        pedidosAPI.list({ estado: 'CERRADO' }),
        cajasAPI.list(),
      ])
      setVentas(ventasRes.data.results || ventasRes.data)
      setPedidos(pedidosRes.data.results || pedidosRes.data)
      setCajas(cajasRes.data.results || cajasRes.data)
    } catch (error) {
      console.error('Error cargando ventas:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenForm = () => setShowForm(true)
  const handleCloseForm = () => {
    setShowForm(false)
    cargarDatos()
  }

  const handleAnular = async (ventaId) => {
    if (!confirm('¿Anular esta venta?')) return
    try {
      await ventasAPI.anular(ventaId)
      cargarDatos()
    } catch (error) {
      alert('No se pudo anular la venta')
    }
  }

  const handleVerDetalles = async (venta) => {
    setDetalleVenta(venta)
    setDetalleItems([])
    setDetalleLoading(true)
    try {
      const res = await detallesAPI.list({ pedido: venta.pedido })
      setDetalleItems(res.data.results || res.data)
    } catch (error) {
      alert('No se pudieron cargar los detalles')
    } finally {
      setDetalleLoading(false)
    }
  }

  if (loading) return <div className="loading">Cargando ventas...</div>

  const pedidosMap = new Map(pedidos.map((pedido) => [pedido.id, pedido]))

  return (
    <div className="ventas-container">
      <div className="ventas-header">
        <h1>Ventas</h1>
        <button className="btn-primary" onClick={handleOpenForm}>+ Nueva Venta</button>
      </div>

      <div className="ventas-grid">
        {ventas.map((venta) => (
          (() => {
            const pedido = pedidosMap.get(venta.pedido)
            const mesaNumero = pedido?.mesa_numero || pedido?.mesa || 'Mostrador'
            const fechaLabel = formatDate(venta.fecha_venta)
            return (
          <div key={venta.id} className={`venta-card ${venta.anulada ? 'anulada' : ''}`}>
            <div className="venta-title">Venta: {fechaLabel}</div>
            <div className="venta-info">
              <span>Mesa: {mesaNumero}</span>
              <span>Monto: {formatMoney(venta.monto_total)}</span>
              <span>Método: {metodoPagoLabel[venta.metodo_pago] || venta.metodo_pago}</span>
              <span>Estado: {venta.anulada ? 'Anulada' : 'Activa'}</span>
            </div>
            <div className="venta-actions">
              <button className="btn-secondary" onClick={() => handleVerDetalles(venta)}>
                Ver detalles
              </button>
              {!venta.anulada && (
                <button className="btn-delete" onClick={() => handleAnular(venta.id)}>
                  Anular
                </button>
              )}
            </div>
          </div>
            )
          })()
        ))}
      </div>

      {!ventas.length && (
        <div className="empty-state">
          <p>No hay ventas registradas</p>
          <button className="btn-primary" onClick={handleOpenForm}>Crear primera venta</button>
        </div>
      )}

      {showForm && (
        <VentaForm
          pedidos={pedidos}
          cajas={cajas}
          onClose={handleCloseForm}
          onCreate={(data) => ventasAPI.create(data)}
        />
      )}

      {detalleVenta && (
        <div className="modal-overlay" onClick={() => setDetalleVenta(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Detalle de venta</h2>
              <button className="btn-close" onClick={() => setDetalleVenta(null)}>×</button>
            </div>
            <div className="venta-detalle-body">
              {detalleLoading && <p>Cargando...</p>}
              {!detalleLoading && detalleItems.length === 0 && (
                <p>No hay productos asociados.</p>
              )}
              {!detalleLoading && detalleItems.length > 0 && (
                <table className="venta-detalle-table">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Cantidad</th>
                      <th>Precio</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detalleItems.map((item) => (
                      <tr key={item.id}>
                        <td>{item.nombre_producto}</td>
                        <td>{item.cantidad}</td>
                        <td>{formatMoney(item.precio_unitario)}</td>
                        <td>{formatMoney(item.subtotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

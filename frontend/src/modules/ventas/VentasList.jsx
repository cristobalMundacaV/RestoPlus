import { useEffect, useState } from 'react'
import { ventasAPI, pedidosAPI, cajasAPI } from '../../api/ventas.api'
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

  if (loading) return <div className="loading">Cargando ventas...</div>

  return (
    <div className="ventas-container">
      <div className="ventas-header">
        <h1>Ventas</h1>
        <button className="btn-primary" onClick={handleOpenForm}>+ Nueva Venta</button>
      </div>

      <div className="ventas-grid">
        {ventas.map((venta) => (
          <div key={venta.id} className={`venta-card ${venta.anulada ? 'anulada' : ''}`}>
            <div className="venta-title">Venta #{venta.id}</div>
            <div className="venta-info">
              <span>Pedido: {venta.pedido}</span>
              <span>Monto: {formatMoney(venta.monto_total)}</span>
              <span>Método: {metodoPagoLabel[venta.metodo_pago] || venta.metodo_pago}</span>
              <span>Fecha: {formatDate(venta.fecha_venta)}</span>
              <span>Estado: {venta.anulada ? 'Anulada' : 'Activa'}</span>
            </div>
            {!venta.anulada && (
              <button className="btn-delete" onClick={() => handleAnular(venta.id)}>
                Anular
              </button>
            )}
          </div>
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
    </div>
  )
}

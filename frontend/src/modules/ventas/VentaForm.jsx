import { useState } from 'react'

const metodosPago = [
  { value: 'EFECTIVO', label: 'Efectivo' },
  { value: 'TARJETA_CREDITO', label: 'Tarjeta de Crédito' },
  { value: 'TARJETA_DEBITO', label: 'Tarjeta de Débito' },
  { value: 'TRANSFERENCIA', label: 'Transferencia' },
  { value: 'MIXTOS', label: 'Pagos Mixtos' },
]

export default function VentaForm({ pedidos, cajas, onClose, onCreate }) {
  const [pedidoId, setPedidoId] = useState('')
  const [cajaId, setCajaId] = useState('')
  const [metodoPago, setMetodoPago] = useState('EFECTIVO')
  const [loading, setLoading] = useState(false)

  const cajasAbiertas = cajas.filter((c) => c.abierta)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!pedidoId || !cajaId) return alert('Selecciona pedido y caja')

    setLoading(true)
    try {
      await onCreate({ pedido: pedidoId, caja: cajaId, metodo_pago: metodoPago })
      onClose()
    } catch (error) {
      console.error('Error creando venta:', error)
      alert(error.response?.data?.error || 'Error al crear venta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Nueva Venta</h2>
          <button onClick={onClose} className="btn-close">×</button>
        </div>

        <form onSubmit={handleSubmit} className="venta-form">
          <div className="form-group">
            <label>Pedido (cerrado)</label>
            <select value={pedidoId} onChange={(e) => setPedidoId(e.target.value)} required>
              <option value="">Seleccionar pedido</option>
              {pedidos.map((p) => (
                <option key={p.id} value={p.id}>
                  Pedido #{p.id} - Mesa {p.mesa_numero || 'Mostrador'}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Caja abierta</label>
            <select value={cajaId} onChange={(e) => setCajaId(e.target.value)} required>
              <option value="">Seleccionar caja</option>
              {cajasAbiertas.map((c) => (
                <option key={c.id} value={c.id}>
                  Caja #{c.id} - {new Date(c.fecha_apertura).toLocaleString('es-CL')}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Método de pago</label>
            <select value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)} required>
              {metodosPago.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Guardando...' : 'Crear Venta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

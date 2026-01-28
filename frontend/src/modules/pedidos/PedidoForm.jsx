import { useState } from 'react'
import { formatMoney } from '../../utils/formatters'

export default function PedidoForm({ mesas, productos, onClose, onCreatePedido, onCreateDetalle }) {
  const [mesaId, setMesaId] = useState('')
  const [items, setItems] = useState([])
  const [selectedProducto, setSelectedProducto] = useState('')
  const [cantidad, setCantidad] = useState(1)
  const [loading, setLoading] = useState(false)

  const agregarItem = () => {
    const producto = productos.find((p) => String(p.id) === String(selectedProducto))
    if (!producto) return

    setItems((prev) => {
      const existing = prev.find((i) => i.producto.id === producto.id)
      if (existing) {
        return prev.map((i) =>
          i.producto.id === producto.id
            ? { ...i, cantidad: i.cantidad + Number(cantidad) }
            : i
        )
      }
      return [...prev, { producto, cantidad: Number(cantidad), precio_unitario: producto.precio }]
    })
    setSelectedProducto('')
    setCantidad(1)
  }

  const eliminarItem = (id) => {
    setItems((prev) => prev.filter((i) => i.producto.id !== id))
  }

  const total = items.reduce((acc, i) => acc + i.cantidad * i.precio_unitario, 0)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!items.length) return alert('Agrega al menos un producto')

    setLoading(true)
    try {
      const pedidoRes = await onCreatePedido({ mesa: mesaId || null, estado: 'ABIERTO' })
      const pedido = pedidoRes.data

      for (const item of items) {
        await onCreateDetalle({
          pedido: pedido.id,
          producto: item.producto.id,
          cantidad: item.cantidad,
          precio_unitario: item.precio_unitario,
        })
      }

      onClose()
    } catch (error) {
      console.error('Error creando pedido:', error)
      alert('Error al crear pedido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Nuevo Pedido</h2>
          <button onClick={onClose} className="btn-close">×</button>
        </div>

        <form onSubmit={handleSubmit} className="pedido-form">
          <div className="form-group">
            <label>Mesa</label>
            <select value={mesaId} onChange={(e) => setMesaId(e.target.value)}>
              <option value="">Mostrador</option>
              {mesas.map((mesa) => (
                <option key={mesa.id} value={mesa.id}>
                  Mesa {mesa.numero}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Producto</label>
              <select value={selectedProducto} onChange={(e) => setSelectedProducto(e.target.value)}>
                <option value="">Seleccionar producto</option>
                {productos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre} - {formatMoney(p.precio)}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Cantidad</label>
              <input
                type="number"
                min="1"
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
              />
            </div>
            <button type="button" className="btn-secondary" onClick={agregarItem}>
              Agregar
            </button>
          </div>

          <div className="items-list">
            {items.map((item) => (
              <div key={item.producto.id} className="item-row">
                <span>{item.producto.nombre}</span>
                <span>{item.cantidad} × {formatMoney(item.precio_unitario)}</span>
                <span>{formatMoney(item.cantidad * item.precio_unitario)}</span>
                <button type="button" className="btn-delete" onClick={() => eliminarItem(item.producto.id)}>
                  Eliminar
                </button>
              </div>
            ))}
          </div>

          <div className="total-row">
            Total: {formatMoney(total)}
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Guardando...' : 'Crear Pedido'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

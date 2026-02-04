import { useEffect, useState } from 'react'
import { pedidosAPI, detallesAPI } from '../../api/ventas.api'
import { mesasAPI } from '../../api/otros.api'
import { productosAPI } from '../../api/productos.api'
import PedidoForm from './PedidoForm'
import { formatMoney } from '../../utils/formatters'
import './pedidos.css'

const estadoLabel = {
  ABIERTO: 'Abierto',
  EN_PREPARACION: 'En preparación',
  SERVIDO: 'Servido',
  CERRADO: 'Cerrado',
  CANCELADO: 'Cancelado',
}

const salasDefault = ['Terraza delantera', 'Terraza trasera', 'Sala 1', 'Sala 2']

const getSalaOptions = (salas) => {
  const names = salas.filter((sala) => sala.nombre !== 'Principal').map((sala) => sala.nombre)
  const merged = [...salasDefault, ...names]
  return Array.from(new Set(merged))
}

const completarMesasPorSala = (lista, sala) => {
  const tope = sala === 'Sala 1' || sala === 'Sala 2' ? 12 : 24
  const existentes = new Set(lista.map((mesa) => Number(mesa.numero)))
  const completadas = [...lista]

  for (let i = 1; i <= tope; i += 1) {
    if (!existentes.has(i)) {
      completadas.push({
        id: `mock-${sala}-${i}`,
        numero: i,
        capacidad: 4,
        estado: 'DISPONIBLE',
        sala_nombre: sala,
      })
    }
  }

  return completadas.sort((a, b) => a.numero - b.numero)
}

export default function PedidosList() {
  const [pedidos, setPedidos] = useState([])
  const [mesas, setMesas] = useState([])
  const [salas, setSalas] = useState([])
  const [salaSeleccionada, setSalaSeleccionada] = useState('')
  const [mesaSeleccionada, setMesaSeleccionada] = useState(null)
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [detalleOpen, setDetalleOpen] = useState(false)
  const [detallePedido, setDetallePedido] = useState(null)
  const [detalleItems, setDetalleItems] = useState([])
  const [detalleLoading, setDetalleLoading] = useState(false)

  useEffect(() => {
    cargarDatos()
  }, [])

  useEffect(() => {
    if (!salaSeleccionada) {
      return
    }
    const mesasSala = mesas.filter((mesa) => mesa.sala_nombre === salaSeleccionada)
    if (!mesasSala.length) {
      setMesaSeleccionada(null)
      return
    }
    if (!mesaSeleccionada || mesaSeleccionada.sala_nombre !== salaSeleccionada) {
      setMesaSeleccionada(mesasSala[0])
    }
  }, [salaSeleccionada, mesas])

  const cargarDatos = async () => {
    setLoading(true)
    try {
      const [pedRes, mesasRes, salasRes, prodRes] = await Promise.all([
        pedidosAPI.list(),
        mesasAPI.mesas(),
        mesasAPI.salas(),
        productosAPI.list({ activo: true, disponible: true }),
      ])
      setPedidos(pedRes.data.results || pedRes.data)
      const mesasData = mesasRes.data.results || mesasRes.data
      setMesas(mesasData)
      const salasData = salasRes.data.results || salasRes.data
      const filtradas = salasData.filter((sala) => sala.nombre !== 'Principal')
      setSalas(filtradas)
      if (!salaSeleccionada || salaSeleccionada === 'Principal') {
        const first = filtradas.length ? filtradas[0].nombre : getSalaOptions(filtradas)[0]
        setSalaSeleccionada(first)
      }
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

  const handleAnular = async (pedidoId) => {
    try {
      await pedidosAPI.cancelar(pedidoId)
      cargarDatos()
    } catch (error) {
      alert('No se pudo anular el pedido')
    }
  }

  const handleDetalles = async (pedido) => {
    setDetallePedido(pedido)
    setDetalleOpen(true)
    setDetalleLoading(true)
    try {
      const res = await detallesAPI.list({ pedido: pedido.id })
      const data = res.data.results || res.data
      const filtrados = Array.isArray(data)
        ? data.filter((item) => item.pedido === pedido.id)
        : []
      setDetalleItems(filtrados)
    } catch (error) {
      console.error('Error cargando detalles:', error)
      setDetalleItems([])
    } finally {
      setDetalleLoading(false)
    }
  }

  if (loading) return <div className="loading">Cargando pedidos...</div>

  const mesasSalaBase = salaSeleccionada
    ? mesas.filter((mesa) => mesa.sala_nombre === salaSeleccionada)
    : mesas
  const mesasSala = salaSeleccionada
    ? completarMesasPorSala(mesasSalaBase, salaSeleccionada)
    : mesasSalaBase.sort((a, b) => a.numero - b.numero)

  const mesasSalaIds = new Set(mesasSalaBase.map((mesa) => mesa.id))
  const pedidosFiltrados = pedidos.filter((pedido) => {
    const pasaSala = salaSeleccionada ? mesasSalaIds.has(pedido.mesa) : true
    const pasaMesa = mesaSeleccionada ? pedido.mesa === mesaSeleccionada.id : true
    return pasaSala && pasaMesa
  })

  return (
    <div className="pedidos-container">
      <div className="pedidos-header">
        <div className="pedidos-title">
          <h1>Pedidos</h1>
          <div className="sala-selector">
            <span className="sala-label">Sala</span>
            <select
              className="sala-select"
              value={salaSeleccionada || ''}
              onChange={(e) => setSalaSeleccionada(e.target.value)}
            >
              {getSalaOptions(salas).map((nombre) => (
                <option key={nombre} value={nombre}>
                  {nombre}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button className="btn-primary" onClick={handleOpenForm}>
          + Nuevo Pedido
        </button>
      </div>

      <div className="pedidos-mesas">
        <div className="mesas-grid">
          {mesasSala.map((mesa) => (
            <button
              key={mesa.id}
              type="button"
              className={`mesa-card ${mesaSeleccionada?.id === mesa.id ? 'mesa-card-active' : ''}`}
              onClick={() => setMesaSeleccionada(mesa)}
            >
              <div className="mesa-title">Mesa</div>
              <div className="mesa-number">{mesa.numero}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="pedidos-grid">
        {pedidosFiltrados.map((pedido) => (
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
                className="btn-secondary btn-detalles"
                onClick={() => handleDetalles(pedido)}
              >
                Detalles
              </button>
              <button
                className="btn-secondary btn-anular"
                onClick={() => handleAnular(pedido.id)}
              >
                Anular
              </button>
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

      {detalleOpen && detallePedido && (
        <div className="pedido-modal-overlay" onClick={() => setDetalleOpen(false)}>
          <div className="pedido-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pedido-modal-header">
              <h3>Detalles del pedido</h3>
              <button
                className="pedido-modal-close"
                onClick={() => setDetalleOpen(false)}
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>
            <div className="pedido-modal-body">
              <div className="pedido-modal-meta">
                <span>Mesa: {detallePedido.mesa_numero || 'Mostrador'}</span>
                <span>
                  Fecha: {new Date(detallePedido.fecha_pedido).toLocaleString('es-CL')}
                </span>
              </div>
              {detalleLoading ? (
                <div className="loading">Cargando detalles...</div>
              ) : detalleItems.length ? (
                <table className="pedido-detalle-table">
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
                        <td>{item.nombre_producto || item.producto}</td>
                        <td>{item.cantidad}</td>
                        <td>{formatMoney(item.precio_unitario || 0)}</td>
                        <td>{formatMoney(item.subtotal || item.cantidad * item.precio_unitario)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="pedido-detalle-empty">Este pedido no tiene productos.</p>
              )}
            </div>
            <div className="pedido-modal-actions">
              <button className="btn-secondary" onClick={() => setDetalleOpen(false)}>
                Volver
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

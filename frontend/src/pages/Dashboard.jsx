import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import { biAPI, mesasAPI } from '../api/otros.api'
import { productosAPI } from '../api/productos.api'
import { pedidosAPI, detallesAPI, ventasAPI, cajasAPI } from '../api/ventas.api'
import { formatMoney } from '../utils/formatters'
import '../styles/dashboard.css'

const estadoClase = {
  DISPONIBLE: 'estado-disponible',
  OCUPADA: 'estado-ocupada',
  RESERVADA: 'estado-reservada',
  EN_LIMPIEZA: 'estado-en-limpieza',
}

const estadoLabel = {
  DISPONIBLE: 'Disponible',
  OCUPADA: 'Ocupada',
  RESERVADA: 'Reservada',
  EN_LIMPIEZA: 'En limpieza',
}

const salasDefault = ['Terraza delantera', 'Terraza trasera', 'Sala 1', 'Sala 2', 'Principal']

const getSalaOptions = (salas) => {
  const names = salas.map((sala) => sala.nombre)
  const merged = [...salasDefault, ...names]
  return Array.from(new Set(merged))
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuthStore()
  const [data, setData] = useState(null)
  const [salas, setSalas] = useState([])
  const [mesas, setMesas] = useState([])
  const [salaSeleccionada, setSalaSeleccionada] = useState('')
  const [loading, setLoading] = useState(true)
  const [mesaSeleccionada, setMesaSeleccionada] = useState(null)
  const [panelMesa, setPanelMesa] = useState(null)
  const [productos, setProductos] = useState([])
  const [productoSeleccionado, setProductoSeleccionado] = useState(null)
  const [busquedaProducto, setBusquedaProducto] = useState('')
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false)
  const [cantidad, setCantidad] = useState(1)
  const [itemsMesa, setItemsMesa] = useState([])
  const [itemsPorMesa, setItemsPorMesa] = useState({})
  const [pedidosPorMesa, setPedidosPorMesa] = useState({})
  const [metodoPago, setMetodoPago] = useState('EFECTIVO')
  const [accionesCantidad, setAccionesCantidad] = useState({})

  const getMesaKey = (mesa) => `${mesa.sala_nombre || salaSeleccionada || 'Principal'}-${mesa.numero}`

  useEffect(() => {
    const raw = localStorage.getItem('itemsPorMesa')
    if (raw) {
      try {
        const parsed = JSON.parse(raw)
        if (parsed && typeof parsed === 'object') {
          setItemsPorMesa(parsed)
        }
      } catch (error) {
        console.error('Error leyendo itemsPorMesa:', error)
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('itemsPorMesa', JSON.stringify(itemsPorMesa))
  }, [itemsPorMesa])

  useEffect(() => {
    const raw = localStorage.getItem('pedidosPorMesa')
    if (raw) {
      try {
        const parsed = JSON.parse(raw)
        if (parsed && typeof parsed === 'object') {
          setPedidosPorMesa(parsed)
        }
      } catch (error) {
        console.error('Error leyendo pedidosPorMesa:', error)
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('pedidosPorMesa', JSON.stringify(pedidosPorMesa))
  }, [pedidosPorMesa])

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/')
    } else {
      cargarDatos()
      cargarSalas()
    }
  }, [isAuthenticated, navigate])

  useEffect(() => {
    if (salaSeleccionada) {
      cargarMesas()
    }
  }, [salaSeleccionada])

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

  const cargarSalas = async () => {
    try {
      const res = await mesasAPI.salas()
      const data = res.data.results || res.data
      setSalas(data)
      if (!salaSeleccionada) {
        const first = data.length ? data[0].nombre : getSalaOptions(data)[0]
        setSalaSeleccionada(first)
      }
    } catch (error) {
      console.error('Error cargando salas:', error)
    }
  }

  const cargarMesas = async () => {
    try {
      const res = await mesasAPI.mesas()
      const mesasData = res.data.results || res.data
      // Ordenar mesas de menor a mayor número
      const mesasOrdenadas = mesasData.sort((a, b) => a.numero - b.numero)
      setMesas(mesasOrdenadas)
    } catch (error) {
      console.error('Error cargando mesas:', error)
    }
  }

  const cargarProductos = async () => {
    try {
      const res = await productosAPI.list()
      const data = res.data.results || res.data
      setProductos(data)
    } catch (error) {
      console.error('Error cargando productos:', error)
    }
  }

  const abrirMesa = async (mesa) => {
    try {
      if (String(mesa.id).startsWith('mock-')) {
        const actualizada = { ...mesa, estado: 'OCUPADA' }
        setMesas((prev) => {
          const existe = prev.find((item) => item.id === mesa.id)
          if (existe) {
            return prev.map((item) => (item.id === mesa.id ? actualizada : item))
          }
          return [...prev, actualizada]
        })
        return actualizada
      }

      const res = await mesasAPI.cambiarEstado(mesa.id, { estado: 'OCUPADA' })
      const actualizada = res.data
      setMesas((prev) => prev.map((item) => (item.id === mesa.id ? actualizada : item)))
      return actualizada
    } catch (error) {
      console.error('Error abriendo mesa:', error)
    }

    return null
  }

  const cargarPedidoActivoMesa = async (mesa) => {
    if (!mesa || String(mesa.id).startsWith('mock-')) {
      return { pedidoId: null, items: [] }
    }

    try {
      const pedidosRes = await pedidosAPI.list({ mesa: mesa.id })
      const pedidosData = pedidosRes.data.results || pedidosRes.data
      const pedidoActivo =
        pedidosData.find((pedido) => !['CERRADO', 'CANCELADO'].includes(pedido.estado)) ||
        pedidosData[0]

      if (!pedidoActivo) {
        return { pedidoId: null, items: [] }
      }

      const detallesRes = await detallesAPI.list({ pedido: pedidoActivo.id })
      const detallesData = detallesRes.data.results || detallesRes.data
      const items = detallesData.map((detalle) => {
        const precio = Number(detalle.precio_unitario || 0)
        const subtotal =
          typeof detalle.subtotal === 'number'
            ? detalle.subtotal
            : detalle.cantidad * precio
        return {
          detalleId: detalle.id,
          id: detalle.producto,
          nombre: detalle.nombre_producto,
          cantidad: detalle.cantidad,
          precio,
          subtotal,
          origen: 'backend',
        }
      })

      return { pedidoId: pedidoActivo.id, items }
    } catch (error) {
      console.error('Error cargando pedido de la mesa:', error)
      return { pedidoId: null, items: [] }
    }
  }

  const abrirPanelMesa = async (mesa) => {
    setPanelMesa(mesa)
    if (!productos.length) {
      cargarProductos()
    }
    setProductoSeleccionado(null)
    setBusquedaProducto('')
    setCantidad(1)
    setMetodoPago('EFECTIVO')

    const mesaKey = getMesaKey(mesa)
    const draftItems = itemsPorMesa[mesaKey] || []
    const { pedidoId, items } = await cargarPedidoActivoMesa(mesa)

    if (pedidoId) {
      setPedidosPorMesa((prev) => ({
        ...prev,
        [mesaKey]: pedidoId,
      }))
    }

    setItemsMesa([...items, ...draftItems])
  }

  const agregarProducto = () => {
    let producto = productoSeleccionado
    if (!producto) {
      const match = productos.find(
        (item) => item.nombre?.toLowerCase() === busquedaProducto.trim().toLowerCase()
      )
      if (match) {
        producto = match
      } else if (productosFiltrados.length > 0) {
        producto = productosFiltrados[0]
      }
    }

    if (!producto) {
      return
    }

    const precio = Number(producto.precio || 0)
    const nuevoItem = {
      tempId: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      id: producto.id,
      nombre: producto.nombre,
      cantidad,
      precio,
      subtotal: cantidad * precio,
      origen: 'draft',
    }
    setItemsMesa((prev) => [...prev, nuevoItem])
    if (panelMesa) {
      const mesaKey = getMesaKey(panelMesa)
      setItemsPorMesa((prevMap) => ({
        ...prevMap,
        [mesaKey]: [...(prevMap[mesaKey] || []), nuevoItem],
      }))
    }
    setProductoSeleccionado(null)
    setBusquedaProducto('')
    setMostrarSugerencias(false)
    setCantidad(1)
  }

  const registrarPedidoMesa = async () => {
    if (!panelMesa) {
      return
    }
    if (String(panelMesa.id).startsWith('mock-')) {
      alert('No se puede registrar pedido en mesas de prueba.')
      return
    }
    const mesaKey = getMesaKey(panelMesa)
    const draftItems = itemsPorMesa[mesaKey] || []
    if (!draftItems.length) {
      alert('Agrega productos antes de registrar el pedido.')
      return
    }

    try {
      let pedidoId = pedidosPorMesa[mesaKey]

      if (!pedidoId) {
        const resPedido = await pedidosAPI.create({ mesa: panelMesa.id })
        pedidoId = resPedido.data.id
        setPedidosPorMesa((prev) => ({
          ...prev,
          [mesaKey]: pedidoId,
        }))
      }

      await Promise.all(
        draftItems.map((item) =>
          detallesAPI.create({
            pedido: pedidoId,
            producto: item.id,
            cantidad: item.cantidad,
            precio_unitario: item.precio,
          })
        )
      )

      setItemsPorMesa((prev) => ({
        ...prev,
        [mesaKey]: [],
      }))

      const { items } = await cargarPedidoActivoMesa(panelMesa)
      setItemsMesa(items)
      alert('Productos agregados al pedido.')
    } catch (error) {
      console.error('Error registrando pedido:', error)
      alert('Error al agregar productos al pedido')
    }
  }

  const getItemKey = (item, index) => {
    if (item.detalleId) {
      return `detalle-${item.detalleId}`
    }
    if (item.tempId) {
      return `temp-${item.tempId}`
    }
    return `item-${item.id}-${index}`
  }

  const incrementarCantidad = async (item, index, incrementoInput) => {
    if (!panelMesa) {
      return
    }
    const incremento = Math.max(1, Number(incrementoInput) || 1)

    if (item.origen === 'backend') {
      if (!item.detalleId) {
        return
      }
      const nuevaCantidad = item.cantidad + incremento
      try {
        await detallesAPI.update(item.detalleId, { cantidad: nuevaCantidad })
        setItemsMesa((prev) =>
          prev.map((p, i) =>
            i === index
              ? {
                  ...p,
                  cantidad: nuevaCantidad,
                  subtotal: nuevaCantidad * p.precio,
                }
              : p
          )
        )
      } catch (error) {
        console.error('Error aumentando cantidad:', error)
        alert('No se pudo aumentar la cantidad')
      }
      return
    }

    const nuevaCantidad = item.cantidad + incremento
    setItemsMesa((prev) =>
      prev.map((p, i) =>
        i === index
          ? { ...p, cantidad: nuevaCantidad, subtotal: nuevaCantidad * p.precio }
          : p
      )
    )

    const mesaKey = getMesaKey(panelMesa)
    setItemsPorMesa((prevMap) => {
      const drafts = prevMap[mesaKey] || []
      const updated = drafts.map((draft) =>
        draft.tempId === item.tempId
          ? { ...draft, cantidad: nuevaCantidad, subtotal: nuevaCantidad * draft.precio }
          : draft
      )
      return {
        ...prevMap,
        [mesaKey]: updated,
      }
    })
  }

  const eliminarProductoMesa = async (item, index) => {
    if (!panelMesa) {
      return
    }

    if (item.origen === 'backend') {
      if (!item.detalleId) {
        return
      }
      try {
        await detallesAPI.delete(item.detalleId)
        setItemsMesa((prev) => prev.filter((_, i) => i !== index))
      } catch (error) {
        console.error('Error eliminando producto:', error)
        alert('No se pudo eliminar el producto')
      }
      return
    }

    setItemsMesa((prev) => prev.filter((_, i) => i !== index))
    const mesaKey = getMesaKey(panelMesa)
    setItemsPorMesa((prevMap) => {
      const drafts = prevMap[mesaKey] || []
      const updated = drafts.filter((draft) => draft.tempId !== item.tempId)
      return {
        ...prevMap,
        [mesaKey]: updated,
      }
    })
  }

  const cobrarMesa = async () => {
    if (!panelMesa) {
      return
    }
    if (String(panelMesa.id).startsWith('mock-')) {
      alert('No se puede cobrar una mesa de prueba.')
      return
    }

    const mesaKey = getMesaKey(panelMesa)
    const pedidoId = pedidosPorMesa[mesaKey]
    if (!pedidoId) {
      alert('No hay pedido asociado a esta mesa.')
      return
    }

    try {
      const cajasRes = await cajasAPI.list()
      const cajasData = cajasRes.data.results || cajasRes.data
      const cajaAbierta = cajasData.find((caja) => caja.abierta)
      if (!cajaAbierta) {
        alert('No hay caja abierta.')
        return
      }

      await pedidosAPI.cambiarEstado(pedidoId, 'CERRADO')

      await ventasAPI.create({
        pedido: pedidoId,
        caja: cajaAbierta.id,
        metodo_pago: metodoPago,
      })

      await mesasAPI.cambiarEstado(panelMesa.id, { estado: 'DISPONIBLE' })

      setItemsMesa([])
      setItemsPorMesa((prev) => {
        const next = { ...prev }
        delete next[mesaKey]
        return next
      })
      setPedidosPorMesa((prev) => {
        const next = { ...prev }
        delete next[mesaKey]
        return next
      })
      setPanelMesa(null)
      alert('Mesa cobrada correctamente.')
    } catch (error) {
      console.error('Error cobrando mesa:', error)
      const mensaje = error?.response?.data?.error || 'Error al cobrar la mesa'
      alert(mensaje)
    }
  }

  const productosFiltrados = productos.filter((producto) =>
    producto.nombre?.toLowerCase().includes(busquedaProducto.toLowerCase())
  )

  const totalMesa = itemsMesa.reduce((acc, item) => {
    const subtotal =
      typeof item.subtotal === 'number' ? item.subtotal : item.cantidad * item.precio
    return acc + subtotal
  }, 0)

  const completarMesasPorSala = (lista) => {
    const sala = salaSeleccionada || 'Principal'
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

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="header-left">
          <h1>Panel de Control</h1>
          <p>Bienvenido {user?.username || 'Usuario'}</p>
        </div>
        <div className="dashboard-actions">
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
          <button className="action-button action-primary" onClick={() => navigate('/pedidos')}>
            Nuevo Pedido
          </button>
          <button className="action-button action-success" onClick={() => navigate('/ventas')}>
            Nueva Venta
          </button>
          <button className="action-button action-warning" onClick={() => navigate('/cajas')}>
            Abrir Caja
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading">Cargando...</div>
      ) : (
        <div className="mesas-section">
          {/* Mesas Grid */}
          <div className="mesas-grid">
            {completarMesasPorSala(
              mesas.filter((mesa) => !salaSeleccionada || mesa.sala_nombre === salaSeleccionada)
            ).map((mesa) => (
                <div
                  key={mesa.id}
                  className={`mesa-card ${estadoClase[mesa.estado] || ''}`}
                  onClick={() => {
                    if (mesa.estado === 'OCUPADA') {
                      abrirPanelMesa(mesa)
                      return
                    }
                    setMesaSeleccionada(mesa)
                  }}
                >
                  <div className="mesa-title">Mesa</div>
                  <div className="mesa-number">{mesa.numero}</div>
                  <div className="mesa-capacidad">Capacidad: {mesa.capacidad}</div>
                  <div className="mesa-estado">{estadoLabel[mesa.estado] || mesa.estado}</div>
                </div>
            ))}
          </div>
        </div>
      )}

      {mesaSeleccionada && (
        <div className="mesa-modal-overlay" onClick={() => setMesaSeleccionada(null)}>
          <div className="mesa-modal" onClick={(e) => e.stopPropagation()}>
            <div className="mesa-modal-header">
              <h3>Abrir mesa</h3>
              <button
                className="mesa-modal-close"
                onClick={() => setMesaSeleccionada(null)}
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>
            <div className="mesa-modal-body">
              <p>
                ¿Quieres abrir la mesa <strong>{mesaSeleccionada.numero}</strong>?
              </p>
            </div>
            <div className="mesa-modal-actions">
              <button
                className="modal-btn modal-btn-secondary"
                onClick={() => setMesaSeleccionada(null)}
              >
                Cancelar
              </button>
              <button
                className="modal-btn modal-btn-primary"
                onClick={async () => {
                  const actualizada = await abrirMesa(mesaSeleccionada)
                  setMesaSeleccionada(null)
                  if (actualizada) {
                    abrirPanelMesa(actualizada)
                  }
                }}
              >
                Abrir mesa
              </button>
            </div>
          </div>
        </div>
      )}

      {panelMesa && (
        <div className="mesa-panel">
          <div className="mesa-panel-header">
            <div className="mesa-panel-title">Mesa {panelMesa.numero}</div>
            <button className="mesa-panel-close" onClick={() => setPanelMesa(null)}>
              ×
            </button>
          </div>
          <div className="mesa-panel-body">
            <h4 className="mesa-panel-section-title">Productos</h4>
            <label className="mesa-panel-label">Buscar producto</label>
            <div className="mesa-panel-row">
              <input
                className="mesa-panel-search"
                type="text"
                placeholder="Buscar..."
                value={busquedaProducto}
                onChange={(e) => {
                  setBusquedaProducto(e.target.value)
                  setProductoSeleccionado(null)
                  setMostrarSugerencias(true)
                }}
                onFocus={() => setMostrarSugerencias(true)}
                onBlur={() => setTimeout(() => setMostrarSugerencias(false), 150)}
              />
              <input
                className="mesa-panel-qty"
                type="number"
                min="1"
                value={cantidad}
                onChange={(e) => setCantidad(Number(e.target.value))}
              />
              <button className="mesa-panel-add" onClick={agregarProducto}>
                Agregar
              </button>
            </div>

            {mostrarSugerencias && busquedaProducto && productosFiltrados.length > 0 && (
              <div className="mesa-panel-suggestions">
                {productosFiltrados.slice(0, 6).map((producto) => (
                  <button
                    key={producto.id}
                    type="button"
                    className="mesa-panel-suggestion"
                    onClick={() => {
                      setProductoSeleccionado(producto)
                      setBusquedaProducto(producto.nombre)
                      setMostrarSugerencias(false)
                    }}
                  >
                    {producto.nombre} - {formatMoney(producto.precio || 0)}
                  </button>
                ))}
              </div>
            )}

            {productos.length === 0 && (
              <div className="mesa-panel-empty-products">
                No hay productos disponibles.
              </div>
            )}

            <div className="mesa-panel-items">
              <table className="mesa-panel-table">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Precio</th>
                    <th>Subtotal</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {itemsMesa.length === 0 && (
                    <tr>
                      <td className="mesa-panel-empty" colSpan={5}>
                        Sin productos agregados
                      </td>
                    </tr>
                  )}
                  {itemsMesa.map((item, index) => (
                    <tr key={`${item.id}-${index}`}>
                      <td>{item.nombre}</td>
                      <td>{item.cantidad}</td>
                      <td>{formatMoney(item.precio)}</td>
                      <td>
                        {formatMoney(
                          typeof item.subtotal === 'number'
                            ? item.subtotal
                            : item.cantidad * item.precio
                        )}
                      </td>
                      <td>
                        <div className="mesa-panel-actions-cell">
                          <input
                            className="mesa-panel-action-input"
                            type="number"
                            min="1"
                            value={accionesCantidad[getItemKey(item, index)] ?? 1}
                            onChange={(e) =>
                              setAccionesCantidad((prev) => ({
                                ...prev,
                                [getItemKey(item, index)]: e.target.value,
                              }))
                            }
                          />
                          <button
                            type="button"
                            className="mesa-panel-action mesa-panel-action-add"
                            onClick={() =>
                              incrementarCantidad(
                                item,
                                index,
                                accionesCantidad[getItemKey(item, index)]
                              )
                            }
                          >
                            +
                          </button>
                          <button
                            type="button"
                            className="mesa-panel-action mesa-panel-action-delete"
                            onClick={() => eliminarProductoMesa(item, index)}
                            aria-label="Eliminar"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mesa-panel-total">
                <span>Total</span>
                <strong>{formatMoney(totalMesa)}</strong>
              </div>
              <div className="mesa-panel-payment">
                <label htmlFor="metodo-pago">Método de pago</label>
                <select
                  id="metodo-pago"
                  value={metodoPago}
                  onChange={(e) => setMetodoPago(e.target.value)}
                >
                  <option value="EFECTIVO">Efectivo</option>
                  <option value="TARJETA_CREDITO">Tarjeta de crédito</option>
                  <option value="TARJETA_DEBITO">Tarjeta de débito</option>
                  <option value="TRANSFERENCIA">Transferencia</option>
                  <option value="MIXTOS">Pagos mixtos</option>
                </select>
              </div>
              <div className="mesa-panel-actions">
                <button className="mesa-panel-submit" onClick={registrarPedidoMesa}>
                  Agregar productos
                </button>
                <button className="mesa-panel-charge" onClick={cobrarMesa}>
                  Cobrar mesa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

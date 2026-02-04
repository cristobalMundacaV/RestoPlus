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

const salasDefault = ['Terraza delantera', 'Terraza trasera', 'Sala 1', 'Sala 2']

const getSalaOptions = (salas) => {
  const names = salas.filter((sala) => sala.nombre !== 'Principal').map((sala) => sala.nombre)
  const merged = [...salasDefault, ...names]
  return Array.from(new Set(merged))
}

const normalizarSala = (nombre) => String(nombre || '').trim().toLowerCase()

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
  const [toast, setToast] = useState(null)
  const [confirmAgregarOpen, setConfirmAgregarOpen] = useState(false)
  const [confirmAgregarItems, setConfirmAgregarItems] = useState([])
  const [confirmAgregarMesa, setConfirmAgregarMesa] = useState(null)
  const [confirmCobroOpen, setConfirmCobroOpen] = useState(false)
  const [cobrandoMesa, setCobrandoMesa] = useState(false)

  const getMesaKey = (mesa) => `${mesa.sala_nombre || salaSeleccionada || 'Sin sala'}-${mesa.numero}`

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
          const normalized = Object.entries(parsed).reduce((acc, [key, value]) => {
            if (Array.isArray(value)) {
              acc[key] = value
            } else if (typeof value === 'number') {
              acc[key] = [value]
            } else {
              acc[key] = []
            }
            return acc
          }, {})
          setPedidosPorMesa(normalized)
        }
      } catch (error) {
        console.error('Error leyendo pedidosPorMesa:', error)
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('pedidosPorMesa', JSON.stringify(pedidosPorMesa))
  }, [pedidosPorMesa])

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    window.setTimeout(() => {
      setToast((current) => (current?.message === message ? null : current))
    }, 2400)
  }

  const abrirConfirmacionAgregar = () => {
    if (!panelMesa) {
      return
    }
    const mesaKey = getMesaKey(panelMesa)
    const draftItems = itemsPorMesa[mesaKey] || []
    if (!draftItems.length) {
      showToast('Agrega productos antes de registrar el pedido.', 'error')
      return
    }

    const agrupados = new Map()
    draftItems.forEach((item) => {
      const current = agrupados.get(item.id)
      if (current) {
        agrupados.set(item.id, {
          ...current,
          cantidad: current.cantidad + item.cantidad,
        })
      } else {
        agrupados.set(item.id, { ...item })
      }
    })

    setConfirmAgregarItems(Array.from(agrupados.values()))
    setConfirmAgregarMesa(panelMesa)
    setConfirmAgregarOpen(true)
  }

  const abrirConfirmacionCobro = () => {
    if (!panelMesa) {
      return
    }
    const mesaKey = getMesaKey(panelMesa)
    const pedidoIds = pedidosPorMesa[mesaKey] || []
    if (!pedidoIds.length) {
      showToast('No hay pedido asociado a esta mesa.', 'error')
      return
    }
    setConfirmCobroOpen(true)
  }

  const imprimirComprobante = ({ cajaId, mesaNumero, fecha, items, total, metodo }) => {
    const logoUrl = `${window.location.origin}/img/Logo.PNG`
    const fechaTexto = new Date(fecha).toLocaleString('es-CL')
    const rowsHtml = items
      .map((item) => {
        const subtotal =
          typeof item.subtotal === 'number' ? item.subtotal : item.cantidad * item.precio
        return `
          <tr>
            <td>${item.nombre}</td>
            <td style="text-align:center;">${item.cantidad}</td>
            <td style="text-align:right;">${formatMoney(subtotal)}</td>
          </tr>
        `
      })
      .join('')

    const html = `
      <html>
        <head>
          <title>Comprobante de venta</title>
          <style>
            @page { size: 80mm auto; margin: 0; }
            * { box-sizing: border-box; }
            body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 8px; color: #000; display: flex; justify-content: center; }
            .ticket { width: 80mm; margin: 0 auto; }
            .header { text-align: center; border-bottom: 1px dashed #000; padding-bottom: 6px; margin-bottom: 6px; }
            .logo { height: 36px; display: block; margin: 0 auto 4px; }
            .title { font-size: 14px; font-weight: 700; }
            .meta { font-size: 11px; line-height: 1.4; margin-top: 6px; }
            .meta div { display: flex; justify-content: space-between; }
            table { width: 100%; border-collapse: collapse; margin-top: 6px; font-size: 11px; }
            th, td { padding: 4px 0; border-bottom: 1px dotted #000; }
            th { text-align: left; font-weight: 700; }
            .total { margin-top: 6px; display: flex; justify-content: space-between; font-size: 12px; font-weight: 700; }
            .footer { margin-top: 8px; font-size: 10px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="ticket">
            <div class="header">
              <img class="logo" src="${logoUrl}" alt="Foodies" />
              <div class="title">Foodies</div>
              <div>Comprobante de venta</div>
            </div>
            <div class="meta">
              <div><span>Caja</span><span>#${cajaId}</span></div>
              <div><span>Fecha</span><span>${fechaTexto}</span></div>
              <div><span>Mesa</span><span>${mesaNumero}</span></div>
              <div><span>Pago</span><span>${metodo}</span></div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th style="text-align:center;">Cant</th>
                  <th style="text-align:right;">Subt</th>
                </tr>
              </thead>
              <tbody>
                ${rowsHtml}
              </tbody>
            </table>
            <div class="total"><span>Total</span><span>${formatMoney(total)}</span></div>
            <div class="footer">Gracias por su visita</div>
          </div>
          <script>
            window.onload = () => {
              window.print();
            };
          </script>
        </body>
      </html>
    `

    const win = window.open('', '_blank', 'width=800,height=900')
    if (win) {
      win.document.open()
      win.document.write(html)
      win.document.close()
    }
  }

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
      const filtradas = data.filter((sala) => sala.nombre !== 'Principal')
      setSalas(filtradas)
      if (!salaSeleccionada || salaSeleccionada === 'Principal') {
        const first = filtradas.length ? filtradas[0].nombre : getSalaOptions(filtradas)[0]
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

  const cargarPedidosActivosMesa = async (mesa) => {
    if (!mesa || String(mesa.id).startsWith('mock-')) {
      return { pedidoIds: [], items: [] }
    }

    try {
      const pedidosRes = await pedidosAPI.list({ mesa: mesa.id })
      const pedidosData = pedidosRes.data.results || pedidosRes.data
      const pedidosActivos = pedidosData.filter(
        (pedido) => !['CERRADO', 'CANCELADO'].includes(pedido.estado)
      )

      if (!pedidosActivos.length) {
        return { pedidoIds: [], items: [] }
      }

      const detallesRes = await Promise.all(
        pedidosActivos.map((pedido) => detallesAPI.list({ pedido: pedido.id }))
      )
      const detallesData = detallesRes.flatMap((res) => res.data.results || res.data)
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

      return { pedidoIds: pedidosActivos.map((pedido) => pedido.id), items }
    } catch (error) {
      console.error('Error cargando pedidos de la mesa:', error)
      return { pedidoIds: [], items: [] }
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
    const { pedidoIds, items } = await cargarPedidosActivosMesa(mesa)

    setPedidosPorMesa((prev) => ({
      ...prev,
      [mesaKey]: pedidoIds,
    }))

    setItemsMesa([...items, ...draftItems])
  }

  const agregarProducto = () => {
    let producto = productoSeleccionado
    if (!producto) {
      const normalized = busquedaProducto.trim().toLowerCase()
      if (normalized) {
        const match = productos.find(
          (item) => item.nombre?.toLowerCase() === normalized
        )
        if (match) {
          producto = match
        }
      }
    }

    if (!producto) {
      return
    }

    const precio = Number(producto.precio || 0)
    const draftExistente = itemsMesa.find(
      (item) => item.id === producto.id && item.origen === 'draft'
    )

    if (draftExistente) {
      const nuevaCantidad = draftExistente.cantidad + cantidad
      setItemsMesa((prev) =>
        prev.map((item) =>
          item.tempId === draftExistente.tempId
            ? { ...item, cantidad: nuevaCantidad, subtotal: nuevaCantidad * item.precio }
            : item
        )
      )

      if (panelMesa) {
        const mesaKey = getMesaKey(panelMesa)
        setItemsPorMesa((prevMap) => {
          const drafts = prevMap[mesaKey] || []
          const updated = drafts.map((draft) =>
            draft.tempId === draftExistente.tempId
              ? {
                  ...draft,
                  cantidad: nuevaCantidad,
                  subtotal: nuevaCantidad * draft.precio,
                }
              : draft
          )
          return {
            ...prevMap,
            [mesaKey]: updated,
          }
        })
      }

      setProductoSeleccionado(null)
      setBusquedaProducto('')
      setMostrarSugerencias(false)
      setCantidad(1)
      return
    }

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
      showToast('No se puede registrar pedido en mesas de prueba.', 'error')
      return
    }
    const mesaKey = getMesaKey(panelMesa)
    const draftItems = itemsPorMesa[mesaKey] || []
    if (!draftItems.length) {
      showToast('Agrega productos antes de registrar el pedido.', 'error')
      return
    }

    try {
      const resPedido = await pedidosAPI.create({ mesa: panelMesa.id })
      const pedidoId = resPedido.data.id
      await pedidosAPI.cambiarEstado(pedidoId, 'EN_PREPARACION')

      const draftsMap = new Map()
      draftItems.forEach((item) => {
        const current = draftsMap.get(item.id)
        if (current) {
          draftsMap.set(item.id, {
            ...current,
            cantidad: current.cantidad + item.cantidad,
          })
        } else {
          draftsMap.set(item.id, { ...item })
        }
      })

      await Promise.all(
        Array.from(draftsMap.values()).map((item) =>
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

      const { pedidoIds, items } = await cargarPedidosActivosMesa(panelMesa)
      setPedidosPorMesa((prev) => ({
        ...prev,
        [mesaKey]: pedidoIds,
      }))
      setItemsMesa(items)
      showToast('Productos agregados al pedido.', 'success')
      setConfirmAgregarOpen(false)
    } catch (error) {
      console.error('Error registrando pedido:', error)
      showToast('Error al agregar productos al pedido', 'error')
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
        showToast('No se pudo aumentar la cantidad', 'error')
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
        showToast('No se pudo eliminar el producto', 'error')
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

  const cobrarMesa = async (imprimir = false) => {
    if (cobrandoMesa) {
      return
    }
    if (!panelMesa) {
      return
    }
    if (String(panelMesa.id).startsWith('mock-')) {
      showToast('No se puede cobrar una mesa de prueba.', 'error')
      return
    }

    const mesaKey = getMesaKey(panelMesa)
    const pedidoIds = pedidosPorMesa[mesaKey] || []
    if (!pedidoIds.length) {
      showToast('No hay pedido asociado a esta mesa.', 'error')
      return
    }

    try {
      setCobrandoMesa(true)
      const itemsParaBoleta = itemsMesa.map((item) => ({
        nombre: item.nombre,
        cantidad: item.cantidad,
        precio: item.precio,
        subtotal: typeof item.subtotal === 'number' ? item.subtotal : item.cantidad * item.precio,
      }))
      const totalParaBoleta = itemsParaBoleta.reduce((acc, item) => acc + item.subtotal, 0)
      const cajasRes = await cajasAPI.list()
      const cajasData = cajasRes.data.results || cajasRes.data
      const cajaAbierta = cajasData.find((caja) => caja.abierta)
      if (!cajaAbierta) {
        showToast('No hay caja abierta.', 'error')
        return
      }

      if (metodoPago === 'MIXTOS') {
        await Promise.all(
          pedidoIds.map((pedidoId) =>
            ventasAPI.create({
              pedido: pedidoId,
              caja: cajaAbierta.id,
              metodo_pago: metodoPago,
            })
          )
        )
      } else {
        const [pedidoPrincipal, ...otrosPedidos] = pedidoIds
        if (otrosPedidos.length) {
          const detallesPrincipalRes = await detallesAPI.list({ pedido: pedidoPrincipal })
          const detallesPrincipal = detallesPrincipalRes.data.results || detallesPrincipalRes.data
          const detallesMap = new Map()
          detallesPrincipal.forEach((detalle) => {
            detallesMap.set(detalle.producto, {
              id: detalle.id,
              cantidad: detalle.cantidad,
              precio: Number(detalle.precio_unitario || 0),
            })
          })

          for (const pedidoId of otrosPedidos) {
            const detallesRes = await detallesAPI.list({ pedido: pedidoId })
            const detalles = detallesRes.data.results || detallesRes.data
            for (const detalle of detalles) {
              const existente = detallesMap.get(detalle.producto)
              if (existente) {
                const nuevaCantidad = existente.cantidad + detalle.cantidad
                await detallesAPI.update(existente.id, { cantidad: nuevaCantidad })
                detallesMap.set(detalle.producto, {
                  ...existente,
                  cantidad: nuevaCantidad,
                })
              } else {
                const creado = await detallesAPI.create({
                  pedido: pedidoPrincipal,
                  producto: detalle.producto,
                  cantidad: detalle.cantidad,
                  precio_unitario: detalle.precio_unitario,
                })
                detallesMap.set(detalle.producto, {
                  id: creado.data.id,
                  cantidad: detalle.cantidad,
                  precio: Number(detalle.precio_unitario || 0),
                })
              }
            }
          }

          await Promise.all(otrosPedidos.map((pedidoId) => pedidosAPI.remove(pedidoId)))
        }

        await ventasAPI.create({
          pedido: pedidoPrincipal,
          caja: cajaAbierta.id,
          metodo_pago: metodoPago,
        })
      }

      await mesasAPI.cambiarEstado(panelMesa.id, { estado: 'DISPONIBLE' })
        setMesas((prev) =>
          prev.map((mesa) =>
            mesa.id === panelMesa.id ? { ...mesa, estado: 'DISPONIBLE' } : mesa
          )
        )

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
      showToast('Mesa cobrada correctamente.', 'success')
      setConfirmCobroOpen(false)
      if (imprimir) {
        imprimirComprobante({
          cajaId: cajaAbierta.id,
          mesaNumero: panelMesa.numero,
          fecha: new Date(),
          items: itemsParaBoleta,
          total: totalParaBoleta,
          metodo: metodoPago,
        })
      }
    } catch (error) {
      console.error('Error cobrando mesa:', error)
      const mensaje =
        error?.response?.data?.error ||
        error?.response?.data?.detail ||
        error?.message ||
        'Error al cobrar la mesa'
      showToast(mensaje, 'error')
    } finally {
      setCobrandoMesa(false)
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
    const sala = salaSeleccionada || 'Sin sala'
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
      {toast && (
        <div className={`toast toast-${toast.type}`} role="status" aria-live="polite">
          <span className="toast-icon">{toast.type === 'error' ? '✕' : '✓'}</span>
          <span className="toast-message">{toast.message}</span>
          <button className="toast-close" onClick={() => setToast(null)} aria-label="Cerrar">
            ×
          </button>
        </div>
      )}
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
              mesas.filter(
                (mesa) =>
                  !salaSeleccionada ||
                  normalizarSala(mesa.sala_nombre) === normalizarSala(salaSeleccionada)
              )
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
                <button className="mesa-panel-submit" onClick={abrirConfirmacionAgregar}>
                  Agregar productos
                </button>
                <button className="mesa-panel-charge" onClick={abrirConfirmacionCobro}>
                  Cobrar mesa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {confirmAgregarOpen && confirmAgregarMesa && (
        <div className="mesa-modal-overlay" onClick={() => setConfirmAgregarOpen(false)}>
          <div className="mesa-modal" onClick={(e) => e.stopPropagation()}>
            <div className="mesa-modal-header">
              <h3>Confirmar productos</h3>
              <button
                className="mesa-modal-close"
                onClick={() => setConfirmAgregarOpen(false)}
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>
            <div className="mesa-modal-body">
              <p>
                Estás a punto de agregar estos productos a la mesa{' '}
                <strong>{confirmAgregarMesa.numero}</strong>
              </p>
              <ul className="mesa-confirm-list">
                {confirmAgregarItems.map((item) => (
                  <li key={`confirm-${item.id}`}>
                    {item.nombre} x{item.cantidad}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mesa-modal-actions">
              <button
                className="modal-btn modal-btn-secondary"
                onClick={() => setConfirmAgregarOpen(false)}
              >
                Volver
              </button>
              <button className="modal-btn modal-btn-primary" onClick={registrarPedidoMesa}>
                Agregar productos
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmCobroOpen && panelMesa && (
        <div className="mesa-modal-overlay" onClick={() => setConfirmCobroOpen(false)}>
          <div className="mesa-modal" onClick={(e) => e.stopPropagation()}>
            <div className="mesa-modal-header">
              <h3>Imprimir comprobante</h3>
              <button
                className="mesa-modal-close"
                onClick={() => setConfirmCobroOpen(false)}
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>
            <div className="mesa-modal-body">
              <p>
                ¿Deseas imprimir el comprobante de venta de la mesa{' '}
                <strong>{panelMesa.numero}</strong>?
              </p>
            </div>
            <div className="mesa-modal-actions">
              <button
                className="modal-btn modal-btn-secondary"
                onClick={() => setConfirmCobroOpen(false)}
              >
                Volver
              </button>
              <button
                className="modal-btn modal-btn-secondary"
                onClick={() => {
                  setConfirmCobroOpen(false)
                  cobrarMesa(false)
                }}
              >
                No imprimir
              </button>
              <button
                className="modal-btn modal-btn-primary"
                onClick={() => {
                  setConfirmCobroOpen(false)
                  cobrarMesa(true)
                }}
              >
                Imprimir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

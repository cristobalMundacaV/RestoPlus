import { useEffect, useState } from 'react'
import { biAPI } from '../../api/otros.api'
import { formatMoney, formatDate } from '../../utils/formatters'
import './bi.css'

export default function BI() {
  const [ventasDia, setVentasDia] = useState(null)
  const [ventasRango, setVentasRango] = useState([])
  const [masVendidos, setMasVendidos] = useState([])
  const [menosVendidos, setMenosVendidos] = useState([])
  const [stockCritico, setStockCritico] = useState([])
  const [metodosPago, setMetodosPago] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    setLoading(true)
    const today = new Date()
    const fecha = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`

    const start = new Date(today)
    start.setDate(today.getDate() - 7)
    const inicio = `${String(start.getDate()).padStart(2, '0')}-${String(start.getMonth() + 1).padStart(2, '0')}-${start.getFullYear()}`

    try {
      const [vd, vr, mv, mnv, sc, mp] = await Promise.allSettled([
        biAPI.ventasPorDia({ fecha }),
        biAPI.ventasPorRango({ inicio, fin: fecha }),
        biAPI.productosMasVendidos({ top: 5 }),
        biAPI.productosMenosVendidos({ top: 5 }),
        biAPI.ingredientesStockCritico(),
        biAPI.ventasPorMetodoPago(),
      ])

      setVentasDia(vd.status === 'fulfilled' ? vd.value.data : null)
      const vrData = vr.status === 'fulfilled' ? vr.value.data : []
      const mvData = mv.status === 'fulfilled' ? mv.value.data : []
      const mnvData = mnv.status === 'fulfilled' ? mnv.value.data : []
      const scData = sc.status === 'fulfilled' ? sc.value.data : []
      const mpData = mp.status === 'fulfilled' ? mp.value.data : []

      setVentasRango(Array.isArray(vrData) ? vrData : [])
      setMasVendidos(Array.isArray(mvData) ? mvData : [])
      setMenosVendidos(Array.isArray(mnvData) ? mnvData : [])
      setStockCritico(Array.isArray(scData) ? scData : [])
      setMetodosPago(Array.isArray(mpData) ? mpData : [])
    } catch (error) {
      console.error('Error cargando BI:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="loading">Cargando BI...</div>

  return (
    <div className="bi-container">
      <h1>Business Intelligence</h1>

      <section className="bi-section">
        <h2>Ventas del día</h2>
        <div className="bi-card">
          <span>Total: {ventasDia?.total ? formatMoney(ventasDia.total) : '$0'}</span>
        </div>
      </section>

      <section className="bi-section">
        <h2>Ventas últimos 7 días</h2>
        <div className="bi-list">
          {ventasRango.map((v, idx) => (
            <div key={idx} className="bi-row">
              <span>{v.fecha || '—'}</span>
              <span>{formatMoney(v.total || 0)}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="bi-section">
        <h2>Productos más vendidos</h2>
        <div className="bi-list">
          {masVendidos.map((p, idx) => (
            <div key={idx} className="bi-row">
              <span>{p.producto || p.nombre || 'Producto'}</span>
              <span>{p.total || p.cantidad || 0}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="bi-section">
        <h2>Productos menos vendidos</h2>
        <div className="bi-list">
          {menosVendidos.map((p, idx) => (
            <div key={idx} className="bi-row">
              <span>{p.producto || p.nombre || 'Producto'}</span>
              <span>{p.total || p.cantidad || 0}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="bi-section">
        <h2>Stock crítico</h2>
        <div className="bi-list">
          {stockCritico.map((i) => (
            <div key={i.id} className="bi-row">
              <span>{i.nombre}</span>
              <span>{i.stock_actual} / {i.stock_minimo}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="bi-section">
        <h2>Ventas por método de pago</h2>
        <div className="bi-list">
          {metodosPago.map((m, idx) => (
            <div key={idx} className="bi-row">
              <span>{m.metodo || m.metodo_pago || 'Método'}</span>
              <span>{formatMoney(m.total || 0)}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
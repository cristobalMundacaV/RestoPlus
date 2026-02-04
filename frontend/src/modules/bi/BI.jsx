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
  const [rentabilidad, setRentabilidad] = useState([])
  const [perdidas, setPerdidas] = useState([])
  const [tendencias, setTendencias] = useState([])
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
      const [vd, vr, mv, mnv, sc, mp, rp, pi, tv] = await Promise.allSettled([
        biAPI.ventasPorDia({ fecha }),
        biAPI.ventasPorRango({ inicio, fin: fecha }),
        biAPI.productosMasVendidos({ top: 5 }),
        biAPI.productosMenosVendidos({ top: 5 }),
        biAPI.ingredientesStockCritico(),
        biAPI.ventasPorMetodoPago(),
        biAPI.rentabilidadPorProducto({ inicio, fin: fecha }),
        biAPI.perdidasInventario({ inicio, fin: fecha }),
        biAPI.tendenciasVenta({ dias: 30 }),
      ])

      setVentasDia(vd.status === 'fulfilled' ? vd.value.data : null)
      const vrData = vr.status === 'fulfilled' ? vr.value.data : []
      const mvData = mv.status === 'fulfilled' ? mv.value.data : []
      const mnvData = mnv.status === 'fulfilled' ? mnv.value.data : []
      const scData = sc.status === 'fulfilled' ? sc.value.data : []
      const mpData = mp.status === 'fulfilled' ? mp.value.data : []
      const rpData = rp.status === 'fulfilled' ? rp.value.data : []
      const piData = pi.status === 'fulfilled' ? pi.value.data : []
      const tvData = tv.status === 'fulfilled' ? tv.value.data : []

      setVentasRango(Array.isArray(vrData) ? vrData : [])
      setMasVendidos(Array.isArray(mvData) ? mvData : [])
      setMenosVendidos(Array.isArray(mnvData) ? mnvData : [])
      setStockCritico(Array.isArray(scData) ? scData : [])
      setMetodosPago(Array.isArray(mpData) ? mpData : [])
      setRentabilidad(Array.isArray(rpData) ? rpData : [])
      setPerdidas(Array.isArray(piData) ? piData : [])
      setTendencias(Array.isArray(tvData) ? tvData : [])
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

      <div className="bi-sections-grid">
        <section className="bi-section">
          <div className="bi-card">
            <div className="bi-card-title">Ventas del día</div>
            <div className="bi-card-content">
              <div className="bi-row">
                <span>Total</span>
                <span>{ventasDia?.total ? formatMoney(ventasDia.total) : '$0'}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="bi-section">
          <div className="bi-card">
            <div className="bi-card-title">Rentabilidad por producto (últimos 7 días)</div>
            <div className="bi-card-content">
            {rentabilidad.length === 0 ? (
              <div className="bi-row">
                <span>Sin datos</span>
                <span>—</span>
              </div>
            ) : (
              rentabilidad.map((r, idx) => (
                <div key={idx} className="bi-row">
                  <span>{r.producto__nombre || 'Producto'}</span>
                  <span>{formatMoney(r.ingresos || 0)} | {Math.round(r.margen || 0)}%</span>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="bi-section">
        <div className="bi-card">
          <div className="bi-card-title">Ventas últimos 7 días</div>
          <div className="bi-card-content">
            {ventasRango.length === 0 ? (
              <div className="bi-row">
                <span>Sin datos</span>
                <span>—</span>
              </div>
            ) : (
              ventasRango.map((v, idx) => (
                <div key={idx} className="bi-row">
                  <span>{v.fecha ? formatDate(v.fecha) : '—'}</span>
                  <span>{formatMoney(v.total || 0)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="bi-section">
        <div className="bi-card">
          <div className="bi-card-title">Tendencias de venta (30 días)</div>
          <div className="bi-card-content">
            {tendencias.length === 0 ? (
              <div className="bi-row">
                <span>Sin datos</span>
                <span>—</span>
              </div>
            ) : (
              tendencias.map((t, idx) => (
                <div key={idx} className="bi-row">
                  <span>{formatDate(t.fecha)}</span>
                  <span>{formatMoney(t.total || 0)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="bi-section">
        <div className="bi-card">
          <div className="bi-card-title">Productos más vendidos</div>
          <div className="bi-card-content">
            {masVendidos.length === 0 ? (
              <div className="bi-row">
                <span>Sin datos</span>
                <span>—</span>
              </div>
            ) : (
              masVendidos.map((p, idx) => (
                <div key={idx} className="bi-row">
                  <span>{p.producto__nombre || p.producto || p.nombre || 'Producto'}</span>
                  <span>{p.total_vendido || p.total || p.cantidad || 0}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="bi-section">
        <div className="bi-card">
          <div className="bi-card-title">Productos menos vendidos</div>
          <div className="bi-card-content">
            {menosVendidos.length === 0 ? (
              <div className="bi-row">
                <span>Sin datos</span>
                <span>—</span>
              </div>
            ) : (
              menosVendidos.map((p, idx) => (
                <div key={idx} className="bi-row">
                  <span>{p.producto__nombre || p.producto || p.nombre || 'Producto'}</span>
                  <span>{p.total_vendido || p.total || p.cantidad || 0}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="bi-section">
        <div className="bi-card">
          <div className="bi-card-title">Stock crítico</div>
          <div className="bi-card-content">
            {stockCritico.map((i) => (
              <div key={i.id} className="bi-row">
                <span>{i.nombre}</span>
                <span>{i.stock_actual} / {i.stock_minimo}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bi-section">
        <div className="bi-card">
          <div className="bi-card-title">Pérdidas de inventario (últimos 7 días)</div>
          <div className="bi-card-content">
            {perdidas.length === 0 ? (
              <div className="bi-row">
                <span>Sin pérdidas</span>
                <span>—</span>
              </div>
            ) : (
              perdidas.map((p, idx) => (
                <div key={idx} className="bi-row">
                  <span>{p.ingrediente__nombre || 'Ingrediente'}</span>
                  <span>{p.cantidad_perdida || 0}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="bi-section">
        <div className="bi-card">
          <div className="bi-card-title">Ventas por método de pago</div>
          <div className="bi-card-content">
            {metodosPago.map((m, idx) => (
              <div key={idx} className="bi-row">
                <span>{m.metodo || m.metodo_pago || 'Método'}</span>
                <span>{formatMoney(m.total || 0)}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
      </div>
    </div>
  )
}
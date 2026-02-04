import { useEffect, useState } from 'react'
import { inventarioAPI } from '../../api/otros.api'
import './inventario.css'

const tipoBadgeClass = {
  Ingreso: 'badge-success',
  Egreso: 'badge-warning',
  Ajuste: 'badge-neutral',
}

export default function MovimientosInventario() {
  const [movimientos, setMovimientos] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    cargarMovimientos()
  }, [])

  const cargarMovimientos = async () => {
    setLoading(true)
    try {
      const res = await inventarioAPI.movimientos()
      setMovimientos(res.data.results || res.data)
    } catch (error) {
      console.error('Error cargando movimientos:', error)
    } finally {
      setLoading(false)
    }
  }

  const movimientosFiltrados = movimientos.filter((mov) => {
    const term = search.trim().toLowerCase()
    if (!term) return true
    return (
      mov.ingrediente_nombre?.toLowerCase().includes(term) ||
      mov.motivo?.toLowerCase().includes(term)
    )
  })

  if (loading) return <div className="loading">Cargando movimientos...</div>

  return (
    <div className="inventario-section">
      <div className="inventario-movimientos-header">
        <h2>Movimientos de Stock</h2>
        <input
          type="text"
          placeholder="Buscar por ingrediente o motivo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="movimientos-search"
        />
      </div>

      <div className="tabla movimientos-tabla">
        <div className="tabla-header movimientos-header">
          <span>Fecha</span>
          <span>Ingrediente</span>
          <span>Tipo</span>
          <span>Cantidad</span>
          <span>Motivo</span>
        </div>
        {movimientosFiltrados.map((mov) => (
          <div key={mov.id} className="tabla-row movimientos-row">
            <span>{new Date(mov.fecha_movimiento).toLocaleString('es-CL')}</span>
            <span>{mov.ingrediente_nombre}</span>
            <span>
              <span className={`mov-badge ${tipoBadgeClass[mov.tipo_movimiento_display] || ''}`}>
                {mov.tipo_movimiento_display}
              </span>
            </span>
            <span>{mov.cantidad}</span>
            <span>{mov.motivo || '-'}</span>
          </div>
        ))}
      </div>

      {!movimientosFiltrados.length && (
        <div className="empty-state">No hay movimientos registrados.</div>
      )}
    </div>
  )
}

import { useEffect, useState } from 'react'
import { inventarioAPI } from '../../api/otros.api'
import { formatMoney } from '../../utils/formatters'
import './inventario.css'

export default function Inventario() {
  const [ingredientes, setIngredientes] = useState([])
  const [movimientos, setMovimientos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    setLoading(true)
    try {
      const [ingRes, movRes] = await Promise.all([
        inventarioAPI.ingredientes(),
        inventarioAPI.movimientos(),
      ])
      setIngredientes(ingRes.data.results || ingRes.data)
      setMovimientos(movRes.data.results || movRes.data)
    } catch (error) {
      console.error('Error cargando inventario:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="loading">Cargando inventario...</div>

  return (
    <div className="inventario-container">
      <h1>Inventario</h1>

      <section className="inventario-section">
        <h2>Ingredientes</h2>
        <div className="tabla">
          <div className="tabla-header">
            <span>Nombre</span>
            <span>Stock</span>
            <span>Mínimo</span>
            <span>Unidad</span>
          </div>
          {ingredientes.map((ing) => (
            <div key={ing.id} className={`tabla-row ${ing.stock_actual <= ing.stock_minimo ? 'critico' : ''}`}>
              <span>{ing.nombre}</span>
              <span>{ing.stock_actual}</span>
              <span>{ing.stock_minimo}</span>
              <span>{ing.unidad_medida}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="inventario-section">
        <h2>Movimientos Recientes</h2>
        <div className="tabla">
          <div className="tabla-header">
            <span>Ingrediente</span>
            <span>Tipo</span>
            <span>Cantidad</span>
            <span>Motivo</span>
          </div>
          {movimientos.slice(0, 10).map((mov) => (
            <div key={mov.id} className="tabla-row">
              <span>{mov.ingrediente_nombre || mov.ingrediente}</span>
              <span>{mov.tipo_movimiento}</span>
              <span>{mov.cantidad}</span>
              <span>{mov.motivo}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

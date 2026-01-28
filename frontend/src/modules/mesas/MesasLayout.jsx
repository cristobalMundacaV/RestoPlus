import { useEffect, useState } from 'react'
import { mesasAPI } from '../../api/otros.api'
import './mesas.css'

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

export default function MesasLayout() {
  const [salas, setSalas] = useState([])
  const [mesas, setMesas] = useState([])
  const [salaSeleccionada, setSalaSeleccionada] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    cargarSalas()
  }, [])

  useEffect(() => {
    cargarMesas()
  }, [salaSeleccionada])

  const cargarSalas = async () => {
    try {
      const res = await mesasAPI.salas()
      const data = res.data.results || res.data
      setSalas(data)
      if (data.length && !salaSeleccionada) {
        setSalaSeleccionada(data[0].id)
      }
    } catch (error) {
      console.error('Error cargando salas:', error)
    }
  }

  const cargarMesas = async () => {
    setLoading(true)
    try {
      const params = salaSeleccionada ? { sala: salaSeleccionada } : undefined
      const res = await mesasAPI.mesas(params)
      setMesas(res.data.results || res.data)
    } catch (error) {
      console.error('Error cargando mesas:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mesas-container">
      <div className="mesas-header">
        <h1>Mesas</h1>
        <div className="salas-tabs">
          {salas.map((sala) => (
            <button
              key={sala.id}
              className={`tab ${String(salaSeleccionada) === String(sala.id) ? 'active' : ''}`}
              onClick={() => setSalaSeleccionada(sala.id)}
            >
              {sala.nombre}
            </button>
          ))}
          {!salas.length && <span className="no-salas">Sin salas</span>}
        </div>
      </div>

      {loading ? (
        <div className="loading">Cargando mesas...</div>
      ) : (
        <div className="mesas-grid">
          {mesas.map((mesa) => (
            <div key={mesa.id} className={`mesa-card ${estadoClase[mesa.estado] || ''}`}>
              <div className="mesa-numero">Mesa {mesa.numero}</div>
              <div className="mesa-info">
                <span>Capacidad: {mesa.capacidad}</span>
                <span className="mesa-estado">{estadoLabel[mesa.estado] || mesa.estado}</span>
              </div>
            </div>
          ))}
          {!mesas.length && <div className="empty-state">No hay mesas en esta sala</div>}
        </div>
      )}
    </div>
  )
}

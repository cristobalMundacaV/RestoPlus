import { useEffect, useState } from 'react'
import { restaurantesAPI, planesAPI } from '../../api/restaurantes.api'
import './restaurantes.css'

export default function Restaurantes() {
  const [restaurantes, setRestaurantes] = useState([])
  const [planes, setPlanes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    nombre: '',
    razon_social: '',
    rut: '',
    direccion: '',
    plan: '',
    activo: true,
  })

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    setLoading(true)
    try {
      const [resRest, resPlanes] = await Promise.all([
        restaurantesAPI.list(),
        planesAPI.list(),
      ])
      setRestaurantes(resRest.data.results || resRest.data)
      setPlanes(resPlanes.data.results || resPlanes.data)
    } catch (error) {
      console.error('Error cargando restaurantes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await restaurantesAPI.create(formData)
      setShowForm(false)
      setFormData({ nombre: '', razon_social: '', rut: '', direccion: '', plan: '', activo: true })
      cargarDatos()
    } catch (error) {
      alert(error.response?.data?.detail || 'Error al crear restaurante')
    }
  }

  const toggleActivo = async (restaurante) => {
    try {
      if (restaurante.activo) await restaurantesAPI.desactivar(restaurante.id)
      else await restaurantesAPI.activar(restaurante.id)
      cargarDatos()
    } catch (error) {
      alert('No se pudo cambiar el estado')
    }
  }

  if (loading) return <div className="loading">Cargando restaurantes...</div>

  return (
    <div className="restaurantes-container">
      <div className="restaurantes-header">
        <h1>Restaurantes</h1>
        <button className="btn-primary" onClick={() => setShowForm(true)}>+ Nuevo Restaurante</button>
      </div>

      <div className="restaurantes-grid">
        {restaurantes.map((r) => (
          <div key={r.id} className={`rest-card ${r.activo ? '' : 'inactivo'}`}>
            <div className="rest-title">{r.nombre}</div>
            <div className="rest-info">
              <span>Razón social: {r.razon_social}</span>
              <span>RUT: {r.rut}</span>
              <span>Dirección: {r.direccion}</span>
              <span>Plan: {r.plan_nombre || r.plan}</span>
              <span>Estado: {r.activo ? 'Activo' : 'Inactivo'}</span>
            </div>
            <button className="btn-secondary" onClick={() => toggleActivo(r)}>
              {r.activo ? 'Desactivar' : 'Activar'}
            </button>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Nuevo Restaurante</h2>
              <button className="btn-close" onClick={() => setShowForm(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit} className="rest-form">
              <input placeholder="Nombre" value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} required />
              <input placeholder="Razón social" value={formData.razon_social} onChange={(e) => setFormData({ ...formData, razon_social: e.target.value })} required />
              <input placeholder="RUT" value={formData.rut} onChange={(e) => setFormData({ ...formData, rut: e.target.value })} required />
              <input placeholder="Dirección" value={formData.direccion} onChange={(e) => setFormData({ ...formData, direccion: e.target.value })} />
              <select value={formData.plan} onChange={(e) => setFormData({ ...formData, plan: e.target.value })} required>
                <option value="">Seleccionar Plan</option>
                {planes.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
                <button type="submit" className="btn-primary">Crear</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

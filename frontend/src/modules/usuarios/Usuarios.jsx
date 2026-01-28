import { useEffect, useState } from 'react'
import { usuariosAPI } from '../../api/usuarios.api'
import './usuarios.css'

const roles = [
  { value: 'ADMIN', label: 'Admin' },
  { value: 'GERENTE', label: 'Gerente' },
  { value: 'MESERO', label: 'Mesero' },
  { value: 'CHEF', label: 'Chef' },
  { value: 'CONTADOR', label: 'Contador' },
]

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    rol: 'MESERO',
    password: '',
  })

  useEffect(() => {
    cargarUsuarios()
  }, [])

  const cargarUsuarios = async () => {
    setLoading(true)
    try {
      const res = await usuariosAPI.list()
      setUsuarios(res.data.results || res.data)
    } catch (error) {
      console.error('Error cargando usuarios:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await usuariosAPI.create(formData)
      setShowForm(false)
      setFormData({ username: '', email: '', first_name: '', last_name: '', rol: 'MESERO', password: '' })
      cargarUsuarios()
    } catch (error) {
      alert(error.response?.data?.detail || 'Error al crear usuario')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar usuario?')) return
    try {
      await usuariosAPI.delete(id)
      cargarUsuarios()
    } catch (error) {
      alert('Error al eliminar usuario')
    }
  }

  if (loading) return <div className="loading">Cargando usuarios...</div>

  return (
    <div className="usuarios-container">
      <div className="usuarios-header">
        <h1>Usuarios</h1>
        <button className="btn-primary" onClick={() => setShowForm(true)}>+ Nuevo Usuario</button>
      </div>

      <div className="usuarios-grid">
        {usuarios.map((u) => (
          <div key={u.id} className="usuario-card">
            <div className="usuario-title">{u.username}</div>
            <div className="usuario-info">
              <span>{u.first_name} {u.last_name}</span>
              <span>{u.email}</span>
              <span>Rol: {u.rol_display || u.rol}</span>
            </div>
            <button className="btn-delete" onClick={() => handleDelete(u.id)}>Eliminar</button>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Nuevo Usuario</h2>
              <button className="btn-close" onClick={() => setShowForm(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit} className="usuario-form">
              <input placeholder="Username" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} required />
              <input placeholder="Email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              <input placeholder="Nombre" value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} />
              <input placeholder="Apellido" value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} />
              <select value={formData.rol} onChange={(e) => setFormData({ ...formData, rol: e.target.value })}>
                {roles.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
              <input placeholder="Password" type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
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

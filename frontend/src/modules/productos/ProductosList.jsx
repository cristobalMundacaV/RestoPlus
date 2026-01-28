import { useState, useEffect } from 'react'
import { productosAPI, categoriasAPI } from '../../api/productos.api'
import ProductoForm from './ProductoForm'
import { formatMoney } from '../../utils/formatters'
import './productos.css'

export default function ProductosList() {
  const [productos, setProductos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingProducto, setEditingProducto] = useState(null)
  const [filters, setFilters] = useState({
    search: '',
    categoria: '',
    disponible: '',
    activo: '',
  })

  useEffect(() => {
    cargarDatos()
  }, [filters])

  const cargarDatos = async () => {
    setLoading(true)
    try {
      const [prodRes, catRes] = await Promise.all([
        productosAPI.list(filters),
        categoriasAPI.list({ activo: true }),
      ])
      setProductos(prodRes.data.results || prodRes.data)
      setCategorias(catRes.data.results || catRes.data)
    } catch (error) {
      console.error('Error cargando datos:', error)
      alert('Error al cargar productos')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingProducto(null)
    setShowForm(true)
  }

  const handleEdit = (producto) => {
    setEditingProducto(producto)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Desactivar este producto?')) return
    try {
      await productosAPI.desactivar(id)
      cargarDatos()
    } catch (error) {
      alert('Error al desactivar producto')
    }
  }

  const handleToggleFavorito = async (producto) => {
    try {
      await productosAPI.marcarFavorito(producto.id)
      cargarDatos()
    } catch (error) {
      alert('Error al marcar favorito')
    }
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingProducto(null)
    cargarDatos()
  }

  if (loading) return <div className="loading">Cargando productos...</div>

  return (
    <div className="productos-container">
      <div className="productos-header">
        <h1>Gestión de Productos</h1>
        <button onClick={handleCreate} className="btn-primary">
          + Nuevo Producto
        </button>
      </div>

      <div className="productos-filters">
        <input
          type="text"
          placeholder="Buscar por nombre..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          className="filter-input"
        />
        <select
          value={filters.categoria}
          onChange={(e) => setFilters({ ...filters, categoria: e.target.value })}
          className="filter-select"
        >
          <option value="">Todas las categorías</option>
          {categorias.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.nombre}
            </option>
          ))}
        </select>
        <select
          value={filters.disponible}
          onChange={(e) => setFilters({ ...filters, disponible: e.target.value })}
          className="filter-select"
        >
          <option value="">Disponibilidad</option>
          <option value="true">Disponibles</option>
          <option value="false">No disponibles</option>
        </select>
      </div>

      <div className="productos-grid">
        {productos.map((producto) => (
          <div key={producto.id} className="producto-card">
            <div className="producto-header">
              <h3>{producto.nombre}</h3>
              <button
                onClick={() => handleToggleFavorito(producto)}
                className={`btn-favorito ${producto.favorito ? 'active' : ''}`}
              >
                {producto.favorito ? '⭐' : '☆'}
              </button>
            </div>
            <p className="producto-descripcion">{producto.descripcion || 'Sin descripción'}</p>
            <div className="producto-info">
              <span className="producto-precio">{formatMoney(producto.precio)}</span>
              <span className={`badge ${producto.disponible ? 'success' : 'warning'}`}>
                {producto.disponible ? 'Disponible' : 'No disponible'}
              </span>
            </div>
            <div className="producto-actions">
              <button onClick={() => handleEdit(producto)} className="btn-edit">
                Editar
              </button>
              <button onClick={() => handleDelete(producto.id)} className="btn-delete">
                Desactivar
              </button>
            </div>
          </div>
        ))}
      </div>

      {productos.length === 0 && (
        <div className="empty-state">
          <p>No hay productos registrados</p>
          <button onClick={handleCreate} className="btn-primary">
            Crear primer producto
          </button>
        </div>
      )}

      {showForm && (
        <ProductoForm
          producto={editingProducto}
          categorias={categorias}
          onClose={handleFormClose}
        />
      )}
    </div>
  )
}

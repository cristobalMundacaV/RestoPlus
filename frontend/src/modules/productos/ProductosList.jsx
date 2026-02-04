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
  const [seedingCategorias, setSeedingCategorias] = useState(false)
  const categoriasDefault = [
    { value: 'COMIDA', label: 'Comida' },
    { value: 'BEBESTIBLE', label: 'Bebestible' },
    { value: 'BEBIDA_ALCOLICA', label: 'Bebida Alcohólica' },
    { value: 'INGREDIENTE', label: 'Ingrediente' },
    { value: 'INSUMO', label: 'Insumo' },
    { value: 'CONGELADOS', label: 'Congelados' },
  ]
  const [filters, setFilters] = useState({
    search: '',
    categoria: '',
    disponible: '',
    activo: '',
  })

  const dedupeCategorias = (data) => {
    const map = new Map()
    data.forEach((cat) => {
      if (!map.has(cat.nombre)) {
        map.set(cat.nombre, cat)
      }
    })
    return Array.from(map.values())
  }

  useEffect(() => {
    cargarDatos()
  }, [filters])

  const cargarDatos = async () => {
    setLoading(true)
    try {
      const params = Object.fromEntries(
        Object.entries(filters).filter(([, value]) => value !== '' && value !== null)
      )
      const [prodRes, catRes] = await Promise.all([
        productosAPI.list(params),
        categoriasAPI.list({ activo: true }),
      ])
      setProductos(prodRes.data.results || prodRes.data)
      const categoriasData = catRes.data.results || catRes.data
      setCategorias(dedupeCategorias(categoriasData))

      if (!seedingCategorias) {
        const existentes = new Set(categoriasData.map((cat) => cat.nombre))
        const faltantes = categoriasDefault.filter((cat) => !existentes.has(cat.value))
        if (faltantes.length) {
          setSeedingCategorias(true)
          await Promise.all(
            faltantes.map((cat, index) =>
              categoriasAPI.create({
                nombre: cat.value,
                orden: index,
                activo: true,
              })
            )
          )
          const recarga = await categoriasAPI.list({ activo: true })
          setCategorias(dedupeCategorias(recarga.data.results || recarga.data))
          setSeedingCategorias(false)
        }
      }
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

  const handleDelete = async (producto) => {
    if (!confirm('¿Eliminar este producto?')) return
    try {
      await productosAPI.remove(producto.id)
      cargarDatos()
    } catch (error) {
      const message =
        error.response?.data?.detail ||
        'El producto se tiene que desactivar porque está asociado a pedidos'
      alert(message)
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

  const handleToggleActivo = async (producto) => {
    try {
      if (producto.activo) {
        await productosAPI.desactivar(producto.id)
      } else {
        await productosAPI.activar(producto.id)
      }
      cargarDatos()
    } catch (error) {
      alert('Error al cambiar estado del producto')
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
          <div
            key={producto.id}
            className={`producto-card ${producto.activo ? '' : 'producto-inactivo'}`}
          >
            <div className="producto-header">
              <h3>{producto.nombre}</h3>
              <div className="producto-header-actions">
                <button
                  onClick={() => handleToggleFavorito(producto)}
                  className={`btn-favorito ${producto.favorito ? 'active' : ''}`}
                >
                  {producto.favorito ? '⭐' : '☆'}
                </button>
                <button
                  onClick={() => handleDelete(producto)}
                  className="btn-delete-icon"
                  aria-label="Eliminar producto"
                  title="Eliminar"
                >
                  🗑️
                </button>
              </div>
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
              <button
                onClick={() => handleToggleActivo(producto)}
                className={`btn-toggle ${producto.activo ? 'btn-toggle-off' : 'btn-toggle-on'}`}
              >
                {producto.activo ? 'Desactivar' : 'Activar'}
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

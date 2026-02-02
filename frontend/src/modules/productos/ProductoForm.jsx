import { useState, useEffect } from 'react'
import { productosAPI, categoriasAPI } from '../../api/productos.api'

export default function ProductoForm({ producto, categorias, onClose }) {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    categoria: '',
    disponible: true,
  })
  const [loading, setLoading] = useState(false)
  const [localCategorias, setLocalCategorias] = useState(categorias || [])
  const categoriasDefault = [
    { value: 'COMIDA', label: 'Comida' },
    { value: 'BEBESTIBLE', label: 'Bebestible' },
    { value: 'BEBIDA_ALCOLICA', label: 'Bebida Alcohólica' },
    { value: 'INGREDIENTE', label: 'Ingrediente' },
    { value: 'INSUMO', label: 'Insumo' },
  ]
  const categoriaLabelByValue = categoriasDefault.reduce((acc, item) => {
    acc[item.value] = item.label
    return acc
  }, {})
  const displayCategoria = (nombre) => categoriaLabelByValue[nombre] || nombre

  useEffect(() => {
    if (producto) {
      setFormData({
        nombre: producto.nombre,
        descripcion: producto.descripcion || '',
        precio: producto.precio,
        categoria: producto.categoria,
        disponible: producto.disponible,
      })
    }
  }, [producto])

  useEffect(() => {
    setLocalCategorias(categorias || [])
  }, [categorias])

  useEffect(() => {
    const seedCategoriasSiVacio = async () => {
      try {
        const res = await categoriasAPI.list({ activo: true })
        const data = res.data.results || res.data
        if (!data.length) {
          await Promise.all(
            categoriasDefault.map((nombre, index) =>
              categoriasAPI.create({
                nombre,
                orden: index,
                activo: true,
              })
            )
          )
          const recarga = await categoriasAPI.list({ activo: true })
          setLocalCategorias(recarga.data.results || recarga.data)
        } else {
          setLocalCategorias(data)
        }
      } catch (error) {
        console.error('Error cargando categorías:', error)
      }
    }

    if (!localCategorias.length) {
      seedCategoriasSiVacio()
    }
  }, [localCategorias.length])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      let categoriaFinal = formData.categoria
      if (String(categoriaFinal).startsWith('default:')) {
        const nombre = String(categoriaFinal).replace('default:', '')
        const creada = await categoriasAPI.create({
          nombre,
          orden: 0,
          activo: true,
        })
        categoriaFinal = creada.data.id
      }

      if (producto) {
        await productosAPI.update(producto.id, { ...formData, categoria: categoriaFinal })
      } else {
        await productosAPI.create({ ...formData, categoria: categoriaFinal })
      }
      onClose()
    } catch (error) {
      console.error('Error guardando producto:', error)
      alert(error.response?.data?.message || 'Error al guardar producto')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{producto ? 'Editar Producto' : 'Nuevo Producto'}</h2>
          <button onClick={onClose} className="btn-close">×</button>
        </div>

        <form onSubmit={handleSubmit} className="producto-form">
          <div className="form-row">
            <div className="form-group">
              <label>Nombre *</label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Precio *</label>
              <input
                type="number"
                value={formData.precio}
                onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                required
                min="0"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Descripción</label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              rows="3"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Categoría *</label>
              <select
                value={formData.categoria}
                onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                required
              >
                <option value="">Seleccionar...</option>
                {localCategorias.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {displayCategoria(cat.nombre)}
                  </option>
                ))}
                {localCategorias.length === 0 &&
                  categoriasDefault.map((cat) => (
                    <option key={cat.value} value={`default:${cat.value}`}>
                      {cat.label}
                    </option>
                  ))}
              </select>
            </div>
            <div className="form-group-checkbox form-group-checkbox-inline">
              <label>
                <input
                  type="checkbox"
                  checked={formData.disponible}
                  onChange={(e) => setFormData({ ...formData, disponible: e.target.checked })}
                />
                Disponible
              </label>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

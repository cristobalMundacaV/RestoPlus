import { useState, useEffect } from 'react'
import { productosAPI, categoriasAPI } from '../../api/productos.api'
import { inventarioAPI } from '../../api/otros.api'

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
  const [ingredientes, setIngredientes] = useState([])
  const [recetaItems, setRecetaItems] = useState([])
  const [recetasOriginalIds, setRecetasOriginalIds] = useState([])
  const [ingredienteSeleccionado, setIngredienteSeleccionado] = useState('')
  const [cantidadIngrediente, setCantidadIngrediente] = useState(1)
  const categoriasDefault = [
    { value: 'COMIDA', label: 'Comida' },
    { value: 'BEBESTIBLE', label: 'Bebestible' },
    { value: 'BEBIDA_ALCOLICA', label: 'Bebida Alcohólica' },
    { value: 'INGREDIENTE', label: 'Ingrediente' },
    { value: 'INSUMO', label: 'Insumo' },
    { value: 'CONGELADOS', label: 'Congelados' },
  ]
  const categoriaLabelByValue = categoriasDefault.reduce((acc, item) => {
    acc[item.value] = item.label
    return acc
  }, {})
  const displayCategoria = (nombre) => categoriaLabelByValue[nombre] || nombre
  const selectedCategoria = localCategorias.find(
    (cat) => String(cat.id) === String(formData.categoria)
  )
  const isCategoriaComida =
    selectedCategoria?.nombre === 'COMIDA' ||
    String(formData.categoria) === 'default:COMIDA' ||
    producto?.categoria_nombre === 'COMIDA'
  const categoriasExistentes = new Set(localCategorias.map((cat) => cat.nombre))
  const categoriasFaltantes = categoriasDefault.filter(
    (cat) => !categoriasExistentes.has(cat.value)
  )
  const ingredientesMap = new Map(ingredientes.map((ing) => [String(ing.id), ing]))
  const getIngredienteInfo = (id) => ingredientesMap.get(String(id))

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
    const cargarIngredientesYRecetas = async () => {
      try {
        const [ingredientesRes, recetasRes] = await Promise.all([
          inventarioAPI.ingredientes({ activo: true }),
          producto ? inventarioAPI.recetas({ producto: producto.id }) : Promise.resolve({ data: [] }),
        ])
        const ingredientesData = ingredientesRes.data.results || ingredientesRes.data
        setIngredientes(ingredientesData)

        if (producto) {
          let recetasData = recetasRes.data.results || recetasRes.data
          if (!recetasData.length) {
            const fallbackRes = await inventarioAPI.recetas()
            const fallbackData = fallbackRes.data.results || fallbackRes.data
            recetasData = fallbackData.filter(
              (receta) => String(receta.producto) === String(producto.id)
            )
            if (!recetasData.length) {
              recetasData = fallbackData.filter(
                (receta) => receta.producto_nombre === producto.nombre
              )
            }
          }
          setRecetaItems(
            recetasData.map((receta) => ({
              id: receta.id,
              tempId: `receta-${receta.id}`,
              ingrediente: receta.ingrediente,
              ingrediente_nombre: receta.ingrediente_nombre,
              ingrediente_unidad: receta.ingrediente_unidad,
              cantidad: receta.cantidad,
            }))
          )
          setRecetasOriginalIds(recetasData.map((receta) => receta.id))
        } else {
          setRecetaItems([])
          setRecetasOriginalIds([])
        }
      } catch (error) {
        console.error('Error cargando ingredientes/recetas:', error)
      }
    }

    cargarIngredientesYRecetas()
  }, [producto])

  useEffect(() => {
    setLocalCategorias(dedupeCategorias(categorias || []))
  }, [categorias])

  useEffect(() => {
    const seedCategoriasSiVacio = async () => {
      try {
        const res = await categoriasAPI.list({ activo: true })
        const data = dedupeCategorias(res.data.results || res.data)
        if (!data.length) {
          await Promise.all(
            categoriasDefault.map((cat, index) =>
              categoriasAPI.create({
                nombre: cat.value,
                orden: index,
                activo: true,
              })
            )
          )
          const recarga = await categoriasAPI.list({ activo: true })
          setLocalCategorias(dedupeCategorias(recarga.data.results || recarga.data))
        } else {
          const existentes = new Set(data.map((cat) => cat.nombre))
          const faltantes = categoriasDefault.filter((cat) => !existentes.has(cat.value))
          if (faltantes.length) {
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
            setLocalCategorias(dedupeCategorias(recarga.data.results || recarga.data))
          } else {
            setLocalCategorias(data)
          }
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

      let productoId = producto?.id
      if (producto) {
        await productosAPI.update(producto.id, { ...formData, categoria: categoriaFinal })
      } else {
        const creado = await productosAPI.create({ ...formData, categoria: categoriaFinal })
        productoId = creado.data.id
      }

      if (productoId) {
        const idsActuales = recetaItems.filter((item) => item.id).map((item) => item.id)
        const idsEliminar = recetasOriginalIds.filter((id) => !idsActuales.includes(id))

        const recetasAgrupadas = new Map()
        recetaItems.forEach((item) => {
          const key = String(item.ingrediente)
          if (!key || key === 'undefined' || key === 'null') {
            return
          }
          const current = recetasAgrupadas.get(key)
          if (current) {
            recetasAgrupadas.set(key, {
              ...current,
              cantidad: current.cantidad + item.cantidad,
            })
          } else {
            recetasAgrupadas.set(key, { ...item })
          }
        })

        await Promise.all([
          ...idsEliminar.map((id) => inventarioAPI.eliminarReceta(id)),
          ...Array.from(recetasAgrupadas.values()).map((item) => {
            if (item.id) {
              return inventarioAPI.actualizarReceta(item.id, {
                producto: productoId,
                ingrediente: item.ingrediente,
                cantidad: item.cantidad,
              })
            }
            return inventarioAPI.crearReceta({
              producto: productoId,
              ingrediente: item.ingrediente,
              cantidad: item.cantidad,
            })
          }),
        ])
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
                {categoriasFaltantes.map((cat) => (
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

          {isCategoriaComida && (
            <div className="form-group">
              <label>Receta / Ingredientes</label>
              <div className="form-row">
                <div className="form-group">
                  <select
                    value={ingredienteSeleccionado}
                    onChange={(e) => setIngredienteSeleccionado(e.target.value)}
                  >
                    <option value="">Seleccionar ingrediente...</option>
                    {ingredientes.map((ing) => (
                      <option key={ing.id} value={ing.id}>
                        {ing.nombre} ({ing.unidad_medida})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={cantidadIngrediente}
                    onChange={(e) => setCantidadIngrediente(Number(e.target.value))}
                  />
                </div>
                <div className="form-group">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => {
                      if (!ingredienteSeleccionado || !cantidadIngrediente) {
                        return
                      }
                      const ingredienteId = String(ingredienteSeleccionado)
                      const ingredienteInfo = getIngredienteInfo(ingredienteId)
                      setRecetaItems((prev) => {
                      const existente = prev.find((item) => item.ingrediente === ingredienteId)
                        if (existente) {
                          return prev.map((item) =>
                            item.ingrediente === ingredienteId
                              ? { ...item, cantidad: item.cantidad + cantidadIngrediente }
                              : item
                          )
                        }
                        return [
                          ...prev,
                          {
                          tempId: `temp-${Date.now()}-${Math.random().toString(16).slice(2)}`,
                            ingrediente: ingredienteId,
                            ingrediente_nombre: ingredienteInfo?.nombre || '',
                            ingrediente_unidad: ingredienteInfo?.unidad_medida || '',
                            cantidad: cantidadIngrediente,
                          },
                        ]
                      })
                      setIngredienteSeleccionado('')
                      setCantidadIngrediente(1)
                    }}
                  >
                    Agregar ingrediente
                  </button>
                </div>
              </div>
              <div className="form-group">
                <strong>Ingredientes Agregados</strong>
              </div>
              {recetaItems.length > 0 && (
                <div className="items-list">
                  {recetaItems.map((item) => {
                    const ingredienteId = String(item.ingrediente)
                    const info = getIngredienteInfo(ingredienteId)
                    const nombre = item.ingrediente_nombre || info?.nombre || 'Ingrediente'
                    const unidad = item.ingrediente_unidad || info?.unidad_medida || ''
                    return (
                      <div key={item.tempId || `item-${item.id}-${item.ingrediente}`} className="item-row">
                        <span>{nombre}</span>
                        <span>
                          {item.cantidad} {unidad}
                        </span>
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={() =>
                            setRecetaItems((prev) => {
                              const info = getIngredienteInfo(ingredienteId)
                              return [
                                ...prev,
                                {
                                  tempId: `temp-${Date.now()}-${Math.random().toString(16).slice(2)}`,
                                  ingrediente: ingredienteId,
                                  ingrediente_nombre: info?.nombre || item.ingrediente_nombre || '',
                                  ingrediente_unidad: info?.unidad_medida || item.ingrediente_unidad || '',
                                  cantidad: item.cantidad,
                                },
                              ]
                            })
                          }
                        >
                          +1
                        </button>
                        <button
                          type="button"
                          className="btn-delete"
                          onClick={() =>
                            setRecetaItems((prev) =>
                              prev.filter((receta) => receta.tempId !== item.tempId)
                            )
                          }
                        >
                          Quitar
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

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

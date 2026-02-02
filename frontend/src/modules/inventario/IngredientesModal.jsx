import { useState, useEffect } from 'react'
import './modal.css'

export default function IngredientesModal({ 
  isOpen, 
  onClose, 
  onSave, 
  ingrediente = null,
  loading = false 
}) {
  const [formData, setFormData] = useState({
    nombre: '',
    unidad_medida: '',
    tipo_insumo: 'GENERAL',
    stock_actual: 0,
    stock_minimo: 0,
    es_critico: false,
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (ingrediente) {
      setFormData(ingrediente)
    } else {
      setFormData({
        nombre: '',
        unidad_medida: '',
        tipo_insumo: 'GENERAL',
        stock_actual: 0,
        stock_minimo: 0,
        es_critico: false,
      })
    }
    setErrors({})
  }, [ingrediente, isOpen])

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido'
    }
    if (!formData.unidad_medida.trim()) {
      newErrors.unidad_medida = 'La unidad de medida es requerida'
    }
    if (parseFloat(formData.stock_actual) < 0) {
      newErrors.stock_actual = 'El stock no puede ser negativo'
    }
    if (parseFloat(formData.stock_minimo) < 0) {
      newErrors.stock_minimo = 'El stock mínimo no puede ser negativo'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validateForm()) {
      onSave({
        ...formData,
        es_critico: formData.tipo_insumo === 'CRITICO',
      })
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{ingrediente ? 'Editar Ingrediente' : 'Nuevo Ingrediente'}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="nombre">Nombre</label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              className={errors.nombre ? 'input-error' : ''}
            />
            {errors.nombre && <span className="error-message">{errors.nombre}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="unidad_medida">Unidad de Medida</label>
            <input
              type="text"
              id="unidad_medida"
              name="unidad_medida"
              value={formData.unidad_medida}
              onChange={handleChange}
              placeholder="Ej: kg, l, unidades"
              className={errors.unidad_medida ? 'input-error' : ''}
            />
            {errors.unidad_medida && <span className="error-message">{errors.unidad_medida}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="tipo_insumo">Tipo de Insumo</label>
            <select
              id="tipo_insumo"
              name="tipo_insumo"
              value={formData.tipo_insumo}
              onChange={handleChange}
            >
              <option value="GENERAL">General</option>
              <option value="CRITICO">Crítico</option>
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="stock_actual">Stock Actual</label>
              <input
                type="number"
                id="stock_actual"
                name="stock_actual"
                value={formData.stock_actual}
                onChange={handleChange}
                step="0.01"
                className={errors.stock_actual ? 'input-error' : ''}
              />
              {errors.stock_actual && <span className="error-message">{errors.stock_actual}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="stock_minimo">Stock Mínimo</label>
              <input
                type="number"
                id="stock_minimo"
                name="stock_minimo"
                value={formData.stock_minimo}
                onChange={handleChange}
                step="0.01"
                className={errors.stock_minimo ? 'input-error' : ''}
              />
              {errors.stock_minimo && <span className="error-message">{errors.stock_minimo}</span>}
            </div>
          </div>

          <div className="modal-footer">
            <button 
              type="button" 
              className="btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

import { useState } from 'react'
import './ingredientes.css'

export default function IngredientesTable({ 
  ingredientes, 
  onEdit, 
  onDelete,
  onAjustarStock,
  loading 
}) {
  const [expandedId, setExpandedId] = useState(null)
  const [nuevoStock, setNuevoStock] = useState({})

  const handleAjustarStock = async (id) => {
    const stock = nuevoStock[id]
    if (stock === undefined || stock === '') return
    
    await onAjustarStock(id, parseFloat(stock))
    setNuevoStock(prev => {
      const newState = { ...prev }
      delete newState[id]
      return newState
    })
    setExpandedId(null)
  }

  const handleStockChange = (id, value) => {
    setNuevoStock(prev => ({
      ...prev,
      [id]: value
    }))
  }

  if (loading) return <div className="loading">Cargando ingredientes...</div>

  return (
    <div className="ingredientes-table">
      <div className="tabla-header">
        <span className="col-nombre">Nombre</span>
        <span className="col-stock">Stock</span>
        <span className="col-minimo">Mínimo</span>
        <span className="col-unidad">Unidad</span>
        <span className="col-critico">Crítico</span>
        <span className="col-acciones">Acciones</span>
      </div>

      {ingredientes.length === 0 ? (
        <div className="tabla-empty">No hay ingredientes registrados</div>
      ) : (
        ingredientes.map((ing) => (
          <div key={ing.id}>
            <div 
              className={`tabla-row ${ing.es_critico ? 'critico' : ''} ${ing.stock_actual <= ing.stock_minimo ? 'bajo-stock' : ''}`}
            >
              <span className="col-nombre">{ing.nombre}</span>
              <span className="col-stock">{ing.stock_actual}</span>
              <span className="col-minimo">{ing.stock_minimo}</span>
              <span className="col-unidad">{ing.unidad_medida}</span>
              <span className="col-critico">
                {ing.es_critico ? '⚠️ Crítico' : 'Normal'}
              </span>
              <span className="col-acciones">
                <button 
                  className="btn-edit"
                  onClick={() => onEdit(ing)}
                  title="Editar"
                >
                  ✏️
                </button>
                <button 
                  className="btn-stock"
                  onClick={() => setExpandedId(expandedId === ing.id ? null : ing.id)}
                  title="Ajustar stock"
                >
                  📦
                </button>
                <button 
                  className="btn-delete"
                  onClick={() => onDelete(ing.id)}
                  title="Eliminar"
                >
                  🗑️
                </button>
              </span>
            </div>

            {expandedId === ing.id && (
              <div className="tabla-row-expanded">
                <div className="ajustar-stock-form">
                  <label>Nuevo Stock:</label>
                  <input
                    type="number"
                    step="0.01"
                    value={nuevoStock[ing.id] ?? ing.stock_actual}
                    onChange={(e) => handleStockChange(ing.id, e.target.value)}
                    placeholder="Ingrese nuevo stock"
                  />
                  <button 
                    className="btn-primary"
                    onClick={() => handleAjustarStock(ing.id)}
                  >
                    Guardar
                  </button>
                  <button 
                    className="btn-secondary"
                    onClick={() => setExpandedId(null)}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  )
}

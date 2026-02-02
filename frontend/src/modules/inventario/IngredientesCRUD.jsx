import { useEffect, useState } from 'react'
import { inventarioAPI } from '../../api/otros.api'
import IngredientesTable from './IngredientesTable'
import IngredientesModal from './IngredientesModal'
import './ingredientes.css'

export default function IngredientesCRUD() {
  const [ingredientes, setIngredientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedIngrediente, setSelectedIngrediente] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCritico, setFilterCritico] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    cargarIngredientes()
  }, [])

  useEffect(() => {
    if (!message) return
    const timer = setTimeout(() => setMessage(null), 5000)
    return () => clearTimeout(timer)
  }, [message])

  const cargarIngredientes = async () => {
    setLoading(true)
    try {
      const response = await inventarioAPI.ingredientes()
      setIngredientes(response.data.results || response.data)
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al cargar ingredientes' })
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleNuevo = () => {
    setSelectedIngrediente(null)
    setModalOpen(true)
  }

  const handleEditar = (ingrediente) => {
    setSelectedIngrediente(ingrediente)
    setModalOpen(true)
  }

  const handleGuardar = async (formData) => {
    setSaving(true)
    try {
      if (selectedIngrediente) {
        await inventarioAPI.actualizarIngrediente(selectedIngrediente.id, formData)
        setMessage({ type: 'success', text: 'Ingrediente actualizado' })
      } else {
        await inventarioAPI.crearIngrediente(formData)
        setMessage({ type: 'success', text: 'Ingrediente creado' })
      }
      setModalOpen(false)
      cargarIngredientes()
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al guardar' })
      console.error('Error:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleEliminar = async (id) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este ingrediente?')) return

    try {
      await inventarioAPI.eliminarIngrediente(id)
      setMessage({ type: 'success', text: 'Ingrediente eliminado' })
      cargarIngredientes()
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al eliminar' })
      console.error('Error:', error)
    }
  }

  const handleAjustarStock = async (id, nuevoStock) => {
    try {
      await inventarioAPI.ajustarStock(id, { nuevo_stock: nuevoStock })
      setMessage({ type: 'success', text: 'Stock actualizado' })
      cargarIngredientes()
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al actualizar stock' })
      console.error('Error:', error)
    }
  }

  const ingredientesFiltrados = ingredientes.filter(ing => {
    const matchSearch = ing.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       ing.unidad_medida.toLowerCase().includes(searchTerm.toLowerCase())
    const matchCritico = !filterCritico || ing.es_critico
    return matchSearch && matchCritico
  })

  return (
    <div className="ingredientes-crud">
      <div className="crud-header">
        <h1>Gestionar Ingredientes</h1>
        <button className="btn-primary" onClick={handleNuevo}>
          + Nuevo Ingrediente
        </button>
      </div>

      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
          <button onClick={() => setMessage(null)}>✕</button>
        </div>
      )}

      <div className="filters">
        <input
          type="text"
          placeholder="Buscar por nombre o unidad..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <label className="filter-checkbox">
          <input
            type="checkbox"
            checked={filterCritico}
            onChange={(e) => setFilterCritico(e.target.checked)}
          />
          Solo Críticos
        </label>
      </div>

      <IngredientesTable
        ingredientes={ingredientesFiltrados}
        onEdit={handleEditar}
        onDelete={handleEliminar}
        onAjustarStock={handleAjustarStock}
        loading={loading}
      />

      <IngredientesModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleGuardar}
        ingrediente={selectedIngrediente}
        loading={saving}
      />
    </div>
  )
}

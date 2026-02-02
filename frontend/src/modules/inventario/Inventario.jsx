import { useState } from 'react'
import IngredientesCRUD from './IngredientesCRUD'
import './inventario.css'

export default function Inventario() {
  const [tab, setTab] = useState('ingredientes')

  return (
    <div className="inventario-container">
      <div className="inventario-tabs">
        <button 
          className={`tab-button ${tab === 'ingredientes' ? 'active' : ''}`}
          onClick={() => setTab('ingredientes')}
        >
          📦 Ingredientes
        </button>
        <button 
          className={`tab-button ${tab === 'movimientos' ? 'active' : ''}`}
          onClick={() => setTab('movimientos')}
        >
          📋 Movimientos
        </button>
      </div>

      {tab === 'ingredientes' && <IngredientesCRUD />}
    </div>
  )
}


import { useEffect, useState } from 'react'
import { cajasAPI } from '../../api/ventas.api'
import { formatMoney, formatDateTime } from '../../utils/formatters'
import './cajas.css'

export default function Cajas() {
  const [cajas, setCajas] = useState([])
  const [loading, setLoading] = useState(true)
  const [saldoInicial, setSaldoInicial] = useState('')
  const [aperturando, setAperturando] = useState(false)

  useEffect(() => {
    cargarCajas()
  }, [])

  const cargarCajas = async () => {
    setLoading(true)
    try {
      const res = await cajasAPI.list()
      setCajas(res.data.results || res.data)
    } catch (error) {
      console.error('Error cargando cajas:', error)
    } finally {
      setLoading(false)
    }
  }

  const abrirCaja = async () => {
    setAperturando(true)
    try {
      await cajasAPI.create({ saldo_inicial: saldoInicial || 0 })
      setSaldoInicial('')
      cargarCajas()
    } catch (error) {
      alert(error.response?.data?.error || 'No se pudo abrir caja')
    } finally {
      setAperturando(false)
    }
  }

  const cerrarCaja = async (cajaId) => {
    if (!confirm('¿Cerrar esta caja?')) return
    try {
      await cajasAPI.cerrar(cajaId, {})
      cargarCajas()
    } catch (error) {
      alert(error.response?.data?.error || 'No se pudo cerrar caja')
    }
  }

  if (loading) return <div className="loading">Cargando cajas...</div>

  return (
    <div className="cajas-container">
      <div className="cajas-header">
        <h1>Cajas</h1>
        <div className="apertura">
          <input
            type="number"
            placeholder="Saldo inicial"
            value={saldoInicial}
            onChange={(e) => setSaldoInicial(e.target.value)}
          />
          <button className="btn-primary" onClick={abrirCaja} disabled={aperturando}>
            {aperturando ? 'Abriendo...' : 'Abrir Caja'}
          </button>
        </div>
      </div>

      <div className="cajas-grid">
        {cajas.map((caja) => (
          <div key={caja.id} className={`caja-card ${caja.abierta ? 'abierta' : 'cerrada'}`}>
            <div className="caja-title">Caja #{caja.id}</div>
            <div className="caja-info">
              <span>Estado: {caja.abierta ? 'Abierta' : 'Cerrada'}</span>
              <span>Saldo Inicial: {formatMoney(caja.saldo_inicial)}</span>
              <span>Total Ingresos: {formatMoney(caja.total_ingresos)}</span>
              <span>Total Egresos: {formatMoney(caja.total_egresos)}</span>
              <span>Saldo Actual: {formatMoney(caja.saldo_actual)}</span>
              <span>Apertura: {formatDateTime(caja.fecha_apertura)}</span>
              {caja.fecha_cierre && <span>Cierre: {formatDateTime(caja.fecha_cierre)}</span>}
            </div>
            {caja.abierta && (
              <button className="btn-delete" onClick={() => cerrarCaja(caja.id)}>
                Cerrar Caja
              </button>
            )}
          </div>
        ))}
      </div>

      {!cajas.length && (
        <div className="empty-state">
          <p>No hay cajas registradas</p>
        </div>
      )}
    </div>
  )
}

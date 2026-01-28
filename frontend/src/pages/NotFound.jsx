import { useNavigate } from 'react-router-dom'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div style={{ textAlign: 'center', padding: '3rem' }}>
      <h1>404 - Página no encontrada</h1>
      <p>La página que buscas no existe.</p>
      <button onClick={() => navigate('/')}>Volver al inicio</button>
    </div>
  )
}

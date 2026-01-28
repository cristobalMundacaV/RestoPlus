import { Navigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'

export default function RequireAuth({ children }) {
  const { isAuthenticated } = useAuthStore()
  const hasToken = Boolean(localStorage.getItem('access_token'))

  if (!isAuthenticated && !hasToken) {
    return <Navigate to="/" replace />
  }

  return children
}

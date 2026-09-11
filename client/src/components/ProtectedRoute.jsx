import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Wraps routes that require a logged-in user. Hiding UI is not
// authorization - the backend independently rejects protected endpoints.
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return <div className="page-loading">Checking authentication…</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute
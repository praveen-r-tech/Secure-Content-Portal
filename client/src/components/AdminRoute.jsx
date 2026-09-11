import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Wraps routes that require the admin role. Hiding UI is not
// authorization - the backend independently enforces admin-only APIs.
function AdminRoute({ children }) {
  const { isAuthenticated, role, loading } = useAuth()

  if (loading) {
    return <div className="page-loading">Loading…</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (role !== 'admin') {
    return <Navigate to="/" replace />
  }

  return children
}

export default AdminRoute
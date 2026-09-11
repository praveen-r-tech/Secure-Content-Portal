import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Login() {
  const { isAuthenticated, loading, login } = useAuth()

  if (loading) {
    return <div className="page-loading">Loading…</div>
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Secure Content Portal</h1>
        <p>Sign in with your Google account to view content.</p>
        <button type="button" className="btn-primary" onClick={login}>
          Sign in with Google
        </button>
      </div>
    </div>
  )
}

export default Login
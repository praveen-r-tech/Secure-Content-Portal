import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Navbar() {
  const { user, role, isAuthenticated, logout } = useAuth()

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        Secure Content Portal
      </Link>
      <div className="navbar-links">
        <Link to="/">Home</Link>
        {isAuthenticated && role === 'admin' && (
          <Link to="/admin">Admin</Link>
        )}
        {isAuthenticated && (
          <>
            <span className="navbar-user">
              {user ? `${user.name || user.email} (${user.role})` : '…'}
            </span>
            <button type="button" className="btn-link" onClick={logout}>
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  )
}

export default Navbar
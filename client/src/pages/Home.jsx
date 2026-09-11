import { useAuth } from '../context/AuthContext'

function Home() {
  const { user, role } = useAuth()

  const displayName = user?.name || user?.email || 'there'

  return (
    <div className="home-card">
      <h1>Welcome, {displayName.split(' ')[0]}</h1>
      <p>
        Signed in as <strong>{user?.email}</strong>
      </p>
      <p className="role-badge">Role: {role}</p>
      <p className="muted">Content browsing arrives in a later phase.</p>
    </div>
  )
}

export default Home
import { useEffect, useState } from 'react'
import api from './services/api'

function App() {
  const [backendStatus, setBackendStatus] = useState('checking')

  // Phase 1: verify the frontend can reach the Express backend.
  useEffect(() => {
    api
      .get('/health')
      .then(() => setBackendStatus('connected'))
      .catch(() => setBackendStatus('unreachable'))
  }, [])

  return (
    <div className="app">
      <header className="app-header">
        <h1>Secure Content Portal</h1>
        <p>Videos, PDFs and HTML pages with secure access control.</p>
      </header>

      <section className="status-card">
        <h2>Backend status</h2>
        <p className={`status ${backendStatus}`}>
          {backendStatus === 'checking' && 'Checking…'}
          {backendStatus === 'connected' && 'Connected to the API ✓'}
          {backendStatus === 'unreachable' && 'API unreachable — is the server running?'}
        </p>
      </section>

      <footer className="app-footer">
        Phase 1 — project setup. Authentication and content features arrive in later phases.
      </footer>
    </div>
  )
}

export default App
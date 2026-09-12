import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import './index.css'

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

// Show a friendly hint when Google OAuth is not configured yet.
if (!googleClientId) {
  createRoot(document.getElementById('root')).render(
    <div className="env-warning">
      <h1>Google OAuth is not configured</h1>
      <p>
        Copy <code>client/.env.example</code> to <code>client/.env</code> and set{' '}
        <code>VITE_GOOGLE_CLIENT_ID</code>.
      </p>
    </div>
  )
} else {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </StrictMode>
  )
}
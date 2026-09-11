import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Auth0Provider } from '@auth0/auth0-react'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import './index.css'

const domain = import.meta.env.VITE_AUTH0_DOMAIN
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID
const audience = import.meta.env.VITE_AUTH0_AUDIENCE

// Show a friendly hint when Auth0 is not configured yet.
if (!domain || !clientId || !audience) {
  createRoot(document.getElementById('root')).render(
    <div className="env-warning">
      <h1>Auth0 is not configured</h1>
      <p>
        Copy <code>client/.env.example</code> to <code>client/.env</code> and set{' '}
        <code>VITE_AUTH0_DOMAIN</code>, <code>VITE_AUTH0_CLIENT_ID</code> and{' '}
        <code>VITE_AUTH0_AUDIENCE</code>.
      </p>
    </div>
  )
} else {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      {/* cacheLocation="memory" keeps tokens out of localStorage. */}
      <Auth0Provider
        domain={domain}
        clientId={clientId}
        cacheLocation="memory"
        authorizationParams={{
          redirect_uri: window.location.origin,
          audience,
        }}
      >
        <BrowserRouter>
          <AuthProvider>
            <App />
          </AuthProvider>
        </BrowserRouter>
      </Auth0Provider>
    </StrictMode>
  )
}
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

let authToken = null

// Called by AuthContext after login. The token lives only in this module's
// memory - never in localStorage - so it cannot be persisted in browser storage.
export function setAuthToken(token) {
  authToken = token
}

// Attach the Auth0 access token to every request.
api.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`
  }
  return config
})

export default api
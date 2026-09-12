import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  withCredentials: true, // Send HttpOnly session cookie automatically
  headers: {
    'Content-Type': 'application/json',
  },
})

let authToken = null

// Fallback if explicit bearer token is used
export function setAuthToken(token) {
  authToken = token
}

// Request interceptor
api.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`
  }
  // For multipart file uploads, delete Content-Type so axios sets multipart boundary
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type']
  }
  return config
})

export default api
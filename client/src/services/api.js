import axios from 'axios'

// All API calls go through /api.
// In development Vite proxies /api to the Express backend (see vite.config.js).
// In production set VITE_API_BASE_URL to the deployed API URL.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

export default api
/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useCallback, useEffect, useState } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [googleLoaded, setGoogleLoaded] = useState(() => Boolean(window.google?.accounts?.id))

  // 1. Restore session on mount via HttpOnly cookie (no localStorage used)
  useEffect(() => {
    let isMounted = true

    api
      .get('/auth/me')
      .then((res) => {
        if (isMounted) {
          setUser(res.data.user)
        }
      })
      .catch(() => {
        if (isMounted) {
          setUser(null)
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  // 2. Load Google Identity Services script
  useEffect(() => {
    if (window.google?.accounts?.id) return
    if (document.getElementById('google-gis-script')) return

    const script = document.createElement('script')
    script.id = 'google-gis-script'
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => setGoogleLoaded(true)
    document.head.appendChild(script)
  }, [])

  // Handle Google Sign-in response
  const handleGoogleSuccess = useCallback(async (credential) => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.post('/auth/google', { credential })
      setUser(res.data.user)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to sign in with Google.')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  // Google OAuth prompt trigger
  const login = useCallback(() => {
    if (!googleLoaded || !window.google?.accounts?.id) {
      setError('Google Sign-In is not ready yet.')
      return
    }

    if (!GOOGLE_CLIENT_ID) {
      setError('Google Client ID is not configured.')
      return
    }

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (response) => handleGoogleSuccess(response.credential),
      auto_select: false,
    })
    window.google.accounts.id.prompt()
  }, [googleLoaded, handleGoogleSuccess])

  // Logout clears HttpOnly session cookie
  const logout = useCallback(async () => {
    try {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.disableAutoSelect()
      }
      await api.post('/auth/logout')
    } catch {
      // Proceed with client logout even if network call fails
    } finally {
      setUser(null)
      setError(null)
    }
  }, [])

  const value = {
    user,
    role: user?.role || null,
    isAuthenticated: !!user,
    loading,
    error,
    login,
    logout,
    handleGoogleSuccess,
    googleLoaded,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
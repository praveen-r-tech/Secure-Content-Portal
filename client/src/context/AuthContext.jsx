// This file intentionally exports both the provider component and the
// useAuth() hook - the standard React context pattern.
/* eslint-disable react-refresh/only-export-components */

import { createContext, useContext, useCallback, useEffect, useState } from 'react'
import api, { setAuthToken } from '../services/api'

const AuthContext = createContext(null)

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  // Initialize as already-loaded if GIS is present (avoids setState-in-effect).
  const [googleLoaded, setGoogleLoaded] = useState(() => Boolean(window.google?.accounts?.id))

  // Load the Google Identity Services script once.
  useEffect(() => {
    // Already available — nothing to load.
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

  // After a Google sign-in, send the ID token to our backend for verification.
  const handleGoogleSuccess = useCallback(async (credential) => {
    setLoading(true)
    setError(null)
    try {
      setAuthToken(credential)
      const res = await api.get('/users/me')
      setUser(res.data.user)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to sign in')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const login = useCallback(() => {
    if (!googleLoaded || !window.google?.accounts?.id) {
      setError('Google Sign-In is not ready yet')
      return
    }
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (response) => handleGoogleSuccess(response.credential),
      auto_select: false,
    })
    // Prompt opens the Google sign-in popup.
    window.google.accounts.id.prompt()
  }, [googleLoaded, handleGoogleSuccess])

  const logout = useCallback(() => {
    // Sign out of the local session. The Google session itself persists,
    // but our backend token is discarded (it lives in memory only).
    if (window.google?.accounts?.id) {
      window.google.accounts.id.disableAutoSelect()
    }
    setAuthToken(null)
    setUser(null)
    setError(null)
  }, [])

  const value = {
    user,
    role: user?.role || null,
    isAuthenticated: !!user,
    loading,
    error,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
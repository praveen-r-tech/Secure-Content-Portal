// This file intentionally exports both the provider component and the
// useAuth() hook - the standard React context pattern.
/* eslint-disable react-refresh/only-export-components */

import { createContext, useContext, useEffect, useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import api, { setAuthToken } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const {
    isAuthenticated,
    isLoading: auth0Loading,
    loginWithRedirect,
    logout,
    getAccessTokenSilently,
  } = useAuth0()

  const [user, setUser] = useState(null)
  const [error, setError] = useState(null)

  // After login, fetch the access token and the backend's user record
  // (the backend is the source of truth for the role).
  useEffect(() => {
    if (!isAuthenticated) return

    let cancelled = false
    getAccessTokenSilently()
      .then((token) => {
        if (cancelled) return null
        setAuthToken(token)
        return api.get('/users/me')
      })
      .then((res) => {
        if (!cancelled && res) setUser(res.data.user)
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.response?.data?.message || 'Failed to load user profile')
        }
      })

    return () => {
      cancelled = true
    }
  }, [isAuthenticated, getAccessTokenSilently])

  // loading is inferred: while Auth0 checks the session, or while the
  // backend user record is still being fetched.
  const value = {
    user: isAuthenticated ? user : null,
    role: isAuthenticated && user ? user.role : null,
    isAuthenticated,
    loading: auth0Loading || (isAuthenticated && !user && !error),
    error: isAuthenticated ? error : null,
    login: () => loginWithRedirect(),
    logout: () => logout({ logoutParams: { returnTo: window.location.origin } }),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
import { useEffect, useRef } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Login() {
  const { isAuthenticated, loading, login, handleGoogleSuccess } = useAuth()
  const googleBtnRef = useRef(null)
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

  useEffect(() => {
    let intervalId = null

    const renderGoogleButton = () => {
      if (window.google?.accounts?.id && googleClientId && googleBtnRef.current) {
        try {
          window.google.accounts.id.initialize({
            client_id: googleClientId,
            callback: (response) => handleGoogleSuccess(response.credential),
          })
          googleBtnRef.current.innerHTML = ''
          window.google.accounts.id.renderButton(googleBtnRef.current, {
            theme: 'outline',
            size: 'large',
            width: 300,
            text: 'signin_with',
            shape: 'rectangular',
          })
          return true
        } catch (err) {
          console.warn('Google renderButton error:', err)
        }
      }
      return false
    }

    if (!renderGoogleButton()) {
      let count = 0
      intervalId = setInterval(() => {
        count += 1
        if (renderGoogleButton() || count > 30) {
          clearInterval(intervalId)
        }
      }, 100)
    }

    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [googleClientId, handleGoogleSuccess])

  if (loading) {
    return <div className="page-loading">Checking session…</div>
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Secure Content Portal</h1>
        <p>Sign in with your Google account to access protected content.</p>

        <div className="google-auth-container">
          <div ref={googleBtnRef} className="google-btn-slot" />
          <button
            type="button"
            className="btn-google google-fallback-btn"
            onClick={login}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.616z"
              />
              <path
                fill="#34A853"
                d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
              />
              <path
                fill="#FBBC05"
                d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"
              />
              <path
                fill="#EA4335"
                d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"
              />
            </svg>
            <span>Sign in with Google</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Login
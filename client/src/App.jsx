import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import Home from './pages/Home'
import Login from './pages/Login'
import ContentView from './pages/ContentView'
import AdminDashboard from './pages/AdminDashboard'
import UploadContent from './pages/UploadContent'
import EditContent from './pages/EditContent'
import { useAuth } from './context/AuthContext'

function App() {
  const { error } = useAuth()

  return (
    <div className="app">
      <Navbar />
      {error && (
        <div className="error-banner" role="alert">
          {error}
        </div>
      )}
      <main className="main">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/content/:id"
            element={
              <ProtectedRoute>
                <ContentView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/upload"
            element={
              <AdminRoute>
                <UploadContent />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/edit/:id"
            element={
              <AdminRoute>
                <EditContent />
              </AdminRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
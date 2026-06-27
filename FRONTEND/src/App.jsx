import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Chat from './pages/Chat'

const Protected = ({ children }) => {
  const { token, loading } = useAuth()
  if (loading) return null
  return token ? children : <Navigate to="/login" replace />
}

const PublicOnly = ({ children }) => {
  const { token, loading } = useAuth()
  if (loading) return null
  return !token ? children : <Navigate to="/chat" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={
        <PublicOnly><Landing /></PublicOnly>
      } />
      <Route path="/login" element={
        <PublicOnly><Login /></PublicOnly>
      } />
      <Route path="/register" element={
        <PublicOnly><Register /></PublicOnly>
      } />
      <Route path="/chat" element={
        <Protected><Chat /></Protected>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
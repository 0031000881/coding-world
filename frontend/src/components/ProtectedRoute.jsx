import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import Loading from './Loading.jsx'

export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth()

  if (loading) return <Loading label="Checking your session..." />
  if (!user) return <Navigate to="/login" replace />
  if (role && user.role !== role) return <Navigate to="/dashboard" replace />

  return children
}

import { Navigate, useLocation } from 'react-router-dom'
import { adminSessionKey } from '../admin/services/adminStore'

export default function AdminGuard({ children }) {
  const location = useLocation()
  const isLoggedIn = localStorage.getItem(adminSessionKey) === '1'

  if (!isLoggedIn) {
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />
  }

  return children
}

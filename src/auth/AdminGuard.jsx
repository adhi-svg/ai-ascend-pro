import { Navigate, useLocation } from 'react-router-dom'
import { adminSessionKey } from '../admin/services/adminStore'

export default function AdminGuard({ children }) {
  const location = useLocation()
  const isLoggedIn = localStorage.getItem(adminSessionKey) === '1'
  const token = localStorage.getItem('auth_token')
  const userInfo = localStorage.getItem('user_info')

  let isAdmin = false
  try {
    const parsed = userInfo ? JSON.parse(userInfo) : null
    isAdmin = parsed?.role === 'admin'
  } catch {
    isAdmin = false
  }

  if (!isLoggedIn || !token || !isAdmin) {
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />
  }

  return children
}

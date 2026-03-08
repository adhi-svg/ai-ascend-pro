import { Navigate, useLocation } from 'react-router-dom'

export default function TechnicianGuard({ children }) {
  const location = useLocation()
  const token = localStorage.getItem('auth_token')
  const userInfo = localStorage.getItem('user_info')

  let isTechnician = false
  try {
    const parsed = userInfo ? JSON.parse(userInfo) : null
    isTechnician = parsed?.role === 'technician'
  } catch {
    isTechnician = false
  }

  if (!token || !isTechnician) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  return children
}
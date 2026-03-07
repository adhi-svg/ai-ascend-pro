// FYXION Admin Panel — Backend API Service
// Replaces localStorage-based data with real backend API calls

const API_BASE_URL = 'http://localhost:8000/api/v1'
const SESSION_KEY = 'fyxion_admin_session'

const getAdminToken = () => {
  try {
    const session = JSON.parse(localStorage.getItem(SESSION_KEY) || '{}')
    return session.token || localStorage.getItem('auth_token') || ''
  } catch {
    return localStorage.getItem('auth_token') || ''
  }
}

const fetchAPI = async (endpoint, options = {}) => {
  const token = getAdminToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || data.error?.details || 'API request failed')
  }

  return data.success !== undefined ? data.data : data
}

// ─── Technician Management ────────────────────────────────────
export const getAllTechnicians = async (statusFilter) => {
  try {
    const query = statusFilter ? `?status=${statusFilter}` : ''
    const data = await fetchAPI(`/technician/applications${query}`)
    return Array.isArray(data) ? data : []
  } catch (error) {
    console.error('Failed to fetch technicians:', error)
    return []
  }
}

export const getTechnicianById = async (id) => {
  try {
    const list = await getAllTechnicians()
    return list.find((tech) => tech.id === id) || null
  } catch {
    return null
  }
}

export const approveTechnician = async (id) => {
  try {
    await fetchAPI(`/technician/${id}/approve`, { method: 'PATCH' })
    return await getAllTechnicians()
  } catch (error) {
    console.error('Approve failed:', error)
    throw error
  }
}

export const rejectTechnician = async (id, reason) => {
  try {
    await fetchAPI(`/technician/${id}/reject?reason=${encodeURIComponent(reason || '')}`, {
      method: 'PATCH',
    })
    return await getAllTechnicians()
  } catch (error) {
    console.error('Reject failed:', error)
    throw error
  }
}

export const suspendTechnician = async (id, reason) => {
  try {
    await fetchAPI(`/technician/${id}/suspend?reason=${encodeURIComponent(reason || '')}`, {
      method: 'PATCH',
    })
    return await getAllTechnicians()
  } catch (error) {
    console.error('Suspend failed:', error)
    throw error
  }
}

// ─── Bookings (Admin) ─────────────────────────────────────────
export const getAllBookings = async () => {
  try {
    return await fetchAPI('/bookings')
  } catch (error) {
    console.error('Failed to fetch bookings:', error)
    return []
  }
}

// ─── Refunds (Admin) ──────────────────────────────────────────
export const getAllRefunds = async (statusFilter) => {
  try {
    const query = statusFilter ? `?status=${statusFilter}` : ''
    return await fetchAPI(`/bookings/refunds${query}`)
  } catch (error) {
    console.error('Failed to fetch refunds:', error)
    return []
  }
}

// ─── Support Tickets (Admin) ──────────────────────────────────
export const getAllTickets = async (statusFilter) => {
  try {
    const query = statusFilter ? `?status=${statusFilter}` : ''
    return await fetchAPI(`/support/all${query}`)
  } catch (error) {
    console.error('Failed to fetch tickets:', error)
    return []
  }
}

export const resolveTicket = async (ticketId, resolution) => {
  return await fetchAPI(`/support/ticket/${ticketId}/resolve?resolution=${encodeURIComponent(resolution)}`, {
    method: 'PATCH',
  })
}

export const closeTicket = async (ticketId) => {
  return await fetchAPI(`/support/ticket/${ticketId}/close`, {
    method: 'PATCH',
  })
}

// ─── Admin Session ────────────────────────────────────────────
export const adminSessionKey = SESSION_KEY

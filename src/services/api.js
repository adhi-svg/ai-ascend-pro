// Fyxion Backend API Integration
const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://98.92.251.154:8000'}/api/v1`
const DEFAULT_TIMEOUT_MS = 30000

const fetchWithTimeout = async (url, options = {}, timeout = DEFAULT_TIMEOUT_MS) => {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)
  try {
    return await fetch(url, {
      ...options,
      signal: options.signal || controller.signal,
    })
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.')
    }
    throw error
  } finally {
    clearTimeout(timer)
  }
}

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('auth_token')
}

const clearAuth = () => {
  localStorage.removeItem('auth_token')
  localStorage.removeItem('user_info')
}

// Helper function to make authenticated requests
const fetchAPI = async (endpoint, options = {}) => {
  const token = getAuthToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  }

  const response = await fetchWithTimeout(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: options.credentials ?? 'include',
  }, options.timeout ?? DEFAULT_TIMEOUT_MS)

  const data = await response.json()

  if (!response.ok) {
    if (response.status === 401) {
      clearAuth()
      throw new Error('Session expired. Please sign in again.')
    }
    throw new Error(data.message || data.error?.details || 'API request failed')
  }

  if (data?.success === false) {
    throw new Error(data.message || data.error?.details || 'API request failed')
  }

  return data.success ? data.data : data
}

// Authentication APIs
export const login = async (phoneOrEmail, password) => {
  const response = await fetchWithTimeout(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      phone: phoneOrEmail,
      password,
    }),
  }, DEFAULT_TIMEOUT_MS)

  const data = await response.json()
  if (!response.ok || data?.success === false) {
    throw new Error(data.message || data.error?.details || 'Login failed')
  }

  if (!data?.data?.user || !data?.data?.access_token) {
    throw new Error('Invalid login response')
  }

  // Store token and user info
  if (data.success) {
    localStorage.setItem('auth_token', data.data.access_token)
    localStorage.setItem('user_info', JSON.stringify(data.data.user))
  }

  return data.data
}

export const register = async (userData) => {
  const response = await fetchWithTimeout(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(userData),
  }, DEFAULT_TIMEOUT_MS)

  const data = await response.json()
  if (!response.ok || data?.success === false) {
    throw new Error(data.message || data.error?.details || 'Registration failed')
  }

  if (!data?.data?.user || !data?.data?.access_token) {
    throw new Error('Invalid registration response')
  }

  // Store token and user info
  if (data.success) {
    localStorage.setItem('auth_token', data.data.access_token)
    localStorage.setItem('user_info', JSON.stringify(data.data.user))
  }

  return data.data
}

export const logout = () => {
  clearAuth()
}

export const exchangeGoogleCode = async (code) => {
  console.log('[API] Exchanging Google code for token')

  const response = await fetchWithTimeout(`${API_BASE_URL}/auth/google/exchange`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ code }),
  }, DEFAULT_TIMEOUT_MS)

  const data = await response.json()

  console.log('[API] Exchange response status:', response.status)
  console.log('[API] Exchange response data:', JSON.stringify(data, null, 2))

  // Check for error response first (success: false)
  if (data.success === false) {
    const errorMsg = data.message || data.error?.details || data.error?.code || 'Google login failed'
    console.error('[API] Backend returned error:', errorMsg, 'Details:', data.error)
    throw new Error(errorMsg)
  }

  // Check HTTP status
  if (!response.ok) {
    const errorMsg = data.message || data.error?.details || `HTTP ${response.status}`
    console.error('[API] Google exchange HTTP error:', response.status, errorMsg)
    throw new Error(errorMsg)
  }

  console.log('[API] Response success:', data.success, 'Has data:', !!data.data)

  // Validate required fields
  if (!data.data) {
    console.error('[API] API returned no data object:', data)
    throw new Error('Invalid authentication response - no data returned')
  }

  if (!data.data.access_token) {
    console.error('[API] No access_token in response:', data.data)
    throw new Error('Invalid authentication response - no token')
  }

  if (!data.data.user) {
    console.error('[API] No user in response:', data.data)
    throw new Error('Invalid authentication response - no user')
  }

  console.log('[API] Storing auth data in localStorage')
  localStorage.setItem('auth_token', data.data.access_token)
  localStorage.setItem('user_info', JSON.stringify(data.data.user))
  console.log('[API] Auth data stored successfully for:', data.data.user.email)

  return data.data
}

export const getCurrentUser = () => {
  const token = getAuthToken()
  const userInfo = localStorage.getItem('user_info')
  if (!token || !userInfo) return null
  try {
    return JSON.parse(userInfo)
  } catch {
    clearAuth()
    return null
  }
}

// Category APIs
export const fetchCategories = async () => {
  return await fetchAPI('/categories')
}

// Technician APIs
export const fetchTechnicians = async (categoryId) => {
  const query = categoryId ? `?category_id=${categoryId}` : ''
  return await fetchAPI(`/technicians${query}`)
}

export const fetchTechnicianRequests = async () => {
  return await fetchAPI('/technicians/me/requests')
}

// Booking APIs
export const postBooking = async (payload) => {
  return await fetchAPI('/bookings', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export const fetchNearbyJobs = async () => {
  // For technicians - get their requests
  const user = getCurrentUser()
  if (user && String(user.role || '').toLowerCase() === 'technician') {
    return await fetchTechnicianRequests()
  }
  // For customers - get their bookings
  return await fetchAPI('/bookings/me')
}

export const getBookingDetails = async (bookingId) => {
  return await fetchAPI(`/bookings/${bookingId}`)
}

export const assignTechnician = async (bookingId, technicianId) => {
  return await fetchAPI(`/bookings/${bookingId}/assign`, {
    method: 'PATCH',
    body: JSON.stringify({ technician_id: technicianId }),
  })
}

export const updateJobStatus = async (bookingId, status) => {
  return await fetchAPI(`/bookings/${bookingId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
}

export const generateOTP = async (bookingId) => {
  return await fetchAPI(`/bookings/${bookingId}/otp/generate`, {
    method: 'POST',
  })
}

export const completeJobWithOtp = async (bookingId, otp) => {
  return await fetchAPI(`/bookings/${bookingId}/otp/verify`, {
    method: 'POST',
    body: JSON.stringify({ otp_code: otp }),
  })
}

export const submitRating = async (bookingId, rating, feedback) => {
  return await fetchAPI(`/bookings/${bookingId}/rating`, {
    method: 'POST',
    body: JSON.stringify({ rating, feedback }),
  })
}

export const postPayment = async (bookingId, method, amount) => {
  return await fetchAPI(`/bookings/${bookingId}/payment`, {
    method: 'POST',
    body: JSON.stringify({ method, amount }),
  })
}

// Complaint APIs
export const fetchComplaints = async () => {
  return await fetchAPI('/complaints/me')
}

export const submitComplaint = async (complaint) => {
  return await fetchAPI('/complaints', {
    method: 'POST',
    body: JSON.stringify(complaint),
  })
}

// Location Tracking APIs
export const updateTechnicianLocation = async (bookingId, latitude, longitude) => {
  return await fetchAPI('/technicians/me/location', {
    method: 'POST',
    body: JSON.stringify({
      booking_id: bookingId,
      latitude,
      longitude,
    }),
  })
}

export const getTechnicianLocation = async (bookingId) => {
  return await fetchAPI(`/bookings/${bookingId}/location`)
}

// Earnings APIs
export const fetchEarnings = async () => {
  return await fetchAPI('/technicians/me/earnings')
}

export const fetchEarningsAnalytics = async (range = 'month') => {
  return await fetchAPI(`/technicians/me/earnings/analytics?range=${range}`)
}

// Help Center APIs
export const fetchFAQs = async () => {
  return await fetchAPI('/help/faq')
}

export const searchFAQs = async (query) => {
  return await fetchAPI(`/help/faq/search?q=${encodeURIComponent(query)}`)
}

// WebSocket for real-time tracking
export const createTrackingWebSocket = (bookingId, onLocationUpdate) => {
  const ws = new WebSocket(`ws://98.92.251.154:8000/ws/bookings/${bookingId}`)

  ws.onopen = () => {
    console.log('WebSocket connected for booking:', bookingId)
  }

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data)
    if (data.type === 'location_update') {
      onLocationUpdate(data.location)
    }
  }

  ws.onerror = (error) => {
    console.error('WebSocket error:', error)
  }

  ws.onclose = () => {
    console.log('WebSocket disconnected')
  }

  return ws
}

export default undefined

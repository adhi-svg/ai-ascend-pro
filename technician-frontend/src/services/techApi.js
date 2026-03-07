// FYXION Technician Frontend — Backend API Service
const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://100.27.210.231:8000'}/api/v1`

const getToken = () => localStorage.getItem('tech_auth_token')

const clearAuth = () => {
    localStorage.removeItem('tech_auth_token')
    localStorage.removeItem('tech_user_info')
}

const fetchAPI = async (endpoint, options = {}) => {
    const token = getToken()
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
        if (response.status === 401) {
            clearAuth()
            throw new Error('Session expired. Please sign in again.')
        }
        throw new Error(data.message || data.error?.details || 'API request failed')
    }

    if (data?.success === false) {
        throw new Error(data.message || data.error?.details || 'API request failed')
    }

    return data.success !== undefined ? data.data : data
}

// ─── Authentication ──────────────────────────────────────────
export const techLogin = async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: email, password }),
    })

    const data = await response.json()
    if (!response.ok || data?.success === false) {
        throw new Error(data.message || data.error?.details || 'Login failed')
    }

    if (!data?.data?.user || !data?.data?.access_token) {
        throw new Error('Invalid login response')
    }

    if (data.success && data.data) {
        localStorage.setItem('tech_auth_token', data.data.access_token)
        localStorage.setItem('tech_user_info', JSON.stringify(data.data.user))
    }

    return data.data
}

export const techRegister = async (userData) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...userData, role: 'technician' }),
    })

    const data = await response.json()
    if (!response.ok || data?.success === false) {
        throw new Error(data.message || data.error?.details || 'Registration failed')
    }

    if (!data?.data?.user || !data?.data?.access_token) {
        throw new Error('Invalid registration response')
    }

    if (data.success && data.data) {
        localStorage.setItem('tech_auth_token', data.data.access_token)
        localStorage.setItem('tech_user_info', JSON.stringify(data.data.user))
    }

    return data.data
}

export const techLogout = () => clearAuth()

export const exchangeGoogleCode = async (code) => {
    const response = await fetch(`${API_BASE_URL}/auth/google/exchange`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, role: 'technician' }),
    })

    const data = await response.json()
    if (!response.ok || data.success === false) {
        throw new Error(data.message || data.error?.details || 'Google login failed')
    }

    if (!data?.data?.user || !data?.data?.access_token) {
        throw new Error('Invalid Google login response')
    }

    if (data.data) {
        localStorage.setItem('tech_auth_token', data.data.access_token)
        localStorage.setItem('tech_user_info', JSON.stringify(data.data.user))
    }

    return data.data
}

export const getStoredUser = () => {
    const token = getToken()
    const userInfo = localStorage.getItem('tech_user_info')
    if (!token || !userInfo) return null
    try {
        return JSON.parse(userInfo)
    } catch {
        return null
    }
}

// ─── Technician Profile ──────────────────────────────────────
export const fetchTechProfile = async () => {
    return await fetchAPI('/technician/profile')
}

export const updateTechProfile = async (data) => {
    return await fetchAPI('/technicians/me', {
        method: 'PATCH',
        body: JSON.stringify(data),
    })
}

export const toggleOnlineStatus = async () => {
    return await fetchAPI('/technician/toggle-status', {
        method: 'PATCH',
    })
}

// ─── Bookings ────────────────────────────────────────────────
export const fetchTechBookings = async () => {
    return await fetchAPI('/bookings/technician/me/bookings')
}

export const acceptBooking = async (bookingId) => {
    return await fetchAPI(`/bookings/${bookingId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'ASSIGNED' }),
    })
}

export const startBooking = async (bookingId) => {
    return await fetchAPI(`/bookings/${bookingId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'IN_PROGRESS' }),
    })
}

export const completeBooking = async (bookingId, amount) => {
    return await fetchAPI(`/bookings/${bookingId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'COMPLETED', actual_cost: amount }),
    })
}

export const verifyOtp = async (bookingId, otp) => {
    return await fetchAPI(`/bookings/${bookingId}/otp/verify`, {
        method: 'POST',
        body: JSON.stringify({ otp_code: otp }),
    })
}

export const generateOtp = async (bookingId) => {
    return await fetchAPI(`/bookings/${bookingId}/otp/generate`, {
        method: 'POST',
    })
}

// ─── Earnings ────────────────────────────────────────────────
export const fetchEarnings = async () => {
    return await fetchAPI('/earnings')
}

export const fetchEarningsAnalytics = async (range = 'month') => {
    return await fetchAPI(`/earnings/analytics?range=${range}`)
}

// ─── Location ────────────────────────────────────────────────
export const updateLocation = async (bookingId, lat, lng) => {
    return await fetchAPI('/tracking/technicians/me/location', {
        method: 'POST',
        body: JSON.stringify({ booking_id: bookingId, lat, lng }),
    })
}

export default {
    techLogin,
    techRegister,
    techLogout,
    getStoredUser,
    fetchTechProfile,
    updateTechProfile,
    toggleOnlineStatus,
    fetchTechBookings,
    acceptBooking,
    startBooking,
    completeBooking,
    verifyOtp,
    generateOtp,
    fetchEarnings,
    fetchEarningsAnalytics,
    updateLocation,
}

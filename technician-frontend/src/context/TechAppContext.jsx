import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import {
  fetchTechBookings,
  acceptBooking as apiAcceptBooking,
  startBooking as apiStartBooking,
  completeBooking as apiCompleteBooking,
  verifyOtp as apiVerifyOtp,
  toggleOnlineStatus as apiToggleOnline,
  updateLocation as apiUpdateLocation,
} from '../services/techApi'

const TechAppContext = createContext(null)

export function TechAppProvider({ children }) {
  const [bookings, setBookings] = useState([])
  const [online, setOnline] = useState(true)
  const [toasts, setToasts] = useState([])
  const [loadingBookings, setLoadingBookings] = useState(false)
  const timeoutIds = useRef(new Map())
  const watchId = useRef(null)

  // ─── Toast System ───────────────────────────────────────────
  const addToast = (toast) => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`
    const nextToast = {
      id,
      title: toast.title || 'Update',
      message: toast.message || 'Action completed.',
      tone: toast.tone || 'success',
    }

    setToasts((prev) => [...prev, nextToast])

    const timeoutId = setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id))
      timeoutIds.current.delete(id)
    }, 3200)

    timeoutIds.current.set(id, timeoutId)
  }

  const removeToast = (id) => {
    const timeoutId = timeoutIds.current.get(id)
    if (timeoutId) clearTimeout(timeoutId)
    timeoutIds.current.delete(id)
    setToasts((prev) => prev.filter((item) => item.id !== id))
  }

  // ─── Load Bookings from Backend ─────────────────────────────
  const loadBookings = async () => {
    setLoadingBookings(true)
    try {
      const data = await fetchTechBookings()
      setBookings(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to load bookings:', error)
      addToast({ title: 'Error', message: 'Failed to load bookings.', tone: 'danger' })
    } finally {
      setLoadingBookings(false)
    }
  }

  // Load bookings on mount
  useEffect(() => {
    loadBookings()
  }, [])

  // Poll for new bookings every 30 seconds
  useEffect(() => {
    const interval = setInterval(loadBookings, 30000)
    return () => {
      clearInterval(interval)
      if (watchId.current) navigator.geolocation.clearWatch(watchId.current)
    }
  }, [])

  // ─── Location Tracking ─────────────────────────────
  const startTracking = (bookingId) => {
    if (watchId.current) return
    if (!navigator.geolocation) {
      console.warn('Geolocation not supported')
      return
    }

    watchId.current = navigator.geolocation.watchPosition(
      async (pos) => {
        if (!online) return
        try {
          await apiUpdateLocation(bookingId, pos.coords.latitude, pos.coords.longitude)
        } catch (err) {
          console.error('Failed to update location:', err)
        }
      },
      (err) => console.error('Geolocation error:', err),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 10000 }
    )
  }

  const stopTracking = () => {
    if (watchId.current) {
      navigator.geolocation.clearWatch(watchId.current)
      watchId.current = null
    }
  }

  // Effect to watch active jobs
  useEffect(() => {
    const activeJob = bookings.find(b => ['ASSIGNED', 'ACCEPTED', 'ON_THE_WAY', 'IN_PROGRESS'].includes(b.status))
    if (activeJob && online) {
      startTracking(activeJob.id)
    } else {
      stopTracking()
    }
  }, [bookings, online])

  // ─── Booking Actions ────────────────────────────────────────
  const updateBooking = (bookingId, updates) => {
    setBookings((prev) =>
      prev.map((booking) =>
        booking.id === bookingId
          ? { ...booking, ...updates, updatedAt: new Date().toISOString() }
          : booking,
      ),
    )
  }

  const acceptBooking = async (bookingId) => {
    try {
      await apiAcceptBooking(bookingId)
      updateBooking(bookingId, { status: 'ASSIGNED' })
      addToast({ title: 'Request accepted', message: 'Job accepted successfully.' })
      // Refresh bookings from server
      loadBookings()
    } catch (error) {
      addToast({ title: 'Error', message: error.message || 'Failed to accept booking.', tone: 'danger' })
    }
  }

  const startTrip = async (bookingId) => {
    try {
      await apiStartBooking(bookingId)
      updateBooking(bookingId, { status: 'IN_PROGRESS' })
      addToast({ title: 'Trip started', message: 'Navigate to the customer location.' })
    } catch (error) {
      addToast({ title: 'Error', message: error.message || 'Failed to start trip.', tone: 'danger' })
    }
  }

  const markArrived = (bookingId) => {
    updateBooking(bookingId, { status: 'arrived' })
    addToast({ title: 'Arrived', message: 'OTP sent to the customer.' })
  }

  const verifyOtp = async (bookingId, otpInput) => {
    try {
      await apiVerifyOtp(bookingId, otpInput)
      updateBooking(bookingId, {
        status: 'started',
        otpVerifiedAt: new Date().toISOString(),
      })
      addToast({ title: 'OTP verified', message: 'Work started automatically.' })
      return true
    } catch (error) {
      addToast({ title: 'OTP failed', message: error.message || 'Incorrect OTP.', tone: 'danger' })
      return false
    }
  }

  const completeBooking = async (bookingId, amount) => {
    try {
      await apiCompleteBooking(bookingId, Number(amount) || 0)
      updateBooking(bookingId, { status: 'COMPLETED', amount: Number(amount) || 0 })
      addToast({ title: 'Job completed', message: `Booking marked completed.` })
      loadBookings()
    } catch (error) {
      addToast({ title: 'Error', message: error.message || 'Failed to complete booking.', tone: 'danger' })
    }
  }

  const toggleOnline = async () => {
    try {
      const result = await apiToggleOnline()
      const newStatus = result?.is_online ?? !online
      setOnline(newStatus)
      addToast({ title: newStatus ? 'Online' : 'Offline', message: `You are now ${newStatus ? 'online' : 'offline'}.` })
    } catch (error) {
      addToast({ title: 'Error', message: error.message || 'Failed to toggle status.', tone: 'danger' })
    }
  }

  const confirmPayment = (bookingId) => {
    updateBooking(bookingId, { status: 'payment_confirmed', paymentStatus: 'paid' })
    addToast({ title: 'Payment confirmed', message: 'Customer confirmation received.' })
  }

  const updateStatus = (bookingId, status) => {
    updateBooking(bookingId, { status })
    addToast({ title: 'Status updated', message: `Booking moved to ${status}.` })
  }

  const value = useMemo(
    () => ({
      bookings,
      online,
      setOnline: toggleOnline,
      loadingBookings,
      refreshBookings: loadBookings,
      updateStatus,
      updateBooking,
      completeBooking,
      acceptBooking,
      confirmPayment,
      startTrip,
      markArrived,
      verifyOtp,
      toasts,
      addToast,
      removeToast,
    }),
    [bookings, online, toasts, loadingBookings],
  )

  return <TechAppContext.Provider value={value}>{children}</TechAppContext.Provider>
}

export function useTechApp() {
  const context = useContext(TechAppContext)
  if (!context) {
    throw new Error('useTechApp must be used within TechAppProvider')
  }
  return context
}

import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import mockBookings from '../data/mockBookings.js'

const TechAppContext = createContext(null)

export function TechAppProvider({ children }) {
  const [bookings, setBookings] = useState(mockBookings)
  const [online, setOnline] = useState(true)
  const [toasts, setToasts] = useState([])
  const timeoutIds = useRef(new Map())
  const paymentTimeouts = useRef(new Map())
  const activeStatuses = useRef(new Set(['payment_confirmed', 'on_the_way', 'arrived', 'started']))

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

  useEffect(() => {
    return () => {
      paymentTimeouts.current.forEach((timeoutId) => clearTimeout(timeoutId))
      paymentTimeouts.current.clear()
    }
  }, [])

  const updateBooking = (bookingId, updates) => {
    setBookings((prev) =>
      prev.map((booking) =>
        booking.id === bookingId
          ? { ...booking, ...updates, updatedAt: new Date().toISOString() }
          : booking,
      ),
    )
  }

  const updateStatus = (bookingId, status) => {
    updateBooking(bookingId, { status })
    addToast({ title: 'Status updated', message: `Booking ${bookingId} moved to ${status}.` })
  }

  const acceptBooking = (bookingId) => {
    const now = new Date().toISOString()
    const hasActive = bookings.some(
      (booking) => booking.id !== bookingId && activeStatuses.current.has(booking.status),
    )

    if (hasActive) {
      updateBooking(bookingId, {
        status: 'queued',
        queuedAt: now,
        queueReason: 'active_job',
      })
      addToast({ title: 'Queued', message: 'Finish the current job to continue.' })
      return
    }

    updateBooking(bookingId, { status: 'payment_pending', paymentStatus: 'pending' })
    addToast({ title: 'Request accepted', message: 'Waiting for customer confirmation payment.' })

    if (paymentTimeouts.current.has(bookingId)) return
    const timeoutId = setTimeout(() => {
      paymentTimeouts.current.delete(bookingId)
      setBookings((prev) => {
        const busy = prev.some(
          (booking) => booking.id !== bookingId && activeStatuses.current.has(booking.status),
        )
        return prev.map((booking) => {
          if (booking.id !== bookingId) return booking
          if (booking.status !== 'payment_pending') return booking
          if (busy) {
            return {
              ...booking,
              status: 'queued',
              paymentStatus: 'paid',
              paymentConfirmedAt: new Date().toISOString(),
              queueReason: 'active_job',
              updatedAt: new Date().toISOString(),
            }
          }
          return {
            ...booking,
            status: 'payment_confirmed',
            paymentStatus: 'paid',
            paymentConfirmedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
        })
      })
      addToast({ title: 'Payment received', message: 'Customer confirmation received.' })
    }, 4000)
    paymentTimeouts.current.set(bookingId, timeoutId)
  }

  const confirmPayment = (bookingId) => {
    updateBooking(bookingId, { status: 'payment_confirmed', paymentStatus: 'paid' })
    addToast({ title: 'Payment confirmed', message: 'Customer confirmation received.' })
  }

  const startTrip = (bookingId) => {
    updateBooking(bookingId, { status: 'on_the_way' })
    addToast({ title: 'Trip started', message: 'Navigate to the customer location.' })
  }

  const markArrived = (bookingId) => {
    setBookings((prev) =>
      prev.map((booking) => {
        if (booking.id !== bookingId) return booking
        const otp = booking.otp || `${Math.floor(1000 + Math.random() * 9000)}`
        return {
          ...booking,
          status: 'arrived',
          otp,
          otpSentAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      }),
    )
    addToast({ title: 'Arrived', message: 'OTP sent to the customer.' })
  }

  const verifyOtp = (bookingId, otpInput) => {
    const booking = bookings.find((item) => item.id === bookingId)
    if (!booking) return false
    if (String(booking.otp) !== String(otpInput)) {
      addToast({ title: 'OTP failed', message: 'Incorrect OTP. Ask customer again.', tone: 'danger' })
      return false
    }
    updateBooking(bookingId, {
      status: 'started',
      otpVerifiedAt: new Date().toISOString(),
    })
    addToast({ title: 'OTP verified', message: 'Work started automatically.' })
    return true
  }

  const completeBooking = (bookingId, amount) => {
    updateBooking(bookingId, { status: 'completed', amount: Number(amount) || 0 })
    addToast({ title: 'Job completed', message: `Booking ${bookingId} marked completed.` })
  }

  const value = useMemo(
    () => ({
      bookings,
      online,
      setOnline,
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
    [bookings, online, toasts],
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

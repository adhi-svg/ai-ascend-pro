import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTechApp } from '../context/TechAppContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { bookingStatusOrder } from '../data/mockBookings.js'
import Button from '../components/ui/Button.jsx'
import Card from '../components/ui/Card.jsx'
import Badge from '../components/ui/Badge.jsx'
import Input from '../components/ui/Input.jsx'
import L from 'leaflet'

const statusLabels = {
  requested: 'Requested',
  queued: 'Queued',
  payment_pending: 'Payment pending',
  payment_confirmed: 'Payment confirmed',
  on_the_way: 'On the way',
  arrived: 'Arrived',
  started: 'Started',
  completed: 'Completed',
  cancelled: 'Cancelled',
  assigned: 'Assigned',
}

const statusTone = {
  requested: 'info',
  queued: 'warning',
  payment_pending: 'warning',
  payment_confirmed: 'info',
  on_the_way: 'info',
  arrived: 'warning',
  started: 'warning',
  completed: 'success',
  cancelled: 'danger',
  assigned: 'warning',
}

export default function ActiveJob() {
  const { bookingId } = useParams()
  const {
    bookings,
    addToast,
    startTrip,
    markArrived,
    verifyOtp,
    completeBooking,
  } = useTechApp()
  const { token } = useAuth()
  const booking = bookings.find((item) => item.id === bookingId)
  const [location, setLocation] = useState(null)
  const [notes, setNotes] = useState(booking?.notes || '')
  const [otpInput, setOtpInput] = useState('')
  const [routeLoading, setRouteLoading] = useState(false)
  const [routeError, setRouteError] = useState('')
  const mapRef = useRef(null)
  const mapInstance = useRef(null)
  const markerRefs = useRef({ customer: null, technician: null })
  const routeRef = useRef(null)
  const wsRef = useRef(null)
  const customerLocation = useMemo(() => {
    if (booking?.location?.lat && booking?.location?.lng) {
      return booking.location
    }
    return { lat: 28.6139, lng: 77.209 }
  }, [booking])
  const techLocation = location || customerLocation
  const distanceKm = useMemo(() => {
    const toRad = (value) => (value * Math.PI) / 180
    const earthRadius = 6371
    const latDiff = toRad(customerLocation.lat - techLocation.lat)
    const lngDiff = toRad(customerLocation.lng - techLocation.lng)
    const a =
      Math.sin(latDiff / 2) * Math.sin(latDiff / 2) +
      Math.cos(toRad(techLocation.lat)) *
        Math.cos(toRad(customerLocation.lat)) *
        Math.sin(lngDiff / 2) *
        Math.sin(lngDiff / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return earthRadius * c
  }, [customerLocation, techLocation])

  useEffect(() => {
    if (!booking) return
    if (!['payment_confirmed', 'on_the_way', 'arrived', 'started'].includes(booking.status)) return
    if (wsRef.current) return

    const wsToken = token || 'tech_mock_token_12345'
    wsRef.current = new WebSocket(`ws://100.27.210.231:8000/ws/technicians/me/location?token=${wsToken}`)

    wsRef.current.onopen = () => {
      addToast({ title: 'Live tracking', message: 'Sharing your location with customer.' })
    }

    wsRef.current.onerror = () => {
      addToast({ title: 'Live tracking', message: 'Unable to connect for live tracking.', tone: 'danger' })
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
    }
  }, [addToast, booking, token])

  if (!booking) {
    return (
      <Card className="p-8 text-center">
        <p className="text-sm text-brand-text-secondary">Active job not found.</p>
        <Link to="/jobs" className="mt-4 inline-block text-xs font-semibold text-brand-primary">
          Back to jobs
        </Link>
      </Card>
    )
  }

  const handleLocation = () => {
    if (!navigator.geolocation) {
      addToast({ title: 'Location unavailable', message: 'Geolocation is not supported.', tone: 'danger' })
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
        addToast({ title: 'Location updated', message: 'Lat/Lng captured locally.' })
      },
      () => {
        addToast({ title: 'Location error', message: 'Unable to fetch location.', tone: 'danger' })
      },
    )
  }

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return

    mapInstance.current = L.map(mapRef.current).setView(
      [customerLocation.lat, customerLocation.lng],
      14,
    )

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(mapInstance.current)

    markerRefs.current.customer = L.marker([customerLocation.lat, customerLocation.lng], {
      icon: L.icon({
        iconUrl:
          'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
      }),
    })
      .bindPopup('Customer location')
      .addTo(mapInstance.current)

    markerRefs.current.technician = L.marker([techLocation.lat, techLocation.lng], {
      icon: L.icon({
        iconUrl:
          'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
      }),
    })
      .bindPopup('Your location')
      .addTo(mapInstance.current)

    routeRef.current = L.polyline([], { color: '#0ea5e9', weight: 4, opacity: 0.9 }).addTo(
      mapInstance.current,
    )

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove()
        mapInstance.current = null
      }
    }
  }, [customerLocation, techLocation])

  useEffect(() => {
    if (!markerRefs.current.technician) return
    markerRefs.current.technician.setLatLng([techLocation.lat, techLocation.lng])
  }, [techLocation])

  useEffect(() => {
    if (!mapInstance.current || !routeRef.current) return

    const controller = new AbortController()
    const fetchRoute = async () => {
      setRouteLoading(true)
      setRouteError('')
      try {
        const start = `${techLocation.lng},${techLocation.lat}`
        const end = `${customerLocation.lng},${customerLocation.lat}`
        const url = `https://router.project-osrm.org/route/v1/driving/${start};${end}?overview=full&geometries=geojson`
        const response = await fetch(url, { signal: controller.signal })
        if (!response.ok) throw new Error('Route service unavailable')
        const data = await response.json()
        if (!data.routes?.length) throw new Error('No route found')

        const coords = data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng])
        routeRef.current.setLatLngs(coords)
        mapInstance.current.fitBounds(routeRef.current.getBounds(), { padding: [24, 24] })
      } catch (error) {
        if (error.name !== 'AbortError') {
          setRouteError('Route unavailable. Showing direct path.')
          routeRef.current.setLatLngs([
            [techLocation.lat, techLocation.lng],
            [customerLocation.lat, customerLocation.lng],
          ])
          mapInstance.current.fitBounds(routeRef.current.getBounds(), { padding: [24, 24] })
        }
      } finally {
        setRouteLoading(false)
      }
    }

    fetchRoute()
    return () => controller.abort()
  }, [customerLocation, techLocation])

  useEffect(() => {
    if (!booking) return
    if (!['payment_confirmed', 'on_the_way', 'arrived', 'started'].includes(booking.status)) return
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return

    const payload = {
      booking_id: booking.id,
      lat: techLocation.lat,
      lng: techLocation.lng,
    }

    wsRef.current.send(JSON.stringify(payload))
  }, [booking, techLocation])

  useEffect(() => {
    if (!booking) return
    if (booking.status !== 'on_the_way') return
    if (location) return

    const intervalId = setInterval(() => {
      setLocation((prev) => {
        const current = prev || { lat: customerLocation.lat + 0.02, lng: customerLocation.lng - 0.02 }
        const nextLat = current.lat + (customerLocation.lat - current.lat) * 0.08
        const nextLng = current.lng + (customerLocation.lng - current.lng) * 0.08
        return { lat: nextLat, lng: nextLng }
      })
    }, 4000)

    return () => clearInterval(intervalId)
  }, [booking, customerLocation, location])

  const showTripView = ['on_the_way', 'arrived', 'started'].includes(booking.status)

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs text-brand-text-secondary">{booking.id}</p>
          <h2 className="heading-lg">Navigate to Customer</h2>
          <p className="text-sm text-brand-text-secondary">{booking.customerName}</p>
        </div>
        <Badge tone={statusTone[booking.status]}>{statusLabels[booking.status]}</Badge>
      </div>

      {showTripView ? (
        <div className="overflow-hidden rounded-3xl border border-brand-accent/20 bg-white">
          <div className="h-[60vh] min-h-[360px]">
            <div ref={mapRef} className="h-full w-full" />
          </div>
          <div className="grid gap-4 border-t border-brand-accent/10 bg-white/95 p-5 md:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs text-brand-text-secondary">
                {routeLoading ? 'Loading route...' : 'Route ready'}
                {routeError ? <span className="text-amber-700">{routeError}</span> : null}
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-brand-text-secondary">Customer</p>
                <p className="text-lg font-semibold text-brand-primary">{booking.customerName}</p>
                <p className="text-sm text-brand-text-secondary">{booking.address}</p>
                <p className="text-xs text-brand-text-secondary">Category: {booking.category}</p>
                <a href={`tel:${booking.phone}`} className="text-xs font-semibold text-brand-primary">
                  {booking.phone}
                </a>
              </div>
              <div className="grid gap-2 text-sm text-brand-text-secondary sm:grid-cols-2">
                <div className="rounded-2xl border border-brand-accent/15 bg-white/80 px-3 py-2">
                  Distance: {distanceKm.toFixed(2)} km
                </div>
                <div className="rounded-2xl border border-brand-accent/15 bg-white/80 px-3 py-2">
                  ETA: {Math.max(5, Math.round(distanceKm * 6))} mins
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button onClick={handleLocation}>Update Location</Button>
                {booking.status === 'on_the_way' ? (
                  <Button onClick={() => markArrived(booking.id)}>Arrived</Button>
                ) : null}
              </div>
            </div>

            <div className="space-y-3">
              <Input
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Add quick notes"
              />
              {booking.status === 'arrived' ? (
                <div className="space-y-2">
                  <Input
                    label="Enter OTP"
                    placeholder="4-digit code"
                    value={otpInput}
                    onChange={(event) => setOtpInput(event.target.value)}
                    maxLength={6}
                  />
                  <Button
                    onClick={() => {
                      const ok = verifyOtp(booking.id, otpInput)
                      if (ok) setOtpInput('')
                    }}
                  >
                    Verify OTP
                  </Button>
                </div>
              ) : null}
              {booking.status === 'started' ? (
                <Button onClick={() => completeBooking(booking.id, booking.amount || 0)}>Complete</Button>
              ) : null}
            </div>
          </div>
        </div>
      ) : (
        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase text-brand-text-secondary">Customer</p>
              <p className="text-lg font-semibold text-brand-primary">{booking.customerName}</p>
              <p className="text-sm text-brand-text-secondary">{booking.address}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleLocation}>Update Location</Button>
              {booking.status === 'payment_confirmed' ? (
                <Button onClick={() => startTrip(booking.id)}>Start Trip</Button>
              ) : null}
            </div>
          </div>
        </Card>
      )}

      <Card className="p-5">
        <h3 className="text-sm font-semibold text-brand-primary">Timeline</h3>
        <div className="mt-4 grid gap-2 md:grid-cols-4">
          {bookingStatusOrder.map((status) => (
            <div
              key={status}
              className={`rounded-2xl px-3 py-2 text-xs font-semibold transition ${
                booking.status === status ? 'bg-brand-accent/20 text-brand-primary' : 'bg-white/70'
              }`}
            >
              {statusLabels[status]}
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

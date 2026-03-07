import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import L from 'leaflet'
import { useAuth } from '../context/AuthContext.jsx'
import { useTechApp } from '../context/TechAppContext.jsx'
import { bookingStatusOrder } from '../data/mockBookings.js'
import Button from '../components/ui/Button.jsx'
import Input from '../components/ui/Input.jsx'
import Card from '../components/ui/Card.jsx'
import Badge from '../components/ui/Badge.jsx'
import Modal from '../components/ui/Modal.jsx'
import Loader from '../components/ui/Loader.jsx'
import { Hourglass } from 'lucide-react'
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

const approvalStatusStyles = {
  APPROVED: 'bg-emerald-50 border border-emerald-200 text-emerald-700',
  PENDING: 'bg-yellow-50 border border-yellow-200 text-yellow-700',
  REJECTED: 'bg-rose-50 border border-rose-200 text-rose-700',
}

function MapPreview({ booking }) {
  const mapRef = useRef(null)
  const mapInstance = useRef(null)
  const location = booking?.location || { lat: 28.6139, lng: 77.209 }

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return

    mapInstance.current = L.map(mapRef.current, {
      zoomControl: false,
      attributionControl: false,
    }).setView([location.lat, location.lng], 13)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(mapInstance.current)

    L.marker([location.lat, location.lng], {
      icon: L.icon({
        iconUrl:
          'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
      }),
    }).addTo(mapInstance.current)

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove()
        mapInstance.current = null
      }
    }
  }, [location.lat, location.lng])

  return <div ref={mapRef} className="h-36 w-full overflow-hidden rounded-2xl border border-brand-accent/15" />
}

export default function Dashboard() {
  const { user } = useAuth()
  const {
    bookings,
    online,
    setOnline,
    updateStatus,
    updateBooking,
    completeBooking,
    acceptBooking,
    startTrip,
    markArrived,
    addToast,
  } = useTechApp()
  const isApproved = user?.status === 'APPROVED'
  const [activeStatus, setActiveStatus] = useState('all')
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [requestModalOpen, setRequestModalOpen] = useState(false)
  const [requestBooking, setRequestBooking] = useState(null)
  const [queueMinutes, setQueueMinutes] = useState('10')
  const requestTimeouts = useRef(new Map())
  const bookingsRef = useRef(bookings)
  const onlineRef = useRef(online)
  const requestModalOpenRef = useRef(false)

  useEffect(() => {
    const timeoutId = setTimeout(() => setIsLoading(false), 500)
    return () => clearTimeout(timeoutId)
  }, [])

  useEffect(() => {
    bookingsRef.current = bookings
  }, [bookings])

  useEffect(() => {
    onlineRef.current = online
  }, [online])

  useEffect(() => {
    requestModalOpenRef.current = requestModalOpen
  }, [requestModalOpen])

  useEffect(() => {
    return () => {
      requestTimeouts.current.forEach((timeoutId) => clearTimeout(timeoutId))
      requestTimeouts.current.clear()
    }
  }, [])

  const statusCounts = useMemo(() => {
    return bookings.reduce((acc, booking) => {
      acc[booking.status] = (acc[booking.status] || 0) + 1
      return acc
    }, {})
  }, [bookings])

  const categories = useMemo(() => {
    const all = bookings.map((booking) => booking.category)
    return ['all', ...Array.from(new Set(all))]
  }, [bookings])

  const requestedBookings = useMemo(() => {
    return bookings
      .filter((booking) => booking.status === 'requested')
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  }, [bookings])

  useEffect(() => {
    if (!isApproved || !online || requestModalOpen) return
    const nextRequest = requestedBookings[0]
    if (nextRequest) {
      setRequestBooking(nextRequest)
      setQueueMinutes('10')
      setRequestModalOpen(true)
    }
  }, [isApproved, online, requestModalOpen, requestedBookings])

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const matchesStatus = activeStatus === 'all' || booking.status === activeStatus
      const matchesSearch =
        booking.customerName.toLowerCase().includes(search.toLowerCase()) ||
        booking.address.toLowerCase().includes(search.toLowerCase()) ||
        booking.category.toLowerCase().includes(search.toLowerCase())
      const matchesCategory = categoryFilter === 'all' || booking.category === categoryFilter
      return matchesStatus && matchesSearch && matchesCategory
    })
  }, [activeStatus, bookings, categoryFilter, search])

  const openCompleteModal = (booking) => {
    setSelectedBooking(booking)
    setAmount(booking.amount ? String(booking.amount) : '')
    setModalOpen(true)
  }

  const handleComplete = () => {
    if (selectedBooking) {
      completeBooking(selectedBooking.id, amount)
    }
    setModalOpen(false)
    setSelectedBooking(null)
  }

  const closeRequestModal = () => {
    setRequestModalOpen(false)
    setRequestBooking(null)
  }

  const scheduleQueueReminder = (bookingId, minutes) => {
    const durationMs = Math.max(Number(minutes) || 0, 1) * 60000
    const timeoutId = setTimeout(() => {
      requestTimeouts.current.delete(bookingId)
      const booking = bookingsRef.current.find((item) => item.id === bookingId)
      if (!booking || booking.status !== 'queued') return
      updateStatus(bookingId, 'requested')
      if (onlineRef.current && isApproved && !requestModalOpenRef.current) {
        setRequestBooking({ ...booking, status: 'requested' })
        setQueueMinutes('10')
        setRequestModalOpen(true)
      }
    }, durationMs)
    requestTimeouts.current.set(bookingId, timeoutId)
  }

  const handleAcceptRequest = () => {
    if (!requestBooking) return
    acceptBooking(requestBooking.id)
    closeRequestModal()
  }

  const handleDeclineRequest = () => {
    if (!requestBooking) return
    updateStatus(requestBooking.id, 'cancelled')
    addToast({
      title: 'Request declined',
      message: 'Customer notified. Recorded call scheduled.',
      tone: 'warning',
    })
    closeRequestModal()
  }

  const handleQueueRequest = () => {
    if (!requestBooking) return
    const minutes = Number(queueMinutes) || 10
    updateBooking(requestBooking.id, {
      status: 'queued',
      queuedAt: new Date().toISOString(),
      queuedUntil: new Date(Date.now() + minutes * 60000).toISOString(),
      queueMinutes: minutes,
    })
    scheduleQueueReminder(requestBooking.id, minutes)
    closeRequestModal()
  }

  const actionButtons = (booking) => {
    const activeBooking = bookings.find((item) =>
      ['payment_confirmed', 'on_the_way', 'arrived', 'started'].includes(item.status),
    )
    const isActiveBooking = activeBooking?.id === booking.id
    const isLocked = activeBooking && !isActiveBooking

    switch (booking.status) {
      case 'requested':
        return isLocked ? (
          <Button variant="ghost" onClick={() => updateStatus(booking.id, 'queued')}>
            Queue
          </Button>
        ) : (
          <Button onClick={() => acceptBooking(booking.id)}>Accept</Button>
        )
      case 'payment_pending':
        return isLocked ? (
          <span className="text-xs font-semibold text-amber-700">Queued for payment</span>
        ) : (
          <span className="text-xs font-semibold text-amber-700">
            Waiting for payment
          </span>
        )
      case 'payment_confirmed':
        return isLocked ? (
          <span className="text-xs font-semibold text-amber-700">Queued after payment</span>
        ) : (
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-emerald-700">Payment received</span>
            <Link to={`/active/${booking.id}`} className="text-xs font-semibold text-brand-primary">
              Map
            </Link>
          </div>
        )
      case 'on_the_way':
        return isLocked ? (
          <span className="text-xs font-semibold text-amber-700">Active job running</span>
        ) : (
          <Button onClick={() => markArrived(booking.id)}>Arrived</Button>
        )
      case 'arrived':
        return isLocked ? (
          <span className="text-xs font-semibold text-amber-700">Active job running</span>
        ) : (
          <Link to={`/active/${booking.id}`} className="text-xs font-semibold text-brand-primary">
            Enter OTP
          </Link>
        )
      case 'started':
        return isLocked ? (
          <span className="text-xs font-semibold text-amber-700">Active job running</span>
        ) : (
          <Button onClick={() => openCompleteModal(booking)}>Complete</Button>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div>
              <h2 className="heading-lg">Dashboard</h2>
              <p className="text-sm text-brand-text-secondary">
                {isApproved
                  ? 'Track your live bookings and actions.'
                  : 'Review your application status and submitted details.'}
              </p>
            </div>
            {user?.status && (
              <div
                className={`rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap ${approvalStatusStyles[user.status]}`}
              >
                {user.status === 'APPROVED' && '✓ Approved'}
                {user.status === 'PENDING' && <span className="flex items-center"><Hourglass size={16} className="inline mr-1" /> Pending Review</span>}
                {user.status === 'REJECTED' && '✕ Rejected'}
              </div>
            )}
          </div>
        </div>
        {isApproved && (
          <div className="flex flex-col gap-3 md:items-end">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setOnline((prev) => !prev)}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition ${online ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-700'
                  }`}
              >
                {online ? 'Online' : 'Offline'}
              </button>
              <div className="rounded-full bg-white/80 px-4 py-2 text-xs font-semibold text-brand-primary">
                New Requests: {requestedBookings.length}
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Input
                placeholder="Search by name, address, category"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="min-w-[220px]"
              />
              <select
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
                className="rounded-2xl border border-brand-accent/20 bg-white/80 px-4 py-2 text-sm"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All categories' : category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {!isApproved && (
        <div className="rounded-2xl border border-brand-accent/20 bg-white/80 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-base font-semibold text-brand-primary">Your Application Details</h3>
            <span className="rounded-full bg-yellow-50 px-3 py-1 text-xs font-semibold text-yellow-700 flex items-center">
              {user?.status === 'REJECTED' ? '✕ Rejected' : <><Hourglass size={16} className="inline mr-1" /> Pending Approval</>}
            </span>
          </div>
          {user?.status === 'REJECTED' && user?.rejectionReason ? (
            <p className="mt-2 text-xs text-rose-600">Reason: {user.rejectionReason}</p>
          ) : null}
          <div className="mt-3 grid gap-2 text-sm text-brand-text-secondary">
            <div className="flex justify-between">
              <span>Name</span>
              <span className="font-medium text-brand-primary">{user?.name || 'Not provided'}</span>
            </div>
            <div className="flex justify-between">
              <span>Mobile</span>
              <span className="font-medium text-brand-primary">{user?.phone || 'Not provided'}</span>
            </div>
            <div className="flex justify-between">
              <span>Email</span>
              <span className="font-medium text-brand-primary">{user?.email || 'Not provided'}</span>
            </div>
            <div className="flex justify-between">
              <span>Primary Skill</span>
              <span className="font-medium text-brand-primary">{user?.skills?.[0] || 'Not provided'}</span>
            </div>
            <div className="flex justify-between">
              <span>Experience</span>
              <span className="font-medium text-brand-primary">{user?.experience || 'Not provided'}</span>
            </div>
            <div className="flex justify-between">
              <span>Service Radius</span>
              <span className="font-medium text-brand-primary">
                {user?.radiusKm ? `${user.radiusKm} km` : 'Not provided'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Base Visit Fee</span>
              <span className="font-medium text-brand-primary">
                {user?.baseVisitFee ? `₹${user.baseVisitFee}` : 'Not provided'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Has Shop</span>
              <span className="font-medium text-brand-primary">{user?.hasShop ? 'Yes' : 'No'}</span>
            </div>
            <div className="flex justify-between">
              <span>Shop Name</span>
              <span className="font-medium text-brand-primary">{user?.shopName || 'Not provided'}</span>
            </div>
            <div className="flex justify-between">
              <span>Shop Address</span>
              <span className="font-medium text-brand-primary">{user?.shopAddress || 'Not provided'}</span>
            </div>
            <div className="flex justify-between">
              <span>Service Area</span>
              <span className="font-medium text-brand-primary">{user?.serviceArea || 'Not provided'}</span>
            </div>
            <div className="flex justify-between">
              <span>Aadhaar Number</span>
              <span className="font-medium text-brand-primary">{user?.aadhaarNumber || 'Not provided'}</span>
            </div>
            <div className="flex justify-between">
              <span>Aadhaar Front</span>
              <span className="font-medium text-brand-primary">
                {user?.aadhaarFrontUrl ? 'Uploaded' : 'Not provided'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Aadhaar Back</span>
              <span className="font-medium text-brand-primary">
                {user?.aadhaarBackUrl ? 'Uploaded' : 'Not provided'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Selfie</span>
              <span className="font-medium text-brand-primary">
                {user?.selfieUrl ? 'Uploaded' : 'Not provided'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Application ID</span>
              <span className="font-medium text-brand-primary">{user?.id || 'Not provided'}</span>
            </div>
            <div className="flex justify-between">
              <span>Submitted On</span>
              <span className="font-medium text-brand-primary">
                {user?.createdAt ? new Date(user.createdAt).toLocaleString() : 'Not provided'}
              </span>
            </div>
          </div>
        </div>
      )}

      {isApproved && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveStatus('all')}
            className={`rounded-full px-4 py-2 text-xs font-semibold transition ${activeStatus === 'all' ? 'bg-brand-accent/20 text-brand-primary' : 'bg-white/70'
              }`}
          >
            All ({bookings.length})
          </button>
          {bookingStatusOrder.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setActiveStatus(status)}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition ${activeStatus === status ? 'bg-brand-accent/20 text-brand-primary' : 'bg-white/70'
                }`}
            >
              {statusLabels[status]} ({statusCounts[status] || 0})
            </button>
          ))}
        </div>
      )}

      {isApproved && (
        <>
          {isLoading ? (
            <Card className="p-6">
              <Loader lines={4} />
            </Card>
          ) : filteredBookings.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-sm text-brand-text-secondary">No bookings match your filters.</p>
            </Card>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {filteredBookings.map((booking) => (
                <Card key={booking.id} className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs text-brand-text-secondary">{booking.id}</p>
                      <h3 className="text-lg font-semibold text-brand-primary">{booking.customerName}</h3>
                      <p className="text-sm text-brand-text-secondary">{booking.address}</p>
                    </div>
                    <Badge tone={statusTone[booking.status]}>{statusLabels[booking.status]}</Badge>
                  </div>
                  <div className="mt-4 grid gap-2 text-sm text-brand-text-secondary">
                    <p>Category: {booking.category}</p>
                    <p>ETA: {booking.etaMins} mins</p>
                    <p>Distance: {booking.distanceKm} km</p>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    {actionButtons(booking)}
                    <Link to={`/job/${booking.id}`} className="text-xs font-semibold text-brand-primary">
                      View details
                    </Link>
                  </div>
                  {booking.status === 'payment_confirmed' ? (
                    <div className="mt-4">
                      <MapPreview booking={booking} />
                    </div>
                  ) : null}
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      <Modal
        isOpen={requestModalOpen}
        title="New Booking Invitation"
        onClose={closeRequestModal}
        actions={
          <>
            <Button variant="ghost" onClick={handleDeclineRequest}>
              Decline
            </Button>
            <Button variant="ghost" onClick={handleQueueRequest}>
              Queue
            </Button>
            <Button onClick={handleAcceptRequest}>Accept</Button>
          </>
        }
      >
        {requestBooking ? (
          <div className="space-y-4 text-sm text-brand-text-secondary">
            <div>
              <p className="text-xs text-brand-text-secondary">{requestBooking.id}</p>
              <h3 className="text-lg font-semibold text-brand-primary">{requestBooking.customerName}</h3>
              <p>{requestBooking.address}</p>
            </div>
            <div className="grid gap-2">
              <p>Category: {requestBooking.category}</p>
              <p>ETA: {requestBooking.etaMins} mins</p>
              <p>Distance: {requestBooking.distanceKm} km</p>
              {requestBooking.notes ? <p>Notes: {requestBooking.notes}</p> : null}
            </div>
            <div>
              <label className="text-xs font-semibold text-brand-primary">Queue for</label>
              <select
                value={queueMinutes}
                onChange={(event) => setQueueMinutes(event.target.value)}
                className="mt-2 w-full rounded-xl border border-brand-accent/20 bg-white px-3 py-2 text-sm"
              >
                <option value="5">5 minutes</option>
                <option value="10">10 minutes</option>
                <option value="15">15 minutes</option>
              </select>
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal
        isOpen={modalOpen}
        title="Complete Job"
        onClose={() => setModalOpen(false)}
        actions={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleComplete}>Confirm</Button>
          </>
        }
      >
        <p className="mb-4 text-sm text-brand-text-secondary">Enter the amount collected.</p>
        <Input
          type="number"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          placeholder="Amount"
        />
      </Modal>
    </div>
  )
}

import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTechApp } from '../context/TechAppContext.jsx'
import { bookingStatusOrder } from '../data/mockBookings.js'
import Card from '../components/ui/Card.jsx'
import Input from '../components/ui/Input.jsx'
import Badge from '../components/ui/Badge.jsx'
import Loader from '../components/ui/Loader.jsx'

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

export default function Jobs() {
  const { bookings } = useTechApp()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortOption, setSortOption] = useState('newest')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timeoutId = setTimeout(() => setLoading(false), 500)
    return () => clearTimeout(timeoutId)
  }, [])

  const sortedBookings = useMemo(() => {
    const filtered = bookings.filter((booking) => {
      const matchesStatus = statusFilter === 'all' || booking.status === statusFilter
      const matchesSearch =
        booking.customerName.toLowerCase().includes(search.toLowerCase()) ||
        booking.address.toLowerCase().includes(search.toLowerCase()) ||
        booking.category.toLowerCase().includes(search.toLowerCase())
      return matchesStatus && matchesSearch
    })

    return filtered.sort((a, b) => {
      if (sortOption === 'newest') return b.createdAt.localeCompare(a.createdAt)
      if (sortOption === 'oldest') return a.createdAt.localeCompare(b.createdAt)
      if (sortOption === 'distance') return a.distanceKm - b.distanceKm
      if (sortOption === 'amount') return (b.amount || 0) - (a.amount || 0)
      return 0
    })
  }, [bookings, search, sortOption, statusFilter])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="heading-lg">Jobs</h2>
        <p className="text-sm text-brand-text-secondary">Browse and filter all bookings.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Search bookings"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="min-w-[220px]"
        />
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="rounded-2xl border border-brand-accent/20 bg-white/80 px-4 py-2 text-sm"
        >
          <option value="all">All statuses</option>
          {bookingStatusOrder.map((status) => (
            <option key={status} value={status}>
              {statusLabels[status]}
            </option>
          ))}
        </select>
        <select
          value={sortOption}
          onChange={(event) => setSortOption(event.target.value)}
          className="rounded-2xl border border-brand-accent/20 bg-white/80 px-4 py-2 text-sm"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="distance">Closest distance</option>
          <option value="amount">Highest amount</option>
        </select>
      </div>

      {loading ? (
        <Card className="p-6">
          <Loader lines={5} />
        </Card>
      ) : sortedBookings.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-sm text-brand-text-secondary">No jobs found for this filter.</p>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {sortedBookings.map((booking) => (
            <Card key={booking.id} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs text-brand-text-secondary">{booking.id}</p>
                  <h3 className="text-lg font-semibold text-brand-primary">{booking.customerName}</h3>
                  <p className="text-sm text-brand-text-secondary">{booking.category}</p>
                </div>
                <Badge tone={statusTone[booking.status]}>{statusLabels[booking.status]}</Badge>
              </div>
              <div className="mt-4 text-sm text-brand-text-secondary">
                <p>{booking.address}</p>
                <p>Distance: {booking.distanceKm} km</p>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <Link to={`/job/${booking.id}`} className="text-xs font-semibold text-brand-primary">
                  View details
                </Link>
                {booking.amount ? (
                  <span className="text-xs font-semibold text-brand-primary">${booking.amount}</span>
                ) : null}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

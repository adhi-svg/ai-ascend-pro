import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTechApp } from '../context/TechAppContext.jsx'
import Button from '../components/ui/Button.jsx'
import Card from '../components/ui/Card.jsx'
import Badge from '../components/ui/Badge.jsx'
import Input from '../components/ui/Input.jsx'

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

export default function JobDetails() {
  const { bookingId } = useParams()
  const {
    bookings,
    acceptBooking,
    startTrip,
    markArrived,
    verifyOtp,
  } = useTechApp()
  const booking = bookings.find((item) => item.id === bookingId)
  const [otpInput, setOtpInput] = useState('')

  if (!booking) {
    return (
      <Card className="p-8 text-center">
        <p className="text-sm text-brand-text-secondary">Booking not found.</p>
        <Link to="/jobs" className="mt-4 inline-block text-xs font-semibold text-brand-primary">
          Back to jobs
        </Link>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-brand-text-secondary">{booking.id}</p>
          <h2 className="heading-lg">{booking.customerName}</h2>
        </div>
        <Badge tone={statusTone[booking.status]}>{statusLabels[booking.status]}</Badge>
      </div>

      <Card className="p-6">
        <div className="grid gap-4 text-sm text-brand-text-secondary md:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase">Address</p>
            <p>{booking.address}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase">Category</p>
            <p>{booking.category}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase">Phone</p>
            <a href={`tel:${booking.phone}`} className="text-brand-primary">
              {booking.phone}
            </a>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase">Notes</p>
            <p>{booking.notes}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase">ETA</p>
            <p>{booking.etaMins} mins</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase">Distance</p>
            <p>{booking.distanceKm} km</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-sm font-semibold text-brand-primary">Actions</h3>
        <div className="mt-4 flex flex-wrap gap-3">
          {booking.status === 'requested' ? (
            <Button onClick={() => acceptBooking(booking.id)}>Accept</Button>
          ) : null}
          {booking.status === 'payment_pending' ? (
            <span className="text-xs font-semibold text-amber-700">Waiting for payment</span>
          ) : null}
          {booking.status === 'payment_confirmed' ? (
            <Link to={`/active/${booking.id}`} className="text-xs font-semibold text-brand-primary">
              Map
            </Link>
          ) : null}
          {booking.status === 'on_the_way' ? (
            <Button onClick={() => markArrived(booking.id)}>Arrived</Button>
          ) : null}
          {['on_the_way', 'arrived', 'started'].includes(booking.status) ? (
            <Link to={`/active/${booking.id}`} className="text-xs font-semibold text-brand-primary">
              Open active job
            </Link>
          ) : null}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-sm font-semibold text-brand-primary">OTP Verification</h3>
        {booking.status === 'arrived' ? (
          <div className="mt-3 space-y-3">
            <Input
              label="Enter customer OTP"
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
        ) : (
          <div className="mt-3 flex items-center gap-4">
            <Badge tone="info">{booking.otp || 'Not assigned'}</Badge>
            <span className="text-xs text-brand-text-secondary">OTP appears after arrival.</span>
          </div>
        )}
      </Card>
    </div>
  )
}

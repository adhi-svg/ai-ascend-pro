import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import PaymentModal from '../components/PaymentModal'
import { useApp } from '../context/AppContext'

const statusColors = {
  waiting: 'warning',
  accepted: 'brand',
  enroute: 'brand',
  arrived: 'success',
  completed: 'success',
}

const BookingStatus = () => {
  const { jobs, setJobs, setToast } = useApp()
  const navigate = useNavigate()
  const active = jobs.slice(-1)[0]

  // Countdown timer state (10 minutes = 600 seconds)
  const [timeLeft, setTimeLeft] = useState(600)
  const [isCancelled, setIsCancelled] = useState(false)
  const [autoAccepted, setAutoAccepted] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentDone, setPaymentDone] = useState(false)

  // Reset view when booking changes
  useEffect(() => {
    setTimeLeft(600)
    setIsCancelled(false)
    setShowPaymentModal(false)
    setPaymentDone(active?.paymentStatus === 'paid')
    if (active?.status === 'accepted' || active?.status === 'enroute') {
      setAutoAccepted(true)
    } else {
      setAutoAccepted(false)
    }
  }, [active?.id, active?.status, active?.paymentStatus])

  useEffect(() => {
    if (!active || active.status !== 'waiting' || isCancelled) return

    // Auto-accept after 3 seconds for demo
    const autoAcceptTimer = setTimeout(() => {
      setAutoAccepted(true)
      // Update job status to accepted
      setJobs((prev) =>
        prev.map((job) =>
          job.id === active.id
            ? { ...job, status: 'accepted' }
            : job
        )
      )
      // Show success notification
      setToast({ message: `🎉 ${active.technicianName} accepted your booking!`, type: 'success' })
    }, 3000)

    return () => clearTimeout(autoAcceptTimer)
  }, [active, isCancelled, setJobs, setToast])

  useEffect(() => {
    if (!active || active.status !== 'waiting' || isCancelled || autoAccepted) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [active, isCancelled, autoAccepted])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleCancelBooking = () => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      setIsCancelled(true)
      setTimeout(() => {
        navigate('/customer/home')
      }, 2000)
    }
  }

  const handlePaymentSuccess = () => {
    setPaymentDone(true)
    setShowPaymentModal(false)
    setJobs((prev) => prev.map((job) => (
      job.id === active.id
        ? {
          ...job,
          paymentStatus: 'paid',
          journeyStatus: 'enroute',
          status: job.status === 'waiting' ? 'accepted' : job.status,
        }
        : job
    )))
    setToast({ message: '💳 Payment successful! Tracking technician...', type: 'success' })
    setTimeout(() => {
      navigate('/customer/tracking')
    }, 1500)
  }

  if (!active) {
    return <EmptyState title="No Active Booking" />
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#050014] via-[#09021f] to-[#1a0636] p-4 pb-20 text-brand-text-primary">
      {/* Header */}
      <div className="sticky top-0 z-40 glass-panel rounded-b-3xl border border-white/15 p-6 mb-6">
        <button
          onClick={() => navigate('/customer/home')}
          className="text-2xl mb-4 text-white/80 hover:text-white"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-bold text-brand-text-primary">Booking Status</h1>
        <p className="text-brand-text-muted mt-1">Service: {active.service}</p>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Waiting State */}
        {active.status === 'waiting' && !isCancelled && !autoAccepted && (
          <div className="glass-panel border border-white/15 p-8 text-center space-y-6">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center animate-pulse">
              <span className="text-4xl">⏳</span>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-brand-text-primary mb-2">Booking Sent!</h2>
              <p className="text-lg text-brand-text-secondary mb-1">Waiting for {active.technicianName} to accept</p>
              <p className="text-sm text-brand-text-muted">You will be notified once the technician responds</p>
            </div>

            {/* Auto-accept notification */}
            {autoAccepted && (
              <div className="bg-gradient-to-r from-emerald-500/20 to-teal-400/10 border border-emerald-400/40 rounded-xl p-4 animate-pulse">
                <p className="text-lg font-bold text-green-800">✓ Booking Accepted!</p>
                <p className="text-sm text-green-700 mt-1">Technician {active.technicianName} has accepted your booking</p>
              </div>
            )}

            {/* Countdown Timer */}
            <div className="bg-gradient-to-r from-brand-secondary/30 via-brand-secondary/10 to-brand-accent/10 rounded-2xl p-6 border border-white/10">
              <p className="text-sm font-semibold text-brand-text-secondary mb-2">Time remaining</p>
              <div className="text-5xl font-bold text-brand-primary mb-2">
                {formatTime(timeLeft)}
              </div>
              <p className="text-xs text-white/70">
                {timeLeft === 0 ? 'Request expired' : 'Request will expire automatically'}
              </p>
              {timeLeft === 0 && (
                <Button
                  onClick={() => navigate('/customer/home')}
                  className="mt-4"
                >
                  Back to Home
                </Button>
              )}
            </div>

            {/* Booking Details */}
            <div className="card-base p-4 text-left">
              <p className="text-sm font-semibold text-brand-text-primary mb-3">Booking Details</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-brand-text-muted">Technician:</span>
                  <span className="font-semibold text-brand-text-primary">{active.technicianName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-text-muted">Amount:</span>
                  <span className="font-semibold text-brand-text-primary">₹{active.amount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-brand-text-muted">Status:</span>
                  <Badge tone={statusColors[active.status]}>{active.status}</Badge>
                </div>
              </div>
            </div>

            {/* Cancel Button */}
            {timeLeft > 0 && (
              <Button
                variant="secondary"
                onClick={handleCancelBooking}
                className="w-full border border-brand-danger/50 bg-brand-danger/10 text-brand-danger hover:bg-brand-danger/20"
              >
                🚫 Cancel Booking Request
              </Button>
            )}
          </div>
        )}

        {/* Accepted State */}
        {(active.status === 'accepted' || active.status === 'enroute') && !isCancelled && (
          <div className="glass-panel border border-white/15 p-8 space-y-6">
            <div className="text-center space-y-4">
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-green-400 to-emerald-400 rounded-full flex items-center justify-center animate-bounce">
                <span className="text-5xl">✓</span>
              </div>

              <div>
                <h2 className="text-3xl font-bold text-brand-text-primary mb-2">Booking Accepted!</h2>
                <p className="text-lg text-brand-text-secondary">Complete payment to start the service</p>
              </div>
            </div>

            {/* Technician Details */}
            <div className="bg-gradient-to-r from-brand-secondary/30 via-brand-secondary/10 to-brand-accent/10 rounded-2xl p-6 space-y-3 border border-white/10">
              <h3 className="font-bold text-brand-text-primary text-lg">Technician Details</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-brand-text-muted">Name:</span>
                  <span className="font-semibold text-brand-text-primary">{active.technicianName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-text-muted">Phone:</span>
                  <span className="font-semibold text-brand-text-primary">{active.technicianPhone || '+91-8888888888'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-text-muted">Rating:</span>
                  <span className="font-semibold text-yellow-600">★ {active.rating || 4.8}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-text-muted">Status:</span>
                  {paymentDone ? (
                    <span className="inline-block bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-sm font-semibold">🟢 On the way</span>
                  ) : (
                    <span className="inline-block bg-amber-500/20 text-amber-200 px-3 py-1 rounded-full text-sm font-semibold">🟡 Waiting for Payment</span>
                  )}
                </div>
              </div>
            </div>

            {/* Payment Information */}
            {!paymentDone && (
              <div className="bg-gradient-to-r from-brand-danger/20 via-brand-danger/10 to-brand-accent/10 rounded-2xl p-6 border border-brand-danger/40">
                <p className="font-bold text-brand-text-primary mb-3">⚠️ Payment Pending</p>
                <p className="text-sm text-brand-text-secondary mb-4">Technician will start their journey only after you complete the payment</p>
                <div className="flex justify-between items-center rounded-2xl border border-white/10 bg-white/5 p-3">
                  <span className="font-semibold text-brand-text-primary">Total Amount:</span>
                  <span className="text-xl font-bold text-brand-neon">₹{active.amount}</span>
                </div>
              </div>
            )}

            {paymentDone && (
              <div className="bg-gradient-to-r from-emerald-500/20 to-teal-400/15 rounded-2xl p-6 border border-emerald-400/40">
                <p className="font-bold text-brand-text-primary mb-3">✓ Payment Successful!</p>
                <p className="text-sm text-brand-text-secondary">Technician {active.technicianName} is starting their journey towards you. You can track them on the map.</p>
              </div>
            )}

            {/* What's Next */}
            <div className="space-y-3">
              <p className="font-bold text-brand-text-primary">What's Next?</p>
              <ul className="space-y-2">
                <li className="flex items-start gap-3">
                  <span className="bg-white/10 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">1</span>
                  <span className={`text-brand-text-secondary ${paymentDone ? 'line-through text-emerald-400' : ''}`}>{paymentDone ? '✓ Payment confirmed' : 'Complete payment'}</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-white/10 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">2</span>
                  <span className="text-brand-text-secondary">Technician will start their journey</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-white/10 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">3</span>
                  <span className="text-brand-text-secondary">Track technician location on map</span>
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/30">
              <Button
                onClick={() => navigate('/customer/home')}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
              >
                Back to Home
              </Button>
              <Button
                onClick={() => paymentDone ? navigate('/customer/tracking') : setShowPaymentModal(true)}
                className={`${paymentDone ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700' : 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700'}`}
              >
                {paymentDone ? '🗺️ Track Technician' : '💳 Proceed for Payment'}
              </Button>
            </div>
          </div>
        )}

        {/* Cancelled State */}
        {isCancelled && (
          <div className="glass-panel border border-brand-danger/30 p-8 text-center space-y-6">
            <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-4xl">✕</span>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-brand-danger mb-2">Booking Cancelled</h2>
              <p className="text-brand-text-secondary">Your booking request has been cancelled</p>
            </div>

            <Button
              onClick={() => navigate('/customer/home')}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
            >
              Back to Home
            </Button>
          </div>
        )}

        {/* Other states */}
        {(active.status !== 'waiting' && active.status !== 'accepted') && !isCancelled && (
          <div className="space-y-4">
            <div className="glass-panel rounded-2xl p-5 border border-white/15">
              <p className="text-xs uppercase tracking-[0.2em] text-brand-muted">Booking status</p>
              <h2 className="text-xl font-bold text-brand-primary">{active.technicianName}</h2>
              <p className="text-sm text-brand-text-muted">Service: {active.service}</p>
              <Badge tone={statusColors[active.status] || 'neutral'}> {active.status}</Badge>
            </div>
            <div className="card-base rounded-2xl p-5 border border-white/10">
              <p className="text-sm font-semibold text-brand-text-primary">What happens next?</p>
              <ul className="mt-3 space-y-2 text-sm text-brand-text-muted">
                <li>• Waiting: Technician will accept and call.</li>
                <li>• Accepted: Complete payment for technician to start journey.</li>
                <li>• En route: Technician on the way, you can track location.</li>
              </ul>
            </div>
            <div className="space-y-2 rounded-2xl card-base p-5 border border-white/10">
              <p className="text-sm font-semibold text-brand-text-primary">Technician details</p>
              <p className="text-sm text-brand-text-muted">Name: {active.technicianName}</p>
              <p className="text-sm text-brand-text-muted">Status: {active.status}</p>
            </div>
            <Link to="/customer/completion" className="text-sm font-semibold text-brand-accent">
              Enter OTP to mark job complete
            </Link>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          booking={active}
          onPaymentSuccess={handlePaymentSuccess}
          onClose={() => setShowPaymentModal(false)}
        />
      )}
    </div>
  )
}

export default BookingStatus

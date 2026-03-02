import { useState, useEffect } from 'react'
import Button from './ui/Button'

const NotificationModal = ({ notification, onDismiss, onAccept }) => {
  const [autoHide, setAutoHide] = useState(false)

  useEffect(() => {
    if (!notification) return

    // Auto-dismiss after 8 seconds
    const timer = setTimeout(() => {
      setAutoHide(true)
      setTimeout(() => onDismiss(), 500)
    }, 8000)

    return () => clearTimeout(timer)
  }, [notification, onDismiss])

  if (!notification) return null

  const booking = notification.booking || {}

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ${
          autoHide ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
        onClick={onDismiss}
      />

      {/* Modal */}
      <div
        className={`fixed inset-x-4 top-20 z-50 max-w-md mx-auto bg-white rounded-3xl shadow-2xl transform transition-all duration-300 ${
          autoHide ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
        }`}
      >
        {/* Header with accent */}
        <div className="bg-gradient-to-r from-brand-primary to-brand-accent p-6 text-white rounded-t-3xl">
          <div className="flex items-start gap-3">
            <div className="text-4xl animate-bounce">🔔</div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{notification.title}</h2>
              <p className="text-sm opacity-90 mt-1">{notification.message}</p>
            </div>
          </div>
        </div>

        {/* Booking Details */}
        <div className="p-6 space-y-4 bg-slate-50">
          {/* Customer Info */}
          <div className="bg-white rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">👤 Customer</span>
              <span className="font-semibold text-slate-900">{booking.customerName || 'New Customer'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">📍 Distance</span>
              <span className="font-semibold text-slate-900">{booking.distance?.toFixed(1) || '—'} km</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">🔧 Service</span>
              <span className="font-semibold text-slate-900">{booking.service || 'General Service'}</span>
            </div>
          </div>

          {/* Issue & Amount */}
          {booking.details && (
            <div className="bg-white rounded-xl p-4">
              <p className="text-xs text-slate-600 mb-1">Issue Description</p>
              <p className="text-sm font-medium text-slate-800 line-clamp-2">{booking.details}</p>
            </div>
          )}

          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
            <p className="text-xs text-slate-600">Amount to be Paid</p>
            <p className="text-3xl font-bold text-green-600 mt-1">₹{booking.amount || booking.confirmationCharge || 99}</p>
            <p className="text-xs text-slate-500 mt-1">Upon confirmation</p>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 bg-white border-t border-slate-100 rounded-b-3xl space-y-3">
          <Button
            onClick={() => {
              onAccept(booking)
              onDismiss()
            }}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold"
          >
            ✓ Accept Booking
          </Button>
          <button
            onClick={onDismiss}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
          >
            Dismiss
          </button>
        </div>

        {/* Auto-dismiss indicator */}
        <div className="h-1 bg-slate-200 rounded-b-3xl overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-brand-primary to-brand-accent"
            style={{
              animation: 'shrink 8s linear forwards',
            }}
          />
        </div>

        <style>{`
          @keyframes shrink {
            from { width: 100%; }
            to { width: 0%; }
          }
        `}</style>
      </div>
    </>
  )
}

export default NotificationModal

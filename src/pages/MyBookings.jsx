import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

const statusColors = {
    pending: 'bg-amber-100 text-amber-700',
    assigned: 'bg-blue-100 text-blue-700',
    confirmed: 'bg-blue-100 text-blue-700',
    in_progress: 'bg-indigo-100 text-indigo-700',
    completed: 'bg-emerald-100 text-emerald-700',
    cancelled: 'bg-rose-100 text-rose-700',
    failed: 'bg-red-100 text-red-700',
}

const formatDate = (dateStr) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}

const MyBookings = () => {
    const { jobs, user } = useApp()
    const navigate = useNavigate()
    const [filter, setFilter] = useState('all')

    const bookings = filter === 'all' ? jobs : jobs.filter((j) => j.status === filter)

    if (!user) {
        navigate('/login')
        return null
    }

    return (
        <div className="space-y-4">
            <div className="rounded-2xl bg-white p-5 shadow-sm">
                <p className="text-xs uppercase tracking-[0.2em] text-brand-muted">My Bookings</p>
                <h2 className="text-xl font-bold text-brand-primary">Service History</h2>
            </div>

            <div className="flex flex-wrap gap-2">
                {['all', 'pending', 'assigned', 'in_progress', 'completed', 'cancelled'].map((status) => (
                    <button
                        key={status}
                        type="button"
                        onClick={() => setFilter(status)}
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${filter === status
                                ? 'bg-[#E6A11A] text-white shadow-md'
                                : 'border border-[#1E3A5F]/20 text-[#1E3A5F] hover:border-[#1E3A5F]'
                            }`}
                    >
                        {status === 'all' ? 'All' : status.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                    </button>
                ))}
            </div>

            {bookings.length === 0 ? (
                <div className="rounded-2xl border border-[#E6A11A]/20 bg-white/90 p-6 text-center text-sm text-gray-600">
                    No bookings found.
                </div>
            ) : (
                <div className="space-y-3">
                    {bookings.map((booking) => (
                        <div
                            key={booking.id}
                            className="cursor-pointer rounded-2xl bg-white border border-[#E6A11A]/10 p-4 shadow-sm transition-all hover:shadow-md hover:border-[#E6A11A]/30"
                            onClick={() => navigate(`/customer/status`, { state: { bookingId: booking.id } })}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-[#1E3A5F]">
                                        {booking.service_name || booking.category?.name || booking.category_id || 'Service'}
                                    </p>
                                    <p className="mt-0.5 text-xs text-gray-500">
                                        {formatDate(booking.created_at || booking.createdAt)}
                                    </p>
                                </div>
                                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColors[booking.status] || 'bg-gray-100 text-gray-600'}`}>
                                    {(booking.status || 'unknown').replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                                </span>
                            </div>
                            {booking.address && (
                                <p className="mt-2 text-xs text-gray-500 truncate">📍 {booking.address}</p>
                            )}
                            {booking.estimated_cost && (
                                <p className="mt-1 text-xs text-[#E6A11A] font-semibold">₹{booking.estimated_cost}</p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default MyBookings

import { useState } from 'react'
import { MapPin, Clock, DollarSign, User, Phone, CheckCircle } from 'lucide-react'

const TechnicianRequests = () => {
  const [filter, setFilter] = useState('all') // all, urgent, nearby

  const requests = [
    { 
      id: 1, 
      service: 'AC Installation & Repair', 
      customer: 'Rajesh Kumar',
      phone: '+91 98765 43210',
      location: 'MG Road, Sector 14, Bangalore', 
      distance: '2.3 km',
      time: '5 mins ago', 
      price: '₹500-800', 
      urgent: true,
      description: 'AC not cooling properly. Need urgent service.'
    },
    { 
      id: 2, 
      service: 'Plumbing - Leak Repair', 
      customer: 'Priya Singh',
      phone: '+91 98123 45678',
      location: 'Park Street, Block B, Indiranagar', 
      distance: '1.8 km',
      time: '12 mins ago', 
      price: '₹300-500', 
      urgent: false,
      description: 'Kitchen sink leaking. Need repair within today.'
    },
    { 
      id: 3, 
      service: 'Electrical Wiring Issue', 
      customer: 'Amit Sharma',
      phone: '+91 99887 76543',
      location: 'Brigade Road, Bangalore', 
      distance: '3.1 km',
      time: '18 mins ago', 
      price: '₹400-600', 
      urgent: false,
      description: 'Main switchboard issue. Power fluctuations.'
    },
    { 
      id: 4, 
      service: 'Refrigerator Repair', 
      customer: 'Neha Patel',
      phone: '+91 91234 56789',
      location: 'Whitefield, Bangalore', 
      distance: '5.2 km',
      time: '25 mins ago', 
      price: '₹600-1000', 
      urgent: true,
      description: 'Fridge not cooling. Urgent repair needed.'
    },
    { 
      id: 5, 
      service: 'Washing Machine Service', 
      customer: 'Vikram Reddy',
      phone: '+91 98765 12345',
      location: 'Koramangala, 5th Block', 
      distance: '4.5 km',
      time: '32 mins ago', 
      price: '₹400-700', 
      urgent: false,
      description: 'Washing machine making noise. Need checkup.'
    },
  ]

  const filteredRequests = requests.filter(req => {
    if (filter === 'urgent') return req.urgent
    if (filter === 'nearby') return parseFloat(req.distance) < 3
    return true
  })

  const handleAcceptRequest = (request) => {
    alert(`Accepting request from ${request.customer} for ${request.service}`)
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Nearby Requests</h1>
        <p className="text-white/60">Browse and accept job requests near you</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
            filter === 'all'
              ? 'bg-[#E6A11A] text-white'
              : 'bg-[#25282f] text-white/70 border border-white/10 hover:bg-white/5'
          }`}
        >
          All ({requests.length})
        </button>
        <button
          onClick={() => setFilter('urgent')}
          className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
            filter === 'urgent'
              ? 'bg-[#E6A11A] text-white'
              : 'bg-[#25282f] text-white/70 border border-white/10 hover:bg-white/5'
          }`}
        >
          Urgent ({requests.filter(r => r.urgent).length})
        </button>
        <button
          onClick={() => setFilter('nearby')}
          className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
            filter === 'nearby'
              ? 'bg-[#E6A11A] text-white'
              : 'bg-[#25282f] text-white/70 border border-white/10 hover:bg-white/5'
          }`}
        >
          Nearby (&lt;3km)
        </button>
      </div>

      {/* Request Cards */}
      <div className="space-y-4">
        {filteredRequests.map((request) => (
          <div
            key={request.id}
            className="bg-[#25282f] rounded-xl p-5 md:p-6 border border-white/10 hover:border-[#E6A11A]/30 transition-all duration-300"
          >
            <div className="flex flex-col lg:flex-row lg:items-start gap-4">
              {/* Main Content */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-xl font-bold mb-1">{request.service}</h3>
                    <div className="flex items-center gap-2 text-sm text-white/60">
                      <User size={14} />
                      <span>{request.customer}</span>
                      {request.urgent && (
                        <span className="ml-2 px-2 py-0.5 bg-red-500/20 text-red-400 text-xs font-medium rounded-full border border-red-500/30">
                          Urgent
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <p className="text-white/70 mb-4 text-sm">{request.description}</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-white/60">
                    <MapPin size={16} className="text-[#E6A11A] flex-shrink-0" />
                    <span className="truncate">{request.distance}</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/60">
                    <Clock size={16} className="text-[#E6A11A] flex-shrink-0" />
                    <span>{request.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/60">
                    <DollarSign size={16} className="text-[#E6A11A] flex-shrink-0" />
                    <span>{request.price}</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/60">
                    <Phone size={16} className="text-[#E6A11A] flex-shrink-0" />
                    <span className="truncate">{request.phone}</span>
                  </div>
                </div>

                <div className="mt-3 p-3 bg-[#1a1d24] rounded-lg border border-white/5">
                  <p className="text-xs text-white/50 mb-1">Location</p>
                  <p className="text-sm">{request.location}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex lg:flex-col gap-3 lg:min-w-[140px]">
                <button
                  onClick={() => handleAcceptRequest(request)}
                  className="flex-1 lg:w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#E6A11A] hover:bg-[#C88B12] text-white font-bold rounded-lg transition-all duration-300 hover:scale-105 shadow-lg shadow-[#E6A11A]/20"
                >
                  <CheckCircle size={18} />
                  Accept
                </button>
                <button
                  onClick={() => alert('Viewing details...')}
                  className="flex-1 lg:w-full px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium rounded-lg transition-all duration-300"
                >
                  Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredRequests.length === 0 && (
        <div className="text-center py-12 bg-[#25282f] rounded-xl border border-white/10">
          <MapPin size={48} className="mx-auto mb-4 text-white/30" />
          <p className="text-xl font-semibold mb-2">No requests found</p>
          <p className="text-white/60">Check back later for new job requests</p>
        </div>
      )}
    </div>
  )
}

export default TechnicianRequests

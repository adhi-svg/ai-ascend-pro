import { useNavigate } from 'react-router-dom'
import { TrendingUp, Star, Briefcase, Clock, MapPin, Wrench, CheckCircle2, AlertCircle, Tool, Zap, Snowflake, Hammer, Hand } from 'lucide-react'

const TechnicianDashboard = () => {
  const navigate = useNavigate()

  const stats = [
    { label: 'Jobs Completed', value: '247', icon: Briefcase, color: 'text-green-400', bg: 'bg-green-500/10' },
    { label: 'Today\'s Earnings', value: '₹1,250', icon: TrendingUp, color: 'text-[#E6A11A]', bg: 'bg-[#E6A11A]/10' },
    { label: 'Rating', value: '4.8', icon: Star, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    { label: 'Response Time', value: '8 min', icon: Clock, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  ]

  const services = [
    { id: 1, name: 'Electrician', icon: '<Zap size={16} className="inline mr-1" />', activeJobs: 2, enabled: true },
    { id: 2, name: 'Plumber', icon: '<Wrench size={16} className="inline mr-1" />', activeJobs: 1, enabled: true },
    { id: 3, name: 'AC Repair', icon: '<Snowflake size={16} className="inline mr-1" />️', activeJobs: 0, enabled: false },
    { id: 4, name: 'Carpenter', icon: '<Hammer size={16} className="inline mr-1" />', activeJobs: 0, enabled: false },
  ]

  const nearbyRequests = [
    { id: 1, service: 'AC Repair', location: '2.3 km away', time: '5 mins ago', price: '₹500-800', urgent: true },
    { id: 2, service: 'Plumbing', location: '1.8 km away', time: '12 mins ago', price: '₹300-500', urgent: false },
    { id: 3, service: 'Electrical', location: '3.1 km away', time: '18 mins ago', price: '₹400-600', urgent: false },
  ]

  const activeJobs = [
    { id: 1, service: 'AC Installation', customer: 'Rajesh Kumar', address: 'MG Road, Sector 14', time: 'Started 45 mins ago', status: 'ongoing' },
    { id: 2, service: 'Electrical Repair', customer: 'Priya Singh', address: 'Park Street, Block B', time: 'Scheduled for 3:00 PM', status: 'scheduled' },
  ]

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome back, Arjun! <Hand size={16} className="inline mr-1" /></h1>
        <p className="text-white/60">Here's your daily overview</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, idx) => {
          const Icon = stat.icon
          return (
            <div
              key={idx}
              className="bg-[#25282f] rounded-xl p-5 border border-white/10 hover:border-[#E6A11A]/30 transition-all duration-300"
            >
              <div className={`w-12 h-12 ${stat.bg} rounded-lg flex items-center justify-center mb-3`}>
                <Icon className={stat.color} size={24} />
              </div>
              <p className="text-2xl font-bold mb-1">{stat.value}</p>
              <p className="text-sm text-white/60">{stat.label}</p>
            </div>
          )
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Active Services */}
        <div className="lg:col-span-2">
          <div className="bg-[#25282f] rounded-xl p-6 border border-white/10">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Wrench size={20} className="text-[#E6A11A]" />
              My Services
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {services.map((service) => (
                <button
                  key={service.id}
                  onClick={() => alert(`Managing ${service.name} service`)}
                  className={`
                    p-4 rounded-lg border transition-all duration-300 text-left
                    ${service.enabled
                      ? 'bg-[#1a1d24] border-[#E6A11A]/30 hover:border-[#E6A11A]/50 hover:bg-[#E6A11A]/5'
                      : 'bg-[#1a1d24] border-white/5 opacity-50 cursor-not-allowed'
                    }
                  `}
                  disabled={!service.enabled}
                >
                  <div className="text-3xl mb-2">{service.icon}</div>
                  <p className="font-semibold mb-1">{service.name}</p>
                  {service.enabled ? (
                    <div className="flex items-center gap-1 text-xs text-green-400">
                      <CheckCircle2 size={12} />
                      <span>Active</span>
                      {service.activeJobs > 0 && (
                        <span className="ml-1 px-2 py-0.5 bg-green-500/20 rounded-full">
                          {service.activeJobs} job{service.activeJobs > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-white/40">Not enabled</p>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <div className="bg-[#25282f] rounded-xl p-6 border border-white/10">
            <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <button
                onClick={() => navigate('/technician/requests')}
                className="w-full flex items-center justify-between p-3 bg-[#E6A11A]/10 hover:bg-[#E6A11A]/20 border border-[#E6A11A]/30 rounded-lg transition-all duration-300 group"
              >
                <span className="font-medium text-[#E6A11A]">View Requests</span>
                <MapPin size={18} className="text-[#E6A11A] group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button
                onClick={() => navigate('/technician/earnings')}
                className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all duration-300 group"
              >
                <span className="font-medium">Earnings</span>
                <TrendingUp size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button
                onClick={() => navigate('/technician/profile')}
                className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all duration-300 group"
              >
                <span className="font-medium">Profile</span>
                <CheckCircle2 size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Nearby Requests */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <MapPin size={20} className="text-[#E6A11A]" />
            Nearby Requests ({nearbyRequests.length})
          </h2>
          <button
            onClick={() => navigate('/technician/requests')}
            className="text-[#E6A11A] hover:text-[#C88B12] text-sm font-medium transition-colors"
          >
            View All →
          </button>
        </div>
        
        <div className="space-y-3">
          {nearbyRequests.map((request) => (
            <div
              key={request.id}
              className="bg-[#25282f] rounded-xl p-4 border border-white/10 hover:border-[#E6A11A]/30 transition-all duration-300 cursor-pointer group"
              onClick={() => alert(`Viewing request: ${request.service}`)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-lg">{request.service}</h3>
                    {request.urgent && (
                      <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs font-medium rounded-full border border-red-500/30">
                        Urgent
                      </span>
                    )}
                  </div>
                  <div className="space-y-1 text-sm text-white/60">
                    <p className="flex items-center gap-2">
                      <MapPin size={14} />
                      {request.location}
                    </p>
                    <p className="flex items-center gap-2">
                      <Clock size={14} />
                      {request.time}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-[#E6A11A] mb-2">{request.price}</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      alert('Accepting request...')
                    }}
                    className="px-4 py-2 bg-[#E6A11A] hover:bg-[#C88B12] text-white font-medium rounded-lg transition-colors text-sm"
                  >
                    Accept
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Jobs */}
      <div>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Briefcase size={20} className="text-[#E6A11A]" />
          Active Jobs ({activeJobs.length})
        </h2>
        
        <div className="grid md:grid-cols-2 gap-4">
          {activeJobs.map((job) => (
            <div
              key={job.id}
              className="bg-[#25282f] rounded-xl p-5 border border-white/10 hover:border-[#E6A11A]/30 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg mb-1">{job.service}</h3>
                  <p className="text-sm text-white/60">{job.customer}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  job.status === 'ongoing' 
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                    : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                }`}>
                  {job.status === 'ongoing' ? 'Ongoing' : 'Scheduled'}
                </span>
              </div>
              
              <div className="space-y-2 mb-4 text-sm text-white/60">
                <p className="flex items-center gap-2">
                  <MapPin size={14} />
                  {job.address}
                </p>
                <p className="flex items-center gap-2">
                  <Clock size={14} />
                  {job.time}
                </p>
              </div>
              
              <button
                onClick={() => navigate('/technician/jobs')}
                className="w-full py-2 bg-[#E6A11A]/10 hover:bg-[#E6A11A]/20 border border-[#E6A11A]/30 text-[#E6A11A] font-medium rounded-lg transition-all duration-300"
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default TechnicianDashboard

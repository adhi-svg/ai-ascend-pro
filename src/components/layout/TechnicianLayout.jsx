import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { 
  Home, 
  MapPin, 
  Briefcase, 
  DollarSign, 
  User, 
  HelpCircle,
  Menu,
  X,
  Power,
  CheckCircle2
} from 'lucide-react'

const TechnicianLayout = ({ children }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const [isOnline, setIsOnline] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navItems = [
    { path: '/technician/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/technician/requests', icon: MapPin, label: 'Nearby Requests' },
    { path: '/technician/jobs', icon: Briefcase, label: 'My Jobs' },
    { path: '/technician/earnings', icon: DollarSign, label: 'Earnings' },
    { path: '/technician/profile', icon: User, label: 'Profile' },
    { path: '/technician/support', icon: HelpCircle, label: 'Support' },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <div className="min-h-screen bg-[#1a1d24] text-white">
      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-50 bg-[#25282f] border-b border-white/10 backdrop-blur-md">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center rounded-lg bg-[#CFEDEE] p-1 shadow-sm">
              <img src="/logo.png" alt="FYXION" className="w-6 h-6 object-contain" />
            </span>
            <span className="font-bold text-lg">FYXION Partner</span>
          </div>

          <button
            onClick={() => setIsOnline(!isOnline)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              isOnline 
                ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}
          >
            <Power size={14} />
            {isOnline ? 'Online' : 'Offline'}
          </button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-64 bg-[#25282f] border-r border-white/10
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="flex flex-col h-full">
            {/* Logo - Desktop */}
            <div className="hidden lg:flex items-center gap-3 px-6 py-5 border-b border-white/10">
              <span className="flex items-center justify-center rounded-xl bg-[#CFEDEE] p-1 shadow-sm">
                <img src="/logo.png" alt="FYXION" className="w-8 h-8 object-contain" />
              </span>
              <div>
                <h1 className="font-bold text-lg">FYXION Partner</h1>
                <p className="text-xs text-white/50">Technician Dashboard</p>
              </div>
            </div>

            {/* Status Card */}
            <div className="p-4 m-4 bg-[#1a1d24] rounded-lg border border-white/10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-white/70">Status</span>
                <button
                  onClick={() => setIsOnline(!isOnline)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    isOnline 
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}
                >
                  <Power size={12} />
                  {isOnline ? 'Online' : 'Offline'}
                </button>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 size={16} className="text-[#E6A11A]" />
                <span className="text-white/90">Verified Technician</span>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const active = isActive(item.path)
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-lg
                      transition-all duration-200 group
                      ${active 
                        ? 'bg-[#E6A11A]/20 text-[#E6A11A] border border-[#E6A11A]/30' 
                        : 'text-white/70 hover:bg-white/5 hover:text-white'
                      }
                    `}
                  >
                    <Icon size={20} className={active ? 'text-[#E6A11A]' : 'text-white/50 group-hover:text-white/70'} />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                )
              })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-white/10">
              <button
                onClick={() => navigate('/login')}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors text-sm font-medium"
              >
                <Power size={16} />
                Sign Out
              </button>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          />
        )}

        {/* Main Content */}
        <main className="flex-1 min-h-screen bg-[#1a1d24]">
          {children}
        </main>
      </div>
    </div>
  )
}

export default TechnicianLayout

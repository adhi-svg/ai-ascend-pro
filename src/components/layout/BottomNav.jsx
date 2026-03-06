import { NavLink, useLocation } from 'react-router-dom'
import { MdHome, MdLocationPin, MdNotes, MdHelpOutline, MdHistory } from 'react-icons/md'

const BottomNav = () => {
  const location = useLocation()
  const hide = ['/', '/login', '/register'].some((p) => location.pathname.startsWith(p))
  if (hide) return null

  const items = [
    { to: '/customer/home', label: 'Home', icon: MdHome },
    { to: '/customer/technicians', label: 'Nearby', icon: MdLocationPin },
    { to: '/customer/bookings', label: 'History', icon: MdHistory },
    { to: '/customer/status', label: 'Status', icon: MdNotes },
    { to: '/customer/complaints', label: 'Support', icon: MdHelpOutline },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-[#E6A11A]/20 bg-white/95 backdrop-blur-xl shadow-[0_-4px_12px_rgba(30,58,95,0.08)] md:hidden">
      <div className="mx-auto flex max-w-6xl items-stretch justify-around px-2 py-2 text-xs font-semibold uppercase tracking-wide text-[#4B5563]">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-3 py-2 flex-1 rounded-lg transition-all duration-200 ${isActive
                  ? 'text-[#E6A11A] bg-[#E6A11A]/10 shadow-[0_4px_12px_rgba(230,161,26,0.2)]'
                  : 'text-[#4B5563] hover:text-[#1E3A5F] hover:bg-[#CFEDEE]/30'
                }`
              }
            >
              <Icon size={20} />
              <span className="text-xs font-medium">{item.label}</span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}

export default BottomNav

import { NavLink } from 'react-router-dom'
import { useTechApp } from '../context/TechAppContext.jsx'

const navItems = [
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Jobs', to: '/jobs' },
  { label: 'Earnings', to: '/earnings' },
  { label: 'Profile', to: '/profile' },
]

export default function Sidebar() {
  const { bookings } = useTechApp()
  const activeJob = bookings.find((booking) =>
    ['payment_confirmed', 'on_the_way', 'arrived', 'started'].includes(booking.status),
  )

  return (
    <aside className="hidden w-64 flex-col gap-4 border-r border-brand-accent/20 bg-white/70 px-4 py-6 md:flex">
      <div className="glass-panel px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-text-secondary">Active Job</p>
        {activeJob ? (
          <NavLink
            to={`/active/${activeJob.id}`}
            className="mt-2 block text-sm font-semibold text-brand-primary"
          >
            {activeJob.customerName}
          </NavLink>
        ) : (
          <p className="mt-2 text-xs text-brand-text-secondary">No active jobs</p>
        )}
      </div>
      <nav className="flex flex-col gap-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                isActive
                  ? 'bg-brand-accent/15 text-brand-primary'
                  : 'text-brand-text-secondary hover:bg-brand-accent/10'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto flex items-center gap-2">
        <img src="/Fyxion-logo.svg" alt="Fyxion" className="h-8" />
        <span className="text-xs text-brand-text-secondary">Technician Partner</span>
      </div>
    </aside>
  )
}

import { NavLink } from 'react-router-dom'

const navItems = [
  { label: 'Home', to: '/dashboard' },
  { label: 'Jobs', to: '/jobs' },
  { label: 'Earnings', to: '/earnings' },
  { label: 'Profile', to: '/profile' },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-brand-accent/20 bg-white/95 px-4 py-3 md:hidden">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `text-xs font-semibold ${
              isActive ? 'text-brand-primary' : 'text-brand-text-secondary'
            }`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}

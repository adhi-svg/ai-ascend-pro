import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useTechApp } from '../context/TechAppContext.jsx'
import Button from '../components/ui/Button.jsx'
import Badge from '../components/ui/Badge.jsx'

export default function Navbar() {
  const { logout, user } = useAuth()
  const { online, setOnline } = useTechApp()
  const location = useLocation()

  const technicianPhoto =
    user?.profilePhotoUrl ||
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&h=120&q=80'

  return (
    <header className="glass-surface sticky top-0 z-40 flex h-[72px] items-center justify-between px-4 shadow-sm md:px-8">
      <Link to="/dashboard" className="flex items-center gap-3">
        <img src={technicianPhoto} alt="Fyxion" className="h-10 w-10 rounded-full object-cover" />
        <div>
          <p className="text-sm font-semibold text-brand-primary">Fyxion Technician</p>
          <p className="text-xs text-brand-text-secondary">{location.pathname.replace('/', '') || 'dashboard'}</p>
        </div>
      </Link>
      <div className="flex items-center gap-3">
        <Badge tone={online ? 'success' : 'danger'}>{online ? 'Online' : 'Offline'}</Badge>
        <button
          onClick={() => setOnline((prev) => !prev)}
          className="rounded-full border border-brand-accent/30 bg-white/70 px-4 py-2 text-xs font-semibold text-brand-primary"
          type="button"
        >
          Toggle Status
        </button>
        <Button variant="ghost" className="px-4 py-2" onClick={logout}>
          Logout
        </Button>
      </div>
    </header>
  )
}

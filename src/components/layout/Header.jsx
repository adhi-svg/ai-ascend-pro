import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import Button from '../ui/Button'

const hiddenPaths = ['/login', '/register']

const Header = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useApp()
  const hide = hiddenPaths.some((p) => location.pathname.startsWith(p))

  if (hide) return null

  const isSplash = location.pathname === '/'

  return (
    <>
      {/* Desktop Header */}
      <header className="z-20 hidden border-b border-[#E6A11A]/20 bg-white/95 backdrop-blur-xl shadow-[0_4px_12px_rgba(30,58,95,0.08)] md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3 text-[#1E3A5F]">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <span className="flex items-center justify-center rounded-xl bg-[#CFEDEE] p-1 shadow-sm">
              <img src="/logo.png" alt="FYXION" className="w-12 h-12 object-contain" />
            </span>
            <span className="text-lg font-bold tracking-wide hidden sm:inline">FYXION</span>
          </Link>
          
          {/* Navigation Menu - Only on splash/home */}
          {isSplash && (
            <nav className="hidden lg:flex items-center gap-8">
              <a href="#services" className="text-[#4B5563] hover:text-[#E6A11A] transition-colors duration-300 font-medium cursor-pointer" onClick={(e) => { e.preventDefault(); document.getElementById('services')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}>
                Services
              </a>
              <a href="#how-it-works" className="text-[#4B5563] hover:text-[#E6A11A] transition-colors duration-300 font-medium cursor-pointer" onClick={(e) => { e.preventDefault(); document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}>
                How it works
              </a>
              <a href="#testimonials" className="text-[#4B5563] hover:text-[#E6A11A] transition-colors duration-300 font-medium cursor-pointer" onClick={(e) => { e.preventDefault(); document.getElementById('testimonials')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}>
                Testimonials
              </a>
              <button 
                onClick={() => navigate('/support/faq')}
                className="text-[#4B5563] hover:text-[#E6A11A] transition-colors duration-300 font-medium"
              >
                FAQ
              </button>
              <button 
                onClick={() => navigate('/support/help')}
                className="text-[#4B5563] hover:text-[#E6A11A] transition-colors duration-300 font-medium"
              >
                Help
              </button>
            </nav>
          )}
          
          <div className="flex items-center gap-4">
            {user ? (
              <div className="text-right">
                <p className="text-xs uppercase tracking-[0.3em] text-brand-text-secondary">Customer</p>
                <p className="text-sm font-semibold text-[#1E3A5F]">{user?.phone}</p>
              </div>
            ) : (
              <Link to="/login">
                <Button variant="primary" className="px-8">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="z-30 border-b border-[#E6A11A]/20 bg-white/95 backdrop-blur-xl shadow-[0_4px_12px_rgba(30,58,95,0.08)] md:hidden text-[#1E3A5F]">
        <div className="flex items-center justify-center px-4 py-3">
          {/* Center: Logo */}
          <Link 
            to="/" 
            className="flex items-center gap-2 justify-center"
          >
            <span className="flex items-center justify-center rounded-xl bg-[#CFEDEE] p-1 shadow-sm">
              <img src="/logo.png" alt="FYXION" className="w-8 h-8 object-contain" />
            </span>
            <span className="text-lg font-bold tracking-[0.2em] uppercase text-[#1E3A5F]">FYXION</span>
          </Link>
        </div>
      </header>
    </>
  )
}

export default Header


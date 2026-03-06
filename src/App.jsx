import { useState, useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import BottomNav from './components/layout/BottomNav'
import Toast from './components/ui/Toast'
import Loader from './components/ui/Loader'
import Splash from './pages/Splash'
import Login from './pages/Login'
import Register from './pages/Register'
import OAuthCallback from './pages/OAuthCallback'
import LocationPicker from './pages/LocationPicker'
import CustomerHome from './pages/CustomerHome'
import TechnicianList from './pages/TechnicianList'
import BookingDetails from './pages/BookingDetails'
import BookingStatus from './pages/BookingStatus'
import JobCompletion from './pages/JobCompletion'
import RatingFeedback from './pages/RatingFeedback'
import TechnicianTracking from './pages/TechnicianTracking'
import CustomerComplaints from './pages/CustomerComplaints'
import MyBookings from './pages/MyBookings'
import SupportContact from './pages/SupportContact'
import HelpCenter from './pages/HelpCenter'
import SupportTerms from './pages/SupportTerms'
import SupportPrivacy from './pages/SupportPrivacy'
import Help from './pages/Help'
import FAQ from './pages/FAQ'
import LearnMore from './pages/LearnMore'
import { useApp } from './context/AppContext'
import AdminLogin from './admin/pages/AdminLogin'
import AdminDashboard from './admin/pages/AdminDashboard'
import TechnicianReview from './admin/pages/TechnicianReview'
import AdminGuard from './auth/AdminGuard'

const RequireAuth = ({ children }) => {
  const { user: contextUser } = useApp()
  const location = useLocation()
  const [isChecked, setIsChecked] = useState(false)

  // Give the context a moment to sync from localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log('[RequireAuth] Auth check - contextUser:', !!contextUser, 'token:', !!localStorage.getItem('auth_token'))
      setIsChecked(true)
    }, 50)
    return () => clearTimeout(timer)
  }, [])

  if (!isChecked) {
    return null // Loading state while checking auth
  }

  // Check both context user and localStorage as fallback
  const token = localStorage.getItem('auth_token')
  const userInfoStr = localStorage.getItem('user_info')

  let user = contextUser
  if (!user && userInfoStr && token) {
    try {
      user = JSON.parse(userInfoStr)
      console.log('[RequireAuth] User loaded from localStorage:', user.email)
    } catch (e) {
      console.error('[RequireAuth] Failed to parse user info from localStorage')
      user = null
    }
  }

  if (!user && contextUser) {
    user = contextUser
  }

  console.log('[RequireAuth] Final auth check - user:', !!user, 'path:', location.pathname)

  if (!user) {
    console.log('[RequireAuth] No user found, redirecting to /login')
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  return children
}

const AppFrame = () => {
  const { loading, toast, setToast, user } = useApp()
  const location = useLocation()

  console.log('[AppFrame] Render - loading:', loading, 'user:', !!user, 'path:', location.pathname)

  return (
    <div className="min-h-screen bg-white text-[#1E3A5F]">
      <Header />
      {/* Don't block the entire page with loader - show it inline instead */}

      <main className="w-full flex flex-col gap-6 pb-20 pt-4 px-0 md:gap-8 md:pb-10 md:pt-6 md:px-0">
        {loading && (
          <div className="fixed top-20 right-4 z-50 rounded-lg bg-white/95 backdrop-blur-sm shadow-lg p-3 border border-brand-accent/20">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand-soft border-t-brand-accent" />
              <span className="text-sm text-brand-accent font-medium">Loading...</span>
            </div>
          </div>
        )}
        <Routes>
          <Route path="/" element={<Splash />} />
          <Route path="/login" element={user ? <Navigate to="/customer/home" replace /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to="/customer/home" replace /> : <Register />} />
          <Route path="/auth/callback" element={<OAuthCallback />} />
          <Route
            path="/location-picker"
            element={
              <RequireAuth>
                <LocationPicker />
              </RequireAuth>
            }
          />

          <Route
            path="/customer/home"
            element={
              <RequireAuth>
                <CustomerHome />
              </RequireAuth>
            }
          />
          <Route
            path="/customer/technicians"
            element={
              <RequireAuth>
                <TechnicianList />
              </RequireAuth>
            }
          />
          <Route
            path="/customer/booking/:techId"
            element={
              <RequireAuth>
                <BookingDetails />
              </RequireAuth>
            }
          />
          <Route
            path="/customer/status"
            element={
              <RequireAuth>
                <BookingStatus />
              </RequireAuth>
            }
          />
          <Route
            path="/customer/completion"
            element={
              <RequireAuth>
                <JobCompletion />
              </RequireAuth>
            }
          />
          <Route
            path="/customer/tracking"
            element={
              <RequireAuth>
                <TechnicianTracking />
              </RequireAuth>
            }
          />
          <Route
            path="/customer/rating"
            element={
              <RequireAuth>
                <RatingFeedback />
              </RequireAuth>
            }
          />
          <Route
            path="/customer/bookings"
            element={
              <RequireAuth>
                <MyBookings />
              </RequireAuth>
            }
          />
          <Route
            path="/customer/complaints"
            element={
              <RequireAuth>
                <CustomerComplaints />
              </RequireAuth>
            }
          />
          <Route path="/support/contact" element={<SupportContact />} />
          <Route path="/support/help" element={<Help />} />
          <Route path="/support/faq" element={<FAQ />} />
          <Route path="/support/terms" element={<SupportTerms />} />
          <Route path="/support/privacy" element={<SupportPrivacy />} />
          <Route path="/learn-more" element={<LearnMore />} />

          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin/dashboard"
            element={
              <AdminGuard>
                <AdminDashboard />
              </AdminGuard>
            }
          />
          <Route
            path="/admin/technicians/:id"
            element={
              <AdminGuard>
                <TechnicianReview />
              </AdminGuard>
            }
          />

          <Route path="*" element={<Navigate to={location?.state?.from || '/'} replace />} />
        </Routes>
      </main>
      <Footer />
      <BottomNav />
      <Toast toast={toast} onClear={() => setToast(null)} />
    </div>
  )
}

const App = () => {
  return <AppFrame />
}

export default App

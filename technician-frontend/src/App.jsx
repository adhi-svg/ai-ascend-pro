import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'
import Navbar from './layout/Navbar.jsx'
import Sidebar from './layout/Sidebar.jsx'
import BottomNav from './layout/BottomNav.jsx'
import Toast from './components/ui/Toast.jsx'
import LandingPage from './pages/LandingPage.jsx'
import Login from './pages/Login.jsx'
import TechnicianRegister from './pages/technician/TechnicianRegister.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Jobs from './pages/Jobs.jsx'
import JobDetails from './pages/JobDetails.jsx'
import ActiveJob from './pages/ActiveJob.jsx'
import Earnings from './pages/Earnings.jsx'
import Profile from './pages/Profile.jsx'
import NotAuthorized from './pages/NotAuthorized.jsx'

function RequireAuth({ children }) {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  return children
}

function RequireTechnician({ children }) {
  const { user } = useAuth()
  if (!user || user.role !== 'technician') {
    return <Navigate to="/not-authorized" replace />
  }
  return children
}

function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-transparent overflow-hidden">
      <Navbar />
      <div className="flex h-[calc(100vh-72px)]">
        <Sidebar />
        <main className="flex-1 overflow-y-auto px-4 pb-24 pt-6 md:px-8 md:pb-10">
          {children}
        </main>
      </div>
      <BottomNav />
      <Toast />
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<TechnicianRegister />} />
      <Route path="/not-authorized" element={<NotAuthorized />} />
      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <RequireTechnician>
              <AppLayout>
                <Dashboard />
              </AppLayout>
            </RequireTechnician>
          </RequireAuth>
        }
      />
      <Route
        path="/jobs"
        element={
          <RequireAuth>
            <RequireTechnician>
              <AppLayout>
                <Jobs />
              </AppLayout>
            </RequireTechnician>
          </RequireAuth>
        }
      />
      <Route
        path="/job/:bookingId"
        element={
          <RequireAuth>
            <RequireTechnician>
              <AppLayout>
                <JobDetails />
              </AppLayout>
            </RequireTechnician>
          </RequireAuth>
        }
      />
      <Route
        path="/active/:bookingId"
        element={
          <RequireAuth>
            <RequireTechnician>
              <AppLayout>
                <ActiveJob />
              </AppLayout>
            </RequireTechnician>
          </RequireAuth>
        }
      />
      <Route
        path="/earnings"
        element={
          <RequireAuth>
            <RequireTechnician>
              <AppLayout>
                <Earnings />
              </AppLayout>
            </RequireTechnician>
          </RequireAuth>
        }
      />
      <Route
        path="/profile"
        element={
          <RequireAuth>
            <RequireTechnician>
              <AppLayout>
                <Profile />
              </AppLayout>
            </RequireTechnician>
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

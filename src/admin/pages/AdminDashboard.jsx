import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import TechnicianCard from '../components/TechnicianCard'
import StatusPill from '../components/StatusPill'
import { adminSessionKey, getAllTechnicians } from '../services/adminStore'

const filterOptions = ['PENDING', 'APPROVED', 'REJECTED']

export default function AdminDashboard() {
  const navigate = useNavigate()
  const location = useLocation()
  const [activeFilter, setActiveFilter] = useState('PENDING')
  const [technicians, setTechnicians] = useState([])

  const loadData = () => {
    setTechnicians(getAllTechnicians())
  }

  useEffect(() => {
    loadData()
  }, [location.key])

  useEffect(() => {
    const interval = setInterval(loadData, 2000)
    return () => clearInterval(interval)
  }, [])

  const counts = useMemo(() => {
    return technicians.reduce(
      (acc, tech) => {
        acc[tech.status] = (acc[tech.status] || 0) + 1
        return acc
      },
      { PENDING: 0, APPROVED: 0, REJECTED: 0 },
    )
  }, [technicians])

  const filtered = useMemo(
    () => technicians.filter((tech) => tech.status === activeFilter),
    [technicians, activeFilter],
  )

  const handleLogout = () => {
    localStorage.removeItem(adminSessionKey)
    navigate('/admin/login', { replace: true })
  }

  const handleRefresh = () => {
    loadData()
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-12 pt-4 md:pt-6">
      <div className="flex flex-col gap-4 rounded-2xl bg-white/95 border border-[#E6A11A]/20 p-5 shadow-md md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-[#1E3A5F]/60 font-semibold">Fixora</p>
          <h1 className="text-2xl font-bold text-[#1E3A5F]">Admin Panel</h1>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleRefresh}
            className="rounded-full border border-[#1E3A5F]/30 px-4 py-2 text-sm font-semibold text-[#1E3A5F] transition-all hover:border-[#1E3A5F]"
          >
            Refresh
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-full border border-[#1E3A5F]/30 px-4 py-2 text-sm font-semibold text-[#1E3A5F] transition-all hover:border-[#1E3A5F]"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="professional-card p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-[#1E3A5F]/60 font-semibold">Pending</p>
          <div className="mt-3 flex items-center justify-between">
            <p className="text-3xl font-bold text-[#1E3A5F]">{counts.PENDING}</p>
            <StatusPill status="PENDING" />
          </div>
        </div>
        <div className="professional-card p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-[#1E3A5F]/60 font-semibold">Approved</p>
          <div className="mt-3 flex items-center justify-between">
            <p className="text-3xl font-bold text-[#1E3A5F]">{counts.APPROVED}</p>
            <StatusPill status="APPROVED" />
          </div>
        </div>
        <div className="professional-card p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-[#1E3A5F]/60 font-semibold">Rejected</p>
          <div className="mt-3 flex items-center justify-between">
            <p className="text-3xl font-bold text-[#1E3A5F]">{counts.REJECTED}</p>
            <StatusPill status="REJECTED" />
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl bg-white/95 border border-[#E6A11A]/20 p-4 shadow-md">
        <div className="flex flex-wrap gap-2">
          {filterOptions.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setActiveFilter(status)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                activeFilter === status
                  ? 'bg-[#E6A11A] text-white shadow-md'
                  : 'border border-[#1E3A5F]/20 text-[#1E3A5F]'
              }`}
            >
              {status.charAt(0) + status.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-4">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-[#E6A11A]/20 bg-white/90 p-6 text-center text-sm text-gray-600">
            No technicians in this status.
          </div>
        ) : (
          filtered.map((tech) => (
            <TechnicianCard
              key={tech.id}
              technician={tech}
              onReview={() => navigate(`/admin/technicians/${tech.id}`)}
            />
          ))
        )}
      </div>
    </div>
  )
}

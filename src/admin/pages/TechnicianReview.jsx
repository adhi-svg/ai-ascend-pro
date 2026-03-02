import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AdminTopBar from '../components/AdminTopBar'
import StatusPill from '../components/StatusPill'
import {
  adminSessionKey,
  approveTechnician,
  getTechnicianById,
  rejectTechnician,
} from '../services/adminStore'

const formatDate = (value) => {
  if (!value) return ''
  return new Date(value).toLocaleString()
}

export default function TechnicianReview() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [technician, setTechnician] = useState(null)
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    setTechnician(getTechnicianById(id))
  }, [id])

  const maskedAadhaar = useMemo(() => {
    if (!technician?.aadhaarNumber) return ''
    return technician.aadhaarNumber.replace(/\d(?=\d{4})/g, '*')
  }, [technician])

  const handleLogout = () => {
    localStorage.removeItem(adminSessionKey)
    navigate('/admin/login', { replace: true })
  }

  const handleApprove = () => {
    approveTechnician(id)
    setNotice('Approved successfully')
    setTimeout(() => navigate('/admin/dashboard'), 800)
  }

  const handleReject = () => {
    if (!reason.trim()) {
      setError('Reason for rejection is required')
      return
    }
    rejectTechnician(id, reason.trim())
    setNotice('Rejected')
    setTimeout(() => navigate('/admin/dashboard'), 800)
  }

  if (!technician) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 pb-12 pt-4 md:pt-6">
        <AdminTopBar title="Technician Review" onLogout={handleLogout} />
        <div className="mt-6 rounded-2xl border border-[#E6A11A]/20 bg-white/95 p-6 text-center text-sm text-gray-600">
          Technician not found.
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-12 pt-4 md:pt-6">
      <AdminTopBar title="Technician Review" onLogout={handleLogout} />

      <div className="mt-6 flex flex-col gap-6">
        <div className="rounded-2xl bg-white/95 border border-[#E6A11A]/20 p-6 shadow-md">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-[#CFEDEE] border border-[#E6A11A]/30 overflow-hidden">
                {technician.profilePhotoUrl ? (
                  <img
                    src={technician.profilePhotoUrl}
                    alt={technician.fullName}
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#1E3A5F]">{technician.fullName}</h2>
                <p className="text-sm text-gray-500">Submitted {formatDate(technician.createdAt)}</p>
              </div>
            </div>
            <StatusPill status={technician.status} />
          </div>

          {notice ? (
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {notice}
            </div>
          ) : null}
          {error ? (
            <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          ) : null}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="professional-card p-6">
            <h3 className="text-lg font-semibold text-[#1E3A5F]">Basic Info</h3>
            <div className="mt-4 grid gap-2 text-sm text-gray-600">
              <div><span className="font-semibold text-[#1E3A5F]">Name:</span> {technician.fullName}</div>
              <div><span className="font-semibold text-[#1E3A5F]">Phone:</span> {technician.phone}</div>
              <div><span className="font-semibold text-[#1E3A5F]">Email:</span> {technician.email || '—'}</div>
            </div>
          </div>

          <div className="professional-card p-6">
            <h3 className="text-lg font-semibold text-[#1E3A5F]">Professional Info</h3>
            <div className="mt-4 grid gap-2 text-sm text-gray-600">
              <div><span className="font-semibold text-[#1E3A5F]">Skill:</span> {technician.skill || '—'}</div>
              <div><span className="font-semibold text-[#1E3A5F]">Experience:</span> {technician.experience || '—'}</div>
              <div><span className="font-semibold text-[#1E3A5F]">Radius:</span> {technician.radiusKm ? `${technician.radiusKm} km` : '—'}</div>
              <div><span className="font-semibold text-[#1E3A5F]">Base visit fee:</span> {technician.baseVisitFee ? `Rs ${technician.baseVisitFee}` : '—'}</div>
              <div><span className="font-semibold text-[#1E3A5F]">Has shop:</span> {technician.hasShop ? 'Yes' : 'No'}</div>
              {technician.hasShop ? (
                <>
                  <div><span className="font-semibold text-[#1E3A5F]">Shop name:</span> {technician.shopName || '—'}</div>
                  <div><span className="font-semibold text-[#1E3A5F]">Shop address:</span> {technician.shopAddress || '—'}</div>
                  <div><span className="font-semibold text-[#1E3A5F]">Shop landmark:</span> {technician.shopLocationText || '—'}</div>
                </>
              ) : null}
            </div>
          </div>

          <div className="professional-card p-6">
            <h3 className="text-lg font-semibold text-[#1E3A5F]">Aadhaar</h3>
            <div className="mt-4 grid gap-2 text-sm text-gray-600">
              <div><span className="font-semibold text-[#1E3A5F]">Number:</span> {maskedAadhaar || '—'}</div>
            </div>
          </div>

          <div className="professional-card p-6">
            <h3 className="text-lg font-semibold text-[#1E3A5F]">Documents</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {[
                { label: 'Aadhaar Front', url: technician.aadhaarFrontUrl },
                { label: 'Aadhaar Back', url: technician.aadhaarBackUrl },
                { label: 'Selfie', url: technician.selfieUrl },
              ].map((doc) => (
                <div key={doc.label} className="rounded-xl border border-[#E6A11A]/20 bg-white/80 p-3 text-center">
                  <div className="h-32 w-full rounded-lg bg-[#CFEDEE]/60 border border-[#E6A11A]/20 flex items-center justify-center overflow-hidden">
                    {doc.url ? (
                      <img src={doc.url} alt={doc.label} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-xs text-gray-500">No image</span>
                    )}
                  </div>
                  <p className="mt-2 text-xs font-semibold text-[#1E3A5F]">{doc.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white/95 border border-[#E6A11A]/20 p-6 shadow-md">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#1E3A5F]">Reason for rejection</label>
              <textarea
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder="Explain why the application is rejected"
                rows={4}
                className="w-full rounded-lg border px-4 py-3 text-sm transition-colors focus:outline-none focus:ring-2"
                style={{ borderColor: '#D1D5DB', color: '#1E3A5F' }}
              />
              <p className="mt-2 text-xs text-gray-500">Required only if rejecting.</p>
            </div>
            <div className="flex flex-col gap-3 md:items-end md:justify-end">
              <button
                type="button"
                onClick={handleApprove}
                className="w-full rounded-full px-6 py-3 text-sm font-semibold text-white transition-all hover:shadow-lg md:w-auto"
                style={{ background: '#E6A11A' }}
              >
                Approve
              </button>
              <button
                type="button"
                onClick={handleReject}
                className="w-full rounded-full border border-[#1E3A5F]/30 px-6 py-3 text-sm font-semibold text-[#1E3A5F] transition-all hover:border-[#1E3A5F] md:w-auto"
              >
                Reject
              </button>
              <button
                type="button"
                onClick={() => navigate('/admin/dashboard')}
                className="w-full rounded-full border border-[#1E3A5F]/20 px-6 py-3 text-sm font-semibold text-[#1E3A5F] transition-all hover:border-[#1E3A5F] md:w-auto"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

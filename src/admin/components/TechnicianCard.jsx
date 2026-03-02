import StatusPill from './StatusPill'

export default function TechnicianCard({ technician, onReview }) {
  return (
    <div className="professional-card p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-[#CFEDEE] border border-[#E6A11A]/30 overflow-hidden">
            {technician.profilePhotoUrl ? (
              <img
                src={technician.profilePhotoUrl}
                alt={technician.fullName}
                className="h-full w-full object-cover"
              />
            ) : null}
          </div>
          <div>
            <p className="text-lg font-semibold text-[#1E3A5F]">{technician.fullName}</p>
            <p className="text-sm text-gray-500">{technician.phone}</p>
          </div>
        </div>
        <StatusPill status={technician.status} />
      </div>

      <div className="grid gap-2 text-sm text-gray-600 md:grid-cols-2">
        <div>
          <span className="font-semibold text-[#1E3A5F]">Skill:</span> {technician.skill || '—'}
        </div>
        <div>
          <span className="font-semibold text-[#1E3A5F]">Radius:</span> {technician.radiusKm ? `${technician.radiusKm} km` : '—'}
        </div>
        <div>
          <span className="font-semibold text-[#1E3A5F]">Created:</span> {new Date(technician.createdAt).toLocaleDateString()}
        </div>
      </div>

      <div>
        <button
          type="button"
          onClick={onReview}
          className="rounded-full px-4 py-2 text-sm font-semibold text-white transition-all hover:shadow-lg"
          style={{ background: '#E6A11A' }}
        >
          Review
        </button>
      </div>
    </div>
  )
}

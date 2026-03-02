const statusStyles = {
  PENDING: 'bg-[#E6A11A]/15 text-[#1E3A5F] border border-[#E6A11A]/30',
  APPROVED: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  REJECTED: 'bg-rose-50 text-rose-700 border border-rose-200',
}

export default function StatusPill({ status }) {
  const label = status || 'PENDING'
  const styles = statusStyles[label] || statusStyles.PENDING

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${styles}`}>
      {label}
    </span>
  )
}

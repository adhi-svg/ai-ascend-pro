export default function AdminTopBar({ title, onLogout }) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-white/95 border border-[#E6A11A]/20 p-5 shadow-md md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-xs uppercase tracking-[0.4em] text-[#1E3A5F]/60 font-semibold">Fixora</p>
        <h1 className="text-2xl font-bold text-[#1E3A5F]">{title}</h1>
      </div>
      <button
        type="button"
        onClick={onLogout}
        className="rounded-full border border-[#1E3A5F]/30 px-4 py-2 text-sm font-semibold text-[#1E3A5F] transition-all hover:border-[#1E3A5F]"
      >
        Logout
      </button>
    </div>
  )
}

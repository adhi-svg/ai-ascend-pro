const EmptyState = ({ title, description, action }) => (
  <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-white/15 bg-white/5 p-6 text-center text-slate-300">
    <p className="text-base font-semibold text-white">{title}</p>
    <p className="text-sm text-slate-400">{description}</p>
    {action}
  </div>
)

export default EmptyState

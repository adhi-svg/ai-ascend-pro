const Loader = ({ label = 'Loading...' }) => (
  <div className="flex flex-col items-center gap-3 py-10 text-center text-slate-600">
    <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-soft border-t-brand-accent" />
    <p className="text-sm font-medium">{label}</p>
  </div>
)

export default Loader

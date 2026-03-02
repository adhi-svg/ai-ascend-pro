const Badge = ({ children, tone = 'neutral' }) => {
  const tones = {
    neutral: 'bg-white/10 text-slate-200',
    success: 'bg-emerald-500/15 text-emerald-300',
    warning: 'bg-amber-500/15 text-amber-200',
    danger: 'bg-brand-danger/20 text-brand-danger',
    brand: 'bg-brand-primary/15 text-brand-teal',
  }
  return <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${tones[tone]}`}>{children}</span>
}

export default Badge

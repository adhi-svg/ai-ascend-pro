export default function Button({
  children,
  className = '',
  variant = 'primary',
  type = 'button',
  ...props
}) {
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    outline:
      'rounded-full border border-brand-accent/40 bg-white/70 px-5 py-2 text-sm font-semibold text-brand-primary shadow-sm transition hover:border-brand-accent',
    ghost:
      'rounded-full border border-transparent bg-transparent px-5 py-2 text-sm font-semibold text-brand-primary transition hover:bg-white/60',
    danger:
      'rounded-full bg-brand-danger/90 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-danger',
  }

  return (
    <button type={type} className={`${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}

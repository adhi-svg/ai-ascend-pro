const base = 'inline-flex items-center justify-center gap-2 rounded-full px-7 py-3 text-sm font-semibold tracking-[0.08em] uppercase transition-all duration-300 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2 focus-visible:ring-offset-brand-background disabled:opacity-60 disabled:cursor-not-allowed relative overflow-hidden group'

const variants = {
  primary: 'bg-gradient-to-r from-[#E6A11A] to-[#F0B329] text-white shadow-[0_4px_15px_rgba(230,161,26,0.3)] hover:shadow-[0_6px_25px_rgba(200,139,18,0.4)] hover:from-[#C88B12] hover:to-[#D99D1A] hover:-translate-y-0.5 transition-all duration-300',
  secondary: 'bg-white text-[#1E3A5F] border border-[#E6A11A]/30 shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:bg-[#CFEDEE]/50 hover:border-[#E6A11A]/60 hover:shadow-[0_4px_12px_rgba(230,161,26,0.2)] hover:-translate-y-0.5 transition-all duration-300',
  ghost: 'bg-transparent text-[#1E3A5F] border border-[#1E3A5F]/30 hover:text-[#E6A11A] hover:border-[#E6A11A] hover:bg-[#E6A11A]/5 hover:-translate-y-0.5 transition-all duration-300',
  danger: 'bg-gradient-to-r from-rose-500 via-red-500 to-red-600 text-white shadow-[0_4px_15px_rgba(251,113,133,0.3)] hover:shadow-[0_6px_25px_rgba(200,139,18,0.4)] hover:-translate-y-0.5 transition-all duration-300',
  success: 'bg-gradient-to-r from-emerald-500 via-green-500 to-green-600 text-white shadow-[0_4px_15px_rgba(16,185,129,0.3)] hover:shadow-[0_6px_25px_rgba(200,139,18,0.4)] hover:-translate-y-0.5 transition-all duration-300',
}

const Button = ({ children, variant = 'primary', className = '', ...rest }) => {
  return (
    <button 
      className={`${base} ${variants[variant]} ${className}`} 
      {...rest}
    >
      {children}
    </button>
  )
}

export default Button

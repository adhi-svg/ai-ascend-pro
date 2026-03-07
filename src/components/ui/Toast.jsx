import { useEffect } from 'react'

const toastConfig = {
  success: {
    gradient: 'from-green-500 to-emerald-600',
    border: 'border-green-400',
    icon: '✓',
    bg: 'bg-white'
  },
  info: {
    gradient: 'from-blue-500 to-indigo-600',
    border: 'border-blue-400',
    icon: 'ℹ',
    bg: 'bg-white'
  },
  danger: {
    gradient: 'from-red-500 to-rose-600',
    border: 'border-red-400',
    icon: '✕',
    bg: 'bg-white'
  },
  warning: {
    gradient: 'from-amber-500 to-orange-600',
    border: 'border-amber-400',
    icon: '⚠',
    bg: 'bg-white'
  },
  error: {
    gradient: 'from-red-500 to-rose-600',
    border: 'border-red-400',
    icon: '✕',
    bg: 'bg-white'
  },
}

const Toast = ({ toast, onClear }) => {
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(onClear, 4000)
    return () => clearTimeout(t)
  }, [toast, onClear])

  if (!toast) return null

  const config = toastConfig[toast.type || 'info']

  return (
    <div className="fixed top-20 right-4 z-[999] animate-slide-in-right pointer-events-auto">
      <div className={`${config.bg} rounded-2xl shadow-2xl border-2 ${config.border} p-4 min-w-[320px] max-w-md animate-bounce-in`}>
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={`w-10 h-10 bg-gradient-to-br ${config.gradient} rounded-full flex items-center justify-center flex-shrink-0 text-white text-lg font-bold shadow-lg animate-success-pulse`}>
            {config.icon}
          </div>

          {/* Content */}
          <div className="flex-1 pt-1">
            <p className="text-[#1E3A5F] font-semibold text-sm leading-tight">{toast.message}</p>
          </div>

          {/* Close Button */}
          <button
            onClick={onClear}
            className="text-[#9CA3AF] hover:text-[#1E3A5F] transition-colors ml-2 -mt-1 flex-shrink-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Toast

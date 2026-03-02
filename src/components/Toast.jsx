import { useEffect } from 'react'

const Toast = ({ message, type = 'info', onClose, duration = 4000 }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  }

  const styles = {
    success: 'from-green-500 to-emerald-600 border-green-400',
    error: 'from-red-500 to-rose-600 border-red-400',
    warning: 'from-amber-500 to-orange-600 border-amber-400',
    info: 'from-blue-500 to-indigo-600 border-blue-400',
  }

  return (
    <div className="animate-slide-in-right">
      <div className={`bg-gradient-to-r ${styles[type]} text-white rounded-xl shadow-2xl border-2 p-4 min-w-[300px] max-w-md animate-scale-in`}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 text-lg font-bold">
            {icons[type]}
          </div>
          <p className="flex-1 font-medium">{message}</p>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors ml-2"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  )
}

export default Toast

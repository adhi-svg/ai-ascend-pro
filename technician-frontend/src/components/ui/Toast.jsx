import { useTechApp } from '../../context/TechAppContext.jsx'

export default function Toast() {
  const { toasts, removeToast } = useTechApp()

  return (
    <div className="fixed right-4 top-4 z-50 flex w-full max-w-sm flex-col gap-3">
      {toasts.map((toast) => (
        <div key={toast.id} className="glass-surface flex items-start justify-between gap-3 p-4">
          <div>
            <p className="text-sm font-semibold text-brand-primary">{toast.title}</p>
            <p className="text-xs text-brand-text-secondary">{toast.message}</p>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-xs font-semibold text-brand-primary"
            type="button"
          >
            Dismiss
          </button>
        </div>
      ))}
    </div>
  )
}

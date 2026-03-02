import Button from './Button.jsx'

export default function Modal({ isOpen, title, onClose, children, actions }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="glass-panel w-full max-w-lg p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-brand-primary">{title}</h3>
          <Button variant="ghost" className="px-3 py-1" onClick={onClose}>
            Close
          </Button>
        </div>
        <div className="mt-4 text-sm text-brand-text-secondary">{children}</div>
        {actions ? <div className="mt-6 flex justify-end gap-3">{actions}</div> : null}
      </div>
    </div>
  )
}

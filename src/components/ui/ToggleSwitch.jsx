const ToggleSwitch = ({ checked, onChange, label }) => (
  <label className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
    <span className="text-sm font-medium text-slate-800">{label}</span>
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-12 items-center rounded-full transition ${checked ? 'bg-brand-accent' : 'bg-slate-300'}`}
      type="button"
      aria-pressed={checked}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${checked ? 'translate-x-6' : 'translate-x-1'}`}
      />
    </button>
  </label>
)

export default ToggleSwitch

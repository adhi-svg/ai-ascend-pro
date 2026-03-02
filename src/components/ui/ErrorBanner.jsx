const ErrorBanner = ({ message }) => (
  <div className="rounded-xl border border-brand-danger/40 bg-brand-danger/10 px-4 py-3 text-sm text-brand-danger">
    {message}
  </div>
)

export default ErrorBanner

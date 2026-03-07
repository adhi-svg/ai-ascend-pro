import { useNavigate } from 'react-router-dom'

const SupportPrivacy = () => {
  const navigate = useNavigate()
  
  return (
    <div className="space-y-6">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm font-semibold text-brand-primary hover:text-brand-accent transition-colors"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>
      <div className="glass-panel rounded-2xl p-6 bg-gradient-to-r from-brand-beige/40 to-white border border-brand-beige/70 shadow-lg">
        <p className="text-xs uppercase tracking-[0.2em] text-brand-muted font-semibold">Legal</p>
        <h1 className="text-3xl font-bold text-brand-primary mt-1">Privacy Policy</h1>
        <p className="text-sm text-slate-700 mt-2">Last updated: DD/MM/YYYY</p>
      </div>

      <div className="glass-panel rounded-2xl p-6 bg-white border border-slate-100 shadow-md space-y-4 text-slate-800">
        <p className="text-sm">Your privacy is important to us. This Privacy Policy explains how FYXION collects, uses, and protects your information.</p>

        <ol className="list-decimal list-inside space-y-3">
          <li>
            <p className="font-semibold">Information We Collect</p>
            <p className="text-sm">We may collect: name, email, phone number; login credentials; device information (for app performance); usage data (features used, time spent).</p>
          </li>
          <li>
            <p className="font-semibold">How We Use Your Information</p>
            <p className="text-sm">We use your data to: provide and improve app functionality; manage user accounts; communicate important updates; improve user experience.</p>
          </li>
          <li>
            <p className="font-semibold">Data Protection</p>
            <p className="text-sm">We use reasonable security measures to protect your data. We do not sell or rent your personal data to third parties.</p>
          </li>
          <li>
            <p className="font-semibold">Third-Party Services</p>
            <p className="text-sm">The app may use trusted third-party services (e.g., analytics, hosting) that follow their own privacy policies.</p>
          </li>
          <li>
            <p className="font-semibold">User Rights</p>
            <p className="text-sm">You have the right to access your personal data, request correction or deletion, and stop using the app at any time.</p>
          </li>
          <li>
            <p className="font-semibold">Children’s Privacy</p>
            <p className="text-sm">This app is not intended for users under 13 years of age. We do not knowingly collect data from children.</p>
          </li>
          <li>
            <p className="font-semibold">Changes to This Policy</p>
            <p className="text-sm">We may update this Privacy Policy. Any changes will be posted here.</p>
          </li>
          <li>
            <p className="font-semibold">Contact Us</p>
            <p className="text-sm">If you have any questions about this Privacy Policy, contact us at: your-email@example.com</p>
          </li>
        </ol>
      </div>
    </div>
  )
}

export default SupportPrivacy

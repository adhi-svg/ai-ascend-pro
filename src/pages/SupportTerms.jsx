import { useNavigate } from 'react-router-dom'

const SupportTerms = () => {
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
        <h1 className="text-3xl font-bold text-brand-primary mt-1">Terms &amp; Conditions</h1>
        <p className="text-sm text-slate-700 mt-2">Last updated: DD/MM/YYYY</p>
      </div>

      <div className="glass-panel rounded-2xl p-6 bg-white border border-slate-100 shadow-md space-y-4 text-slate-800 leading-relaxed">
        <p className="text-sm">Welcome to FYXION. By downloading, accessing, or using this application, you agree to these Terms &amp; Conditions. If you do not agree, please do not use the application.</p>

        <p className="text-sm">This app is intended for technicians and service-related users. You agree to use the app only for lawful purposes and must not misuse, hack, or disrupt the service.</p>

        <p className="text-sm">You are responsible for keeping your account confidential and for all activity under it. False, misleading, or abusive use may lead to suspension.</p>

        <p className="text-sm">All content, design, logo, features, and code belong to FYXION. You may not copy, modify, or distribute any part of the app without permission.</p>

        <p className="text-sm">We aim for high availability but do not guarantee uninterrupted service and may update or discontinue features without notice.</p>

        <p className="text-sm">FYXION is not responsible for direct or indirect damages from using the app, and we do not guarantee complete accuracy of data or results.</p>

        <p className="text-sm">We may suspend or terminate accounts that violate these terms. We may also update the Terms &amp; Conditions at any time; continuing to use the app means you accept the updates.</p>

        <p className="text-sm">For any questions about these Terms, contact us at: your-email@example.com</p>
      </div>
    </div>
  )
}

export default SupportTerms

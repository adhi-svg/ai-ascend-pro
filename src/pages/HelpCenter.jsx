import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'

const faqs = [
  { q: 'How do I book a technician?', a: 'Choose a service, select a technician, describe your issue, then proceed to payment and tracking.' },
  { q: 'Can I change my location?', a: 'Yes. Go to Account > Change Location to update your address.' },
  { q: 'How is pricing calculated?', a: 'Pricing is distance-based with confirmation charges at ₹99 / ₹120 / ₹150 depending on distance and rating.' },
  { q: 'How do I track my technician?', a: 'After payment, use Track Technician from the booking status page.' },
  { q: 'What if no technician is nearby?', a: 'Use Extend Search to expand the radius by 0.5 km until a match is found.' },
  { q: 'How do I update my phone number?', a: 'In Account, use Change Number to send OTP to your new phone, then verify.' },
  { q: 'How do I change my password?', a: 'In Account, choose Change Password, request a code to your email, then set a new password.' },
]

const HelpCenter = () => {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    if (!q) return faqs
    return faqs.filter((item) => item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q))
  }, [query])

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
      <div className="glass-panel rounded-2xl p-6 bg-gradient-to-r from-brand-secondary/20 via-transparent to-brand-accent/10 border border-white/15 shadow-lg">
        <p className="text-xs uppercase tracking-[0.2em] text-brand-muted font-semibold">Help Center</p>
        <h1 className="text-3xl font-bold text-brand-text-primary mt-1">Find answers fast</h1>
        <p className="text-sm text-brand-text-muted mt-2">Search FAQs or jump to contact if you need a person.</p>
      </div>

      <div className="glass-panel rounded-2xl p-6 border border-white/15 bg-white/5 space-y-4">
        <Input
          label="Search"
          placeholder="Type a question..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={() => setQuery('')}>Clear</Button>
          <Button onClick={() => navigate('/support/contact')}>Contact Support</Button>
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((item, idx) => (
          <div key={idx} className="card-base rounded-2xl border border-white/10 p-5 hover:shadow-card-hover transition">
            <p className="font-semibold text-brand-text-primary">{item.q}</p>
            <p className="text-sm text-brand-text-secondary mt-1">{item.a}</p>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="rounded-2xl border border-white/15 bg-white/5 p-5 text-sm text-brand-text-secondary">
            No results for that query. Try another keyword or contact support.
          </div>
        )}
      </div>
    </div>
  )
}

export default HelpCenter

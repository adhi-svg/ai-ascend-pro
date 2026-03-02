import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import TextArea from '../components/ui/TextArea'
import { useApp } from '../context/AppContext'

const SupportContact = () => {
  const navigate = useNavigate()
  const { setToast } = useApp()
  const [form, setForm] = useState({ subject: '', email: '', message: '', screenshot: '' })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.subject.trim() || !form.message.trim()) {
      setToast?.({ type: 'warning', message: 'Please add a subject and your query' })
      return
    }
    setToast?.({ type: 'success', message: 'We have received your query and will reply shortly.' })
    navigate('/customer/home?section=support')
  }

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
        <p className="text-xs uppercase tracking-[0.2em] text-brand-muted font-semibold">Support</p>
        <h1 className="text-3xl font-bold text-brand-text-primary mt-1">Contact our team</h1>
        <p className="text-sm text-brand-text-muted mt-2">Tell us what you need help with. Share details and an optional screenshot.</p>
      </div>

      <form onSubmit={handleSubmit} className="glass-panel rounded-2xl p-6 space-y-4 border border-white/15 bg-white/5">
        <Input
          label="Subject"
          placeholder="Brief summary of your issue"
          value={form.subject}
          onChange={(e) => setForm({ ...form, subject: e.target.value })}
        />
        <Input
          label="Email (optional)"
          type="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <TextArea
          label="Describe your query"
          placeholder="Share details so we can help quickly"
          rows={5}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
        />
        <div className="space-y-2">
          <label className="text-sm font-medium text-brand-text-primary">Add screenshot (optional)</label>
          <input
            type="file"
            accept="image/*"
            className="block w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-brand-text-secondary"
            onChange={(e) => setForm({ ...form, screenshot: e.target.files?.[0]?.name || '' })}
          />
          {form.screenshot && <p className="text-xs text-emerald-300">Attached: {form.screenshot}</p>}
        </div>
        <div className="flex gap-3 justify-end pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/customer/home?section=support')}
          >
            Cancel
          </Button>
          <Button type="submit">Submit</Button>
        </div>
      </form>
    </div>
  )
}

export default SupportContact

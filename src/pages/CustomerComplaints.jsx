import { useState } from 'react'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import TextArea from '../components/ui/TextArea'
import EmptyState from '../components/ui/EmptyState'
import Badge from '../components/ui/Badge'
import { useApp } from '../context/AppContext'

const CustomerComplaints = () => {
  const { complaints, addComplaint } = useApp()
  const [form, setForm] = useState({ title: '', description: '' })

  const submit = async (e) => {
    e.preventDefault()
    await addComplaint(form)
    setForm({ title: '', description: '' })
  }

  return (
    <div className="space-y-5">
      <div className="card-base rounded-2xl border border-white/10 p-5">
        <p className="text-xs uppercase tracking-[0.25em] text-brand-muted">Support</p>
        <h2 className="text-xl font-bold text-brand-primary">Raise a complaint</h2>
      </div>
      <form className="space-y-3" onSubmit={submit}>
        <Input
          label="Title"
          placeholder="Overcharge, delay, behavior"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <TextArea
          label="Describe the issue"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <Button type="submit" className="w-full">
          Submit complaint
        </Button>
      </form>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-brand-text-primary">Complaint history</h3>
        {complaints.length === 0 ? (
          <EmptyState title="No complaints" description="Your complaint history will appear here." />
        ) : (
          <div className="space-y-3">
            {complaints.map((c) => (
              <div key={c.id} className="card-base rounded-2xl border border-white/10 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-brand-text-primary">{c.title}</p>
                    <p className="text-xs text-white/60">{c.createdAt}</p>
                  </div>
                  <Badge tone={c.status === 'Resolved' ? 'success' : 'warning'}>{c.status}</Badge>
                </div>
                <p className="mt-2 text-sm text-brand-text-secondary">{c.summary || c.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default CustomerComplaints

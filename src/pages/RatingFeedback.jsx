import { useState } from 'react'
import Button from '../components/ui/Button'
import TextArea from '../components/ui/TextArea'
import EmptyState from '../components/ui/EmptyState'
import { useApp } from '../context/AppContext'

const RatingFeedback = () => {
  const { jobs } = useApp()
  const completed = jobs.filter((j) => j.status === 'completed')
  const latest = completed.slice(-1)[0]
  const [rating, setRating] = useState(5)
  const [feedback, setFeedback] = useState('')

  if (!latest)
    return <EmptyState title="No completed job" description="Complete a job to rate." action={<span className="text-brand-accent">Back to home</span>} />

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <p className="text-xs uppercase tracking-[0.2em] text-brand-muted">Rate service</p>
        <p className="text-sm text-slate-600">{latest.technicianName}</p>
      </div>
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            className={`h-10 w-10 rounded-full text-lg ${star <= rating ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-400'}`}
          >
            ★
          </button>
        ))}
        <span className="text-sm text-slate-600">{rating} / 5</span>
      </div>
      <TextArea
        label="Feedback"
        placeholder="Tell us what went well"
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
      />
      <Button className="w-full">Submit feedback</Button>
    </div>
  )
}

export default RatingFeedback

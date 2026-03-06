import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import ErrorBanner from '../components/ui/ErrorBanner'
import { useApp } from '../context/AppContext'

const JobCompletion = () => {
  const { jobs, completeJob, setToast } = useApp()
  const latest = jobs.slice(-1)[0]
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  if (!latest) return <ErrorBanner message="No active job to complete" />

  const submit = async (e) => {
    e.preventDefault()
    if (!otp.trim()) {
      setError('Please enter the OTP')
      return
    }
    setError('')
    setLoading(true)
    try {
      await completeJob(latest.id, otp)
      setToast({ type: 'success', message: 'Job completed successfully!' })
      navigate('/customer/rating')
    } catch (err) {
      setError(err.message || 'Invalid OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <p className="text-xs uppercase tracking-[0.2em] text-brand-muted">Job completion</p>
        <h2 className="text-xl font-bold text-brand-primary">Enter OTP from technician</h2>
        <p className="text-sm text-slate-600">OTP is required only for completion. Not used for login.</p>
      </div>
      <form className="space-y-3" onSubmit={submit}>
        {error && <ErrorBanner message={error} />}
        <Input
          label="OTP"
          placeholder="4-digit code"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          maxLength={6}
        />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Verifying...' : 'Mark job completed'}
        </Button>
      </form>
    </div>
  )
}

export default JobCompletion

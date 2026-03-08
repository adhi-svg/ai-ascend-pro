import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import TextArea from '../components/ui/TextArea'
import Badge from '../components/ui/Badge'
import ErrorBanner from '../components/ui/ErrorBanner'
import { useApp } from '../context/AppContext'

const BookingDetails = () => {
  const { techId } = useParams()
  const { techs, createBooking, user } = useApp()
  const tech = techs.find((t) => t.id === techId)
  const navigate = useNavigate()
  const [form, setForm] = useState({ description: '', image: '', voiceNote: '' })
  const [error, setError] = useState('')
  const [complaintText, setComplaintText] = useState('')
  const [aiAnalysis, setAiAnalysis] = useState(null)
  const [analyzingAI, setAnalyzingAI] = useState(false)
  const [manualCategory, setManualCategory] = useState('')
  const [manualUrgency, setManualUrgency] = useState('')

  if (!tech) return <ErrorBanner message="Technician not found" />

  const analyzeComplaint = async () => {
    if (!complaintText.trim()) {
      setError('Please enter a complaint description to analyze')
      return
    }

    setAnalyzingAI(true)
    setError('')

    try {
      const response = await fetch('http://98.92.251.154:8000/api/v1/ai/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ complaint_text: complaintText }),
      })

      const result = await response.json()

      if (result.success && result.data) {
        setAiAnalysis(result.data)
        setManualCategory(result.data.category)
        setManualUrgency(result.data.urgency)
        setError('')
      } else {
        setError('AI analysis failed. Please try again.')
      }
    } catch (err) {
      console.error('AI analysis error:', err)
      setError('Unable to connect to AI service')
    } finally {
      setAnalyzingAI(false)
    }
  }

  const proceed = async (e) => {
    e.preventDefault()

    // Check if user is logged in
    if (!user) {
      navigate('/login', { state: { from: `/customer/booking/${techId}` } })
      return
    }

    if (!form.description && !complaintText) {
      setError('Please add a short description or complaint')
      return
    }

    await createBooking({
      technicianId: tech.id,
      technicianName: tech.name,
      technicianPhone: '+91-8888888888',
      rating: tech.rating,
      distance: tech.distance,
      service: tech.skills?.[0] || 'General Service',
      confirmationCharge: tech.confirmationCharge || 99,
      amount: tech.confirmationCharge || 99,
      details: form.description || complaintText,
      attachment: form.image,
      voiceNote: form.voiceNote,
      complaint_text: complaintText || null,
      complaint_category: manualCategory || null,
      complaint_urgency: manualUrgency || null,
      auto_assign: complaintText ? true : false,
    })
    navigate('/customer/status')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#CFEDEE] via-[#E8F8F9] to-[#D4F0F2] p-4">
      <div className="mx-auto max-w-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate(-1)}
            className="text-[#E6A11A] hover:text-[#C88B12] transition-colors text-lg"
          >
            ← Back
          </button>
          <div>
            <p className="text-xs uppercase tracking-wider text-[#4B5563] font-semibold">Booking</p>
            <h1 className="text-2xl font-bold text-[#1E3A5F]">{tech.name}</h1>
          </div>
        </div>

        {/* Technician Info Card - Compact */}
        <div className="rounded-xl border border-[#E6A11A]/20 bg-white/95 p-4 shadow-md">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#E6A11A] to-[#14B8A6] flex items-center justify-center text-white text-xl font-bold">
              {tech.name.charAt(0)}
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-[#1E3A5F]">{tech.name}</h2>
              <div className="flex items-center gap-3 mt-1">
                <span className="flex items-center gap-1 text-sm">
                  <span className="text-yellow-500">⭐</span>
                  <span className="font-semibold text-[#1E3A5F]">{tech.rating}</span>
                </span>
                <span className="text-sm text-[#9CA3AF]">•</span>
                <span className="text-sm text-[#4B5563]">{tech.distance} km away</span>
                {tech.shopAvailable && (
                  <>
                    <span className="text-sm text-[#9CA3AF]">•</span>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Shop Available</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Confirmation Charge - Compact */}
        <div className="rounded-xl border border-[#E6A11A]/20 bg-white/95 p-4 shadow-md">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-medium text-[#4B5563]">Confirmation charge</p>
            <p className="text-2xl font-bold text-[#E6A11A]">₹99</p>
          </div>
          <p className="text-xs text-[#9CA3AF]">Payable on arrival. Deducted from final bill.</p>
        </div>

        {/* Booking Form - Compact */}
        <form className="space-y-3" onSubmit={proceed}>
          {error && <ErrorBanner message={error} />}

          {/* AI-Powered Complaint Analysis */}
          <div className="rounded-xl border-2 border-[#14B8A6]/30 bg-gradient-to-br from-[#14B8A6]/5 to-white/95 p-4 shadow-md">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">🤖</span>
              <h3 className="text-sm font-bold text-[#1E3A5F]">AI-Powered Complaint Analysis</h3>
              <Badge className="ml-auto bg-[#14B8A6] text-white text-xs">Hackathon Feature</Badge>
            </div>
            <TextArea
              label="Describe your issue for AI analysis"
              placeholder="E.g., AC not cooling properly, making strange noise, urgent repair needed"
              value={complaintText}
              onChange={(e) => setComplaintText(e.target.value)}
              rows={3}
            />
            <Button
              type="button"
              variant="secondary"
              className="w-full mt-3 bg-[#14B8A6] hover:bg-[#0F9B8E] text-white"
              onClick={analyzeComplaint}
              disabled={analyzingAI || !complaintText.trim()}
            >
              {analyzingAI ? '🔄 Analyzing...' : '🔍 Analyze with AI'}
            </Button>

            {aiAnalysis && (
              <div className="mt-3 p-3 bg-white rounded-lg border border-[#14B8A6]/20 shadow-sm">
                <p className="text-xs font-bold text-[#14B8A6] mb-2">✨ AI Analysis Results</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#4B5563] font-medium">Category:</span>
                    <select
                      value={manualCategory}
                      onChange={(e) => setManualCategory(e.target.value)}
                      className="px-2 py-1 border border-[#E6A11A]/20 rounded text-[#1E3A5F] font-semibold"
                    >
                      <option value={aiAnalysis.category}>{aiAnalysis.category}</option>
                      <option value="AC Repair">AC Repair</option>
                      <option value="Plumbing">Plumbing</option>
                      <option value="Electrical">Electrical</option>
                      <option value="Appliance Repair">Appliance Repair</option>
                      <option value="General">General</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#4B5563] font-medium">Urgency:</span>
                    <select
                      value={manualUrgency}
                      onChange={(e) => setManualUrgency(e.target.value)}
                      className={`px-2 py-1 border rounded font-semibold ${manualUrgency === 'urgent'
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : manualUrgency === 'high'
                          ? 'bg-orange-50 text-orange-700 border-orange-200'
                          : 'bg-green-50 text-green-700 border-green-200'
                        }`}
                    >
                      <option value={aiAnalysis.urgency}>{aiAnalysis.urgency}</option>
                      <option value="urgent">Urgent</option>
                      <option value="high">High</option>
                      <option value="normal">Normal</option>
                    </select>
                  </div>
                  {aiAnalysis.keywords.length > 0 && (
                    <div className="text-xs">
                      <span className="text-[#4B5563] font-medium">Keywords:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {aiAnalysis.keywords.map((kw, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-[#E6A11A]/10 text-[#E6A11A] rounded-full text-xs"
                          >
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-xs text-[#9CA3AF] mt-2 italic">
                  ✓ Auto-dispatch enabled: Best technician will be assigned automatically
                </p>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-[#E6A11A]/20 bg-white/95 p-4 shadow-md">
            <TextArea
              label="Or add a manual description"
              placeholder="E.g., AC not cooling, making noise"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="rounded-xl border border-[#E6A11A]/20 bg-white/95 p-4 shadow-md">
            <Input
              label="Attach image (UI only)"
              type="file"
              accept="image/*"
              onChange={(e) => setForm({ ...form, image: e.target.files?.[0]?.name || '' })}
              helper="Uploads are UI-only for now."
            />
          </div>

          <div className="rounded-xl border border-[#E6A11A]/20 bg-white/95 p-4 shadow-md">
            <p className="text-sm font-semibold text-[#1E3A5F] mb-1">Voice note (UI only)</p>
            <p className="text-xs text-[#9CA3AF] mb-3">Tap to simulate recording.</p>
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              onClick={() => setForm({ ...form, voiceNote: 'Voice note placeholder' })}
            >
              Record 10s note
            </Button>
            {form.voiceNote && <p className="mt-2 text-xs text-green-600 font-medium">✓ Voice note captured</p>}
          </div>

          <Button type="submit" className="w-full">
            Proceed booking
          </Button>
        </form>
      </div>
    </div>
  )
}

export default BookingDetails

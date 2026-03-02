import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import Button from '../components/ui/Button'
import TextArea from '../components/ui/TextArea'

const Help = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useApp()
  const [issue, setIssue] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const helpSectionRef = useRef(null)

  useEffect(() => {
    if (user && location.state?.focus === 'help' && helpSectionRef.current) {
      helpSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
      navigate(location.pathname, { replace: true })
    }
  }, [location.pathname, location.state, navigate, user])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!issue.trim()) return

    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      setSubmitted(true)
      setLoading(false)
      setIssue('')
    }, 500)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#CFEDEE] via-[#E8F8F9] to-[#D4F0F2] py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#1E3A5F] mb-3">
            How Can We <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E6A11A] to-[#F0B329]">Help You?</span>
          </h1>
          <p className="text-[#4B5563] text-lg">We're here to assist you with any issues or questions</p>
        </div>

        {/* Help Form */}
        <div ref={helpSectionRef} className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          {user ? (
            submitted ? (
              <div className="text-center py-8">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-[#E6A11A] to-[#F0B329] rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="bg-gradient-to-r from-[#E6A11A]/10 to-[#F0B329]/10 border-2 border-[#E6A11A]/30 rounded-xl p-6 mb-6">
                  <p className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#E6A11A] to-[#F0B329]">
                    We have got your issue and will reply you shortly!
                  </p>
                </div>
                <Button 
                  onClick={() => setSubmitted(false)}
                  variant="secondary"
                  className="mt-4"
                >
                  Submit Another Issue
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-[#1E3A5F] mb-2">
                    Describe Your Issue
                  </label>
                  <TextArea
                    value={issue}
                    onChange={(e) => setIssue(e.target.value)}
                    placeholder="Please describe your issue in detail..."
                    rows={8}
                    required
                    className="w-full"
                  />
                </div>

                <Button 
                  type="submit"
                  disabled={loading || !issue.trim()}
                  className="w-full"
                >
                  {loading ? 'Submitting...' : 'Submit Issue'}
                </Button>
              </form>
            )
          ) : (
            <div className="text-center space-y-4">
              <p className="text-[#4B5563]">
                Sign in to ask for help.
              </p>
              <Button
                onClick={() => navigate('/login', { state: { from: location.pathname, focus: 'help' } })}
                className="w-full"
              >
                Sign In to Ask Help
              </Button>
            </div>
          )}
        </div>

        {/* FAQ Link */}
        <div className="bg-gradient-to-r from-[#E6A11A]/10 to-[#F0B329]/10 border border-[#E6A11A]/30 rounded-xl p-6 text-center">
          <p className="text-[#1E3A5F] mb-3">
            <span className="font-semibold">Have doubts?</span> Check our frequently asked questions
          </p>
          <Button 
            onClick={() => navigate('/support/faq')}
            variant="secondary"
          >
            Go to FAQ →
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Help

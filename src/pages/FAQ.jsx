import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import Button from '../components/ui/Button'
import TextArea from '../components/ui/TextArea'

const FAQ = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useApp()
  const [openIndex, setOpenIndex] = useState(null)
  const [question, setQuestion] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const askSectionRef = useRef(null)

  useEffect(() => {
    if (user && location.state?.focus === 'ask' && askSectionRef.current) {
      askSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
      navigate(location.pathname, { replace: true })
    }
  }, [location.pathname, location.state, navigate, user])

  const faqs = [
    {
      question: 'What is Fyxion?',
      answer: 'Fyxion is a platform that connects you with local, independent technicians in your area for various home services like electrical work, plumbing, AC repair, and more. We don\'t employ technicians - we help you find trusted local professionals.'
    },
    {
      question: 'Are the technicians employed by Fyxion?',
      answer: 'No, Fyxion is a connecting platform. All technicians are independent local professionals in your area. We verify their credentials and ratings to ensure quality service.'
    },
    {
      question: 'How do I book a technician?',
      answer: 'Simply enter your location, browse available local technicians near you, view their ratings and profiles, and click "Book Now" to connect with them instantly.'
    },
    {
      question: 'How does pricing work?',
      answer: 'Each technician sets their own service charges. You can view their rates before booking. Prices may vary based on location, service type, and technician experience.'
    },
    {
      question: 'Can I see technician ratings before booking?',
      answer: 'Yes! Every technician profile shows their rating based on previous customer reviews. This helps you make an informed decision.'
    },
    {
      question: 'What if I need to cancel a booking?',
      answer: 'You can contact the technician directly through our platform to discuss cancellations or rescheduling. Please be respectful of their time and provide advance notice when possible.'
    },
    {
      question: 'How do I pay for services?',
      answer: 'Payment terms are arranged directly with the technician. Some may require advance payment while others accept payment after service completion.'
    },
    {
      question: 'Is my location data safe?',
      answer: 'Yes, we take your privacy seriously. Your location data is only used to show you nearby technicians and is never shared without your consent.'
    }
  ]

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!question.trim()) return

    setLoading(true)
    setTimeout(() => {
      setSubmitted(true)
      setLoading(false)
      setQuestion('')
      // Auto hide message after 5 seconds
      setTimeout(() => setSubmitted(false), 5000)
    }, 500)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#CFEDEE] via-[#E8F8F9] to-[#D4F0F2] py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-[#1E3A5F] mb-3">
            Frequently Asked <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E6A11A] to-[#F0B329]">Questions</span>
          </h1>
          <p className="text-[#4B5563] text-lg">Find answers to common questions about Fyxion</p>
        </div>

        {/* FAQ List */}
        <div className="space-y-4 mb-12">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 hover:border-[#E6A11A]/40 transition-all duration-300"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <span className="font-semibold text-[#1E3A5F] pr-4">
                  {faq.question}
                </span>
                <svg
                  className={`w-5 h-5 text-[#E6A11A] transform transition-transform flex-shrink-0 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openIndex === index && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <p className="text-[#4B5563] leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Ask a Question Section */}
        <div ref={askSectionRef} className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-[#1E3A5F] mb-4 text-center">
            Still Have Questions?
          </h2>
          <p className="text-center text-[#4B5563] mb-6">
            Can't find what you're looking for? Ask us directly!
          </p>

          {user ? (
            <>
              {submitted && (
                <div className="bg-gradient-to-r from-[#E6A11A]/10 to-[#F0B329]/10 border-2 border-[#E6A11A]/30 rounded-xl p-4 mb-6">
                  <p className="text-center text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#E6A11A] to-[#F0B329]">
                    We will reply you shortly!
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <TextArea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Type your question here..."
                  rows={4}
                  required
                  className="w-full"
                />
                <Button 
                  type="submit"
                  disabled={loading || !question.trim()}
                  className="w-full"
                >
                  {loading ? 'Submitting...' : 'Submit Question'}
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center space-y-4">
              <p className="text-[#4B5563]">
                Please sign in to ask a question.
              </p>
              <Button
                onClick={() => navigate('/login', { state: { from: location.pathname, focus: 'ask' } })}
                className="w-full"
              >
                Sign In to Ask
              </Button>
            </div>
          )}
        </div>

        {/* Help Link */}
        <div className="mt-8 text-center">
          <p className="text-[#4B5563] mb-4">
            Need immediate assistance?
          </p>
          <Button 
            onClick={() => navigate('/support/help')}
            variant="secondary"
          >
            Go to Help Center
          </Button>
        </div>
      </div>
    </div>
  )
}

export default FAQ

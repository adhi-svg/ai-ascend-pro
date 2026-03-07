import { useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'

const LearnMore = () => {
  const navigate = useNavigate()

  const guidelines = [
    {
      title: 'Getting Started',
      points: [
        'Create an account or sign in to continue.',
        'Allow location access for accurate nearby results.',
        'Browse categories or search for a service you need.'
      ]
    },
    {
      title: 'How Booking Works',
      points: [
        'Select a technician based on ratings and experience.',
        'Share a brief description of your issue.',
        'Confirm the booking and track progress in real time.'
      ]
    },
    {
      title: 'Payments & Pricing',
      points: [
        'Pricing is transparent and shown before you proceed.',
        'Charges vary by service type and distance.',
        'Payment is arranged securely within the platform.'
      ]
    },
    {
      title: 'Safety & Trust',
      points: [
        'Technicians are verified and reviewed by customers.',
        'Your personal information is protected.',
        'You can rate and review after every job.'
      ]
    },
    {
      title: 'Support',
      points: [
        'Use the FAQ for quick answers.',
        'Contact support for unresolved issues.',
        'We respond promptly to help requests.'
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#CFEDEE] via-[#E8F8F9] to-[#D4F0F2] px-4 py-12">
      <div className="mx-auto max-w-5xl space-y-10">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-[#1E3A5F]/70 font-semibold">Learn More</p>
          <h1 className="mt-3 text-4xl md:text-5xl font-bold text-[#1E3A5F]">
            Fyxion Guidelines & App Overview
          </h1>
          <p className="mt-4 text-[#4B5563] text-lg">
            Everything you need to know to get the best experience with Fyxion.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {guidelines.map((section) => (
            <div
              key={section.title}
              className="rounded-3xl bg-white/95 border border-[#E6A11A]/15 shadow-[0_12px_30px_rgba(30,58,95,0.1)] p-6"
            >
              <h2 className="text-xl font-bold text-[#1E3A5F] mb-3">
                {section.title}
              </h2>
              <ul className="space-y-2 text-[#4B5563]">
                {section.points.map((point, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="mt-1 h-2 w-2 rounded-full bg-[#E6A11A]" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="rounded-3xl bg-gradient-to-r from-[#1E3A5F] to-[#2E5A8F] text-white p-8 text-center shadow-[0_12px_30px_rgba(30,58,95,0.2)]">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">Ready to get started?</h2>
          <p className="text-white/90 mb-6">
            Find trusted local technicians and get your job done quickly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="primary" className="px-8 py-3" onClick={() => navigate('/customer/technicians')}>
              Find Technicians
            </Button>
            <Button variant="secondary" className="px-8 py-3" onClick={() => navigate('/support/faq')}>
              View FAQ
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LearnMore

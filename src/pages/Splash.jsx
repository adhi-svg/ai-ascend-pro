import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import ServiceCategoryCard from '../components/cards/ServiceCategoryCard'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import { MdLocationPin, MdPlumbing, MdElectricBolt, MdAcUnit, MdKitchen, MdTv, MdLocalLaundryService, MdWifi } from 'react-icons/md'
import { TbFridge } from 'react-icons/tb'

// Icon mapping for each service category
const serviceIcons = {
  electrical: MdElectricBolt,
  plumbing: MdPlumbing,
  ac: MdAcUnit,
  fridge: TbFridge,
  tv: MdTv,
  washing: MdLocalLaundryService,
  dishwasher: MdKitchen,
  wifi: MdWifi,
}

const Splash = () => {
  const navigate = useNavigate()
  const locationState = useLocation()
  const { categories, requestLocation, introShown, setIntroShown, currentLocation, setCurrentLocation, user, logout } = useApp()
  const [showIntro, setShowIntro] = useState(!introShown)
  const [fadeIntro, setFadeIntro] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [location_text, setLocation_text] = useState(currentLocation?.address || '')
  const [isSearchFocused, setIsSearchFocused] = useState(false)

  // Handle return from location picker
  useEffect(() => {
    if (user) {
      logout()
    }

    if (locationState.state?.selectedLocation) {
      const { lat, lng, address } = locationState.state.selectedLocation
      setCurrentLocation({ lat, lng, address })
      setLocation_text(address)
    } else if (currentLocation?.address) {
      setLocation_text(currentLocation.address)
    }
  }, [user, logout, locationState.state?.selectedLocation, currentLocation, setCurrentLocation])

  useEffect(() => {
    if (!showIntro) return

    const fadeTimer = setTimeout(() => {
      setFadeIntro(true)
    }, 3600)
    const hideTimer = setTimeout(() => {
      setShowIntro(false)
      setIntroShown(true)
    }, 4000)

    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(hideTimer)
    }
  }, [showIntro, setIntroShown])

  const handleLocationRequest = async () => {
    const loc = await requestLocation()
    if (loc) {
      setCurrentLocation(loc)
      setLocation_text(loc.address || `${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}`)
    }
  }

  const handleFindTechnician = () => {
    if (location_text.trim()) {
      navigate('/customer/technicians', { state: { location: currentLocation } })
    }
  }

  const handleServiceSelect = (category) => {
    navigate('/customer/technicians', { state: { category: category.id } })
  }

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.tagline.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const testimonials = [
    { name: 'Arjun Kumar', service: 'Electrician', rating: 5, text: 'Fixed my AC in 30 mins. Highly professional!' },
    { name: 'Priya Singh', service: 'Plumber', rating: 5, text: 'Great service. Very reliable and affordable.' },
    { name: 'Rajesh Patel', service: 'AC Service', rating: 5, text: 'Best technician experience ever!' }
  ]

  return (
    <div className="relative w-full min-h-screen overflow-hidden text-[#1E3A5F]" style={{ background: 'linear-gradient(to bottom right, #CFEDEE, #E8F8F9, #D4F0F2)' }}>
      {showIntro && (
        <div
          className={`fixed inset-0 z-[100] flex items-center justify-center bg-gradient-to-br from-[#CFEDEE] via-[#E8F8F9] to-[#D4F0F2] transition-opacity duration-500 ${fadeIntro ? 'opacity-0' : 'opacity-100'}`}
        >
          <video
            src="/intro.mp4"
            autoPlay
            muted
            playsInline
            onEnded={() => {
              setFadeIntro(true)
              setTimeout(() => {
                setShowIntro(false)
                setIntroShown(true)
              }, 300)
            }}
            className="h-full w-full object-cover"
          />
        </div>
      )}
      {/* Animated gradient orbs */}
      <div className="glow-orb -left-32 top-10 h-96 w-96 bg-[#E6A11A]/15 animate-pulse" />
      <div className="glow-orb -right-16 bottom-20 h-96 w-96 bg-[#14B8A6]/15 animate-pulse" style={{ animationDelay: '1s' }} />

      {/* HERO SECTION */}
      <section className="relative z-10 pt-16 pb-12 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Brand Badge */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-3 rounded-full border border-[#E6A11A]/40 bg-gradient-to-r from-[#E6A11A]/15 to-transparent px-6 py-2.5 text-xs font-semibold tracking-[0.3em] uppercase text-[#E6A11A]">
              <span className="h-2 w-2 rounded-full bg-[#E6A11A] animate-pulse shadow-[0_0_8px_rgba(230,161,26,0.6)]" />
              FIXORA - Connecting You with Local Experts
            </div>
          </div>

          {/* Hero Heading */}
          <div className="text-center space-y-6 mb-12">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Connect with <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E6A11A] to-[#F0B329]">Local Technicians</span>
              <br className="hidden md:block" />
              <span className="text-[#1E3A5F]">Near You</span>
            </h1>

            <p className="text-lg md:text-xl text-[#4B5563] max-w-2xl mx-auto">
              Book trusted local professionals for electrical, plumbing, AC and more. Your neighborhood experts, just a tap away.
            </p>
          </div>

          {/* SEARCH BAR - Enhanced & Dominant */}
          <div className={`relative mx-auto max-w-3xl mb-12 transition-all duration-300 transform ${isSearchFocused ? 'scale-105' : 'scale-100'}`}>
            <div className="bg-white rounded-2xl shadow-[0_8px_32px_rgba(30,58,95,0.15)] border border-[#E6A11A]/20 p-2 md:p-4">
              <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr_auto] gap-3">
                {/* Location Input */}
                <div className="relative flex items-center px-4 py-3 bg-[#F8F9FA] rounded-xl border border-[#E6A11A]/10">
                  <input
                    type="text"
                    placeholder="Your location"
                    value={location_text}
                    onChange={(e) => setLocation_text(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    className="flex-1 bg-transparent border-none outline-none text-[#1E3A5F] placeholder-[#9CA3AF] text-sm"
                  />
                  <button
                    onClick={handleLocationRequest}
                    className="text-[#E6A11A] hover:text-[#C88B12] transition-colors ml-2"
                    title="Use my current location"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => navigate('/location-picker')}
                    className="text-[#1E3A5F] hover:text-[#E6A11A] transition-colors ml-2"
                    title="Select on map"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5z" />
                    </svg>
                  </button>
                </div>

                {/* Service Search */}
                <div className="relative flex items-center px-4 py-3 bg-[#F8F9FA] rounded-xl border border-[#E6A11A]/10">
                  <MdPlumbing size={20} className="text-[#E6A11A] mr-3" />
                  <input
                    type="text"
                    placeholder="What service do you need?"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    className="flex-1 bg-transparent border-none outline-none text-[#1E3A5F] placeholder-[#9CA3AF] text-sm"
                  />
                </div>

                {/* Find Technician Button */}
                <button
                  onClick={handleFindTechnician}
                  className="bg-gradient-to-r from-[#E6A11A] to-[#F0B329] hover:from-[#C88B12] hover:to-[#D99D1A] text-white font-bold px-6 py-3 rounded-xl transition-all duration-300 shadow-[0_4px_15px_rgba(230,161,26,0.3)] hover:shadow-[0_6px_25px_rgba(200,139,18,0.4)] hover:-translate-y-0.5 whitespace-nowrap"
                >
                  Find Technician
                </button>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button
              variant="primary"
              className="px-8 py-4 text-base"
              onClick={() => navigate('/customer/technicians')}
            >
              📱 Find Local Technicians
            </Button>
            <button
              onClick={() => window.open('http://localhost:5174', '_blank')}
              className="px-8 py-4 text-base bg-white text-[#1E3A5F] font-bold rounded-full shadow-[0_4px_15px_rgba(230,161,26,0.3)] hover:shadow-[0_6px_25px_rgba(230,161,26,0.4)] hover:-translate-y-0.5 transition-all duration-300 border-2 border-[#E6A11A]"
            >
              💼 Join as a Local Technician
            </button>
          </div>
        </div>
      </section>

      {/* TRUST SECTION */}
      <section className="relative z-10 py-8 px-4 md:px-8 bg-white/40 backdrop-blur-sm border-y border-[#E6A11A]/10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="group">
              <p className="text-3xl md:text-4xl font-bold text-[#E6A11A] mb-2">✓ 4.8★</p>
              <p className="text-sm md:text-base text-[#4B5563] font-medium">Verified Rating</p>
            </div>
            <div className="group">
              <p className="text-3xl md:text-4xl font-bold text-[#E6A11A] mb-2">🎯 10K+</p>
              <p className="text-sm md:text-base text-[#4B5563] font-medium">Jobs Completed</p>
            </div>
            <div className="group">
              <p className="text-3xl md:text-4xl font-bold text-[#E6A11A] mb-2">👥 5K+</p>
              <p className="text-sm md:text-base text-[#4B5563] font-medium">Local Technicians</p>
            </div>
            <div className="group">
              <p className="text-3xl md:text-4xl font-bold text-[#E6A11A] mb-2">🔒 Secure</p>
              <p className="text-sm md:text-base text-[#4B5563] font-medium">100% Protected</p>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES SECTION */}
      <section id="services" className="relative z-10 py-16 px-4 md:px-8 scroll-mt-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1E3A5F] mb-3">
              Find Local <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E6A11A] to-[#F0B329]">Experts</span>
            </h2>
            <p className="text-[#4B5563]">Connect with skilled technicians in your area for any service</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredCategories.map((category) => {
              const IconComponent = serviceIcons[category.id]
              return (
                <div
                  key={category.id}
                  onClick={() => handleServiceSelect(category)}
                  className="group cursor-pointer bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(30,58,95,0.08)] hover:shadow-[0_12px_32px_rgba(230,161,26,0.2)] border border-[#E6A11A]/10 hover:border-[#E6A11A]/40 transition-all duration-300 transform hover:-translate-y-2"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 mb-4 bg-gradient-to-br from-[#E6A11A]/10 to-[#F0B329]/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      {IconComponent && <IconComponent className="w-8 h-8 text-[#E6A11A]" />}
                    </div>
                    <h3 className="text-[#1E3A5F] font-bold text-base mb-1">{category.name}</h3>
                    <p className="text-[#9CA3AF] text-xs">{category.tagline}</p>
                  </div>
                  <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-center">
                    <span className="inline-block text-[#E6A11A] text-xs font-semibold">View Technicians →</span>
                  </div>
                </div>
              )
            })}
          </div>

          {filteredCategories.length === 0 && (
            <div className="text-center py-12 bg-white/30 rounded-2xl">
              <p className="text-[#4B5563] text-lg">No services found for "{searchQuery}"</p>
            </div>
          )}
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" className="relative py-20 px-4 md:px-8 bg-gradient-to-br from-[#E8F8F9] via-[#D4F0F2] to-[#CFEDEE] scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-3">
              <span className="text-[#1E3A5F]">How It </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E6A11A] to-[#F0B329]">Works</span>
            </h2>
            <p className="text-[#4B5563] text-lg mt-4">Simple steps to connect with local technicians and get your work done</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 lg:gap-8">
            {[
              { num: 1, title: 'Enter Location', desc: 'Tell us where you need service', icon: '🔍' },
              { num: 2, title: 'Browse Local Technicians', desc: 'View nearby professionals with ratings', icon: '💬' },
              { num: 3, title: 'Book Instantly', desc: 'Connect with your chosen local expert', icon: '📅' },
              { num: 4, title: 'Get It Done', desc: 'Local technician comes to you', icon: '✅' }
            ].map((step, idx) => (
              <div key={idx} className="relative group">
                <div className="bg-white rounded-3xl p-8 shadow-[0_4px_20px_rgba(30,58,95,0.08)] text-center h-full hover:shadow-[0_12px_40px_rgba(230,161,26,0.15)] transition-all duration-300 transform hover:-translate-y-2">
                  <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-[#E6A11A] to-[#F0B329] rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                    {step.num}
                  </div>
                  <h3 className="text-[#1E3A5F] font-bold text-xl mb-3">{step.title}</h3>
                  <p className="text-[#6B7280] text-sm leading-relaxed">{step.desc}</p>
                </div>
                {idx < 3 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 lg:-right-6 w-8 lg:w-12 text-[#E6A11A] text-3xl font-bold z-10 transform -translate-y-1/2">→</div>
                )}
              </div>
            ))}
          </div>

          {/* Additional CTA */}
          <div className="text-center mt-12">
            <Button
              variant="primary"
              className="px-10 py-4 text-lg shadow-xl hover:shadow-2xl"
              onClick={() => navigate('/customer/technicians')}
            >
              Get Started Now →
            </Button>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section id="testimonials" className="relative py-20 px-4 md:px-8 bg-white scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-3">
              <span className="text-[#1E3A5F]">What Our </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E6A11A] to-[#F0B329]">Users Say</span>
            </h2>
            <p className="text-[#4B5563] text-lg mt-4">Real experiences from our satisfied customers</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <div key={idx} className="bg-gradient-to-br from-white to-[#F8F9FA] rounded-3xl p-8 shadow-[0_4px_20px_rgba(30,58,95,0.08)] hover:shadow-[0_12px_40px_rgba(230,161,26,0.15)] transition-all duration-300 border border-gray-100 hover:border-[#E6A11A]/30 transform hover:-translate-y-2">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#E6A11A] to-[#F0B329] rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg flex-shrink-0">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-[#1E3A5F] text-lg">{testimonial.name}</p>
                    <p className="text-sm text-[#6B7280]">{testimonial.service}</p>
                  </div>
                </div>
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-[#E6A11A] text-xl">⭐</span>
                  ))}
                </div>
                <p className="text-[#4B5563] text-base leading-relaxed">"{testimonial.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FOOTER SECTION */}
      <section className="relative py-12 px-4 md:px-8 bg-gradient-to-r from-[#1E3A5F] to-[#2E5A8F] text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Need a Local Technician?
          </h2>
          <p className="text-lg mb-8 text-white/90">
            Join thousands who trust us to connect them with skilled local professionals!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/customer/technicians')}
              className="bg-gradient-to-r from-[#E6A11A] to-[#F0B329] hover:from-[#C88B12] hover:to-[#D99D1A] text-white font-bold px-8 py-4 rounded-xl transition-all duration-300 shadow-[0_4px_15px_rgba(230,161,26,0.4)] hover:shadow-[0_6px_25px_rgba(200,139,18,0.5)] hover:-translate-y-1"
            >
              Book Now
            </button>
            <button
              onClick={() => navigate('/learn-more')}
              className="border-2 border-white text-white hover:bg-white/10 font-bold px-8 py-4 rounded-xl transition-all duration-300"
            >
              Learn More
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Splash

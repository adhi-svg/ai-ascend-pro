import { Wrench, MapPin, User, PhoneCall, Satellite, ClipboardList, HelpCircle, Bell, Hand, Star, Clock, CheckCircle2, Edit2, Smartphone, Lock, Trash2, LogOut, Menu, Lightbulb, CreditCard, Car, Calendar } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import ServiceCategoryCard from '../components/cards/ServiceCategoryCard'
import TechnicianCard from '../components/cards/TechnicianCard'
import EmptyState from '../components/ui/EmptyState'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import ErrorBanner from '../components/ui/ErrorBanner'
import Loader from '../components/ui/Loader'
import AIHelpChat from '../components/AIHelpChat'
import { useApp } from '../context/AppContext'

const CustomerHome = () => {
  console.log('[CustomerHome] Component rendering')
  const { categories, techs, user, requestLocation, jobs, setToast, logout, updatePhone, updatePassword, currentLocation, setCurrentLocation } = useApp()
  const navigate = useNavigate()
  const locationObj = useLocation()
  const [searchParams] = useSearchParams()
  const onlineTechs = techs?.filter((t) => t.isOnline) || []
  const userName = user?.name || user?.phone || 'Guest'
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)
  
  console.log('[CustomerHome] State:', {
    user: !!user,
    categories: categories?.length,
    techs: techs?.length,
    jobs: jobs?.length,
    onlineTechs: onlineTechs.length
  })
  
  // Active section state
  const [activeSection, setActiveSection] = useState('services') // 'services', 'nearby', 'account', 'relatives', 'support', 'previousBookings', 'ongoing', 'changeLocation'

  // Change number state
  const [showChangeNumber, setShowChangeNumber] = useState(false)
  const [numberStep, setNumberStep] = useState('enter') // enter | otp
  const [newNumber, setNewNumber] = useState('')
  const [numberOtp, setNumberOtp] = useState('')

  // Change name state
  const [showChangeName, setShowChangeName] = useState(false)
  const [newFirstName, setNewFirstName] = useState(user?.name?.split(' ')[0] || '')
  const [newLastName, setNewLastName] = useState(user?.name?.split(' ').slice(1).join(' ') || '')

  // Change password state
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [passwordStep, setPasswordStep] = useState('code') // code | reset
  const [emailCode, setEmailCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [accountError, setAccountError] = useState('')

  useEffect(() => {
    const sectionParam = searchParams.get('section')
    if (sectionParam && ['services', 'nearby', 'account', 'relatives', 'support', 'previousBookings', 'ongoing', 'changeLocation'].includes(sectionParam)) {
      setActiveSection(sectionParam)
    }
  }, [searchParams])

  const handleFetchLocation = useCallback(async () => {
    const loc = await requestLocation()
    if (loc) {
      setCurrentLocation(loc)
      setToast?.({ type: 'success', message: 'Location detected' })
    }
  }, [requestLocation, setToast, setCurrentLocation])

  const handleOpenMapPicker = () => {
    navigate('/location-picker', { state: { from: '/customer/home' } })
  }

  // Ask for location only when user clicks the button (required by some browsers)

  // Pick the most recent active/accepted job as ongoing
  const ongoingJob = [...jobs]
    .reverse()
    .find((j) => j.paymentStatus === 'paid' && ['accepted', 'arrived', 'enroute'].includes(j.status))

  const handleConfirmLocation = () => {
    setToast?.({ type: 'success', message: 'Location updated' })
    setActiveSection('account')
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleDeleteAccount = () => {
    const first = window.confirm('Are you sure you want to delete your account? This cannot be undone.')
    if (!first) return
    const second = window.confirm('Final confirmation: Delete account and sign out?')
    if (!second) return
    logout()
    navigate('/login')
  }

  const validatePhone = (p) => /^[6-9]\d{9}$/.test(p)

  const handleChangeName = () => {
    setAccountError('')
    if (!newFirstName.trim() || !newLastName.trim()) {
      setAccountError('Please enter both first and last name')
      return
    }
    const fullName = `${newFirstName.trim()} ${newLastName.trim()}`
    // Update localStorage with new name
    const userInfo = JSON.parse(localStorage.getItem('user_info'))
    userInfo.name = fullName
    localStorage.setItem('user_info', JSON.stringify(userInfo))
    setToast?.({ type: 'success', message: 'Name updated successfully' })
    setShowChangeName(false)
  }

  const handleSendNumberOtp = () => {
    setAccountError('')
    if (!validatePhone(newNumber)) {
      setAccountError('Enter a valid 10-digit mobile number starting with 6-9')
      return
    }
    setNumberStep('otp')
    setToast?.({ type: 'info', message: `OTP sent to ${newNumber}` })
  }

  const handleVerifyNumberOtp = () => {
    setAccountError('')
    if (numberOtp.length !== 6) {
      setAccountError('Enter the 6-digit OTP sent to your new number')
      return
    }
    updatePhone(newNumber)
    setShowChangeNumber(false)
    setNumberStep('enter')
    setNewNumber('')
    setNumberOtp('')
  }

  const handleSendPasswordCode = () => {
    setAccountError('')
    if (!user?.email) {
      setAccountError('Add an email first to receive the verification code')
      return
    }
    setPasswordStep('reset')
    setToast?.({ type: 'info', message: `Verification code sent to ${user.email}` })
  }

  const handleVerifyAndChangePassword = () => {
    setAccountError('')
    if (emailCode.length !== 6) {
      setAccountError('Enter the 6-digit code sent to your email')
      return
    }
    if (!newPassword || newPassword.length < 6) {
      setAccountError('Password must be at least 6 characters')
      return
    }
    if (newPassword !== confirmPassword) {
      setAccountError('Passwords do not match')
      return
    }
    updatePassword(newPassword)
    setShowChangePassword(false)
    setPasswordStep('code')
    setEmailCode('')
    setNewPassword('')
    setConfirmPassword('')
  }
  
  // Mock previous bookings data
  const previousBookings = [
    {
      id: 'pb1',
      technicianName: 'Anuj Verma',
      service: 'Electrical',
      date: '2026-01-18',
      time: '10:30 AM',
      arrivalTime: '10:45 AM',
      completionTime: '12:15 PM',
      amount: 450,
      status: 'completed',
      paymentStatus: 'successful',
      rating: 4.8,
      technicianPhone: '+91 9876543210',
      technicianAddress: 'Shop No. 12, Sector 21, Noida',
      customerAddress: 'B-204, Green Valley Apartments, Sector 18, Noida',
      otp: '8642',
      otpReceivedTime: '12:10 PM',
      workDescription: 'Fixed power socket sparking issue in living room and bedroom. Replaced old wiring.',
      distance: 1.1,
    },
    {
      id: 'pb2',
      technicianName: 'Riya Mehta',
      service: 'Plumbing',
      date: '2026-01-15',
      time: '02:00 PM',
      arrivalTime: '02:20 PM',
      completionTime: '03:45 PM',
      amount: 380,
      status: 'completed',
      paymentStatus: 'successful',
      rating: 4.6,
      technicianPhone: '+91 9123456789',
      technicianAddress: 'Mobile Service, Sector 15, Noida',
      customerAddress: 'B-204, Green Valley Apartments, Sector 18, Noida',
      otp: '5724',
      otpReceivedTime: '03:40 PM',
      workDescription: 'Fixed kitchen sink leakage and bathroom tap dripping issue.',
      distance: 3.9,
    },
  ]
  
  // Selected service state
  const [selectedService, setSelectedService] = useState(null)
  
  // Handle service selection - show technicians for that service
  const handleServiceSelect = (category) => {
    setSelectedService(category)
    setActiveSection('serviceDetails')
  }

  const navItems = [
    { key: 'services', label: 'Services', icon: <Wrench size={20} /> },
    { key: 'nearby', label: 'Nearby Technicians', icon: <MapPin size={20} /> },
    { key: 'account', label: 'Account', icon: <User size={20} /> },
    { key: 'relatives', label: 'Book for Others', icon: <PhoneCall size={20} /> },
    { key: 'ongoing', label: 'Ongoing Booking', icon: <Satellite size={20} /> },
    { key: 'previousBookings', label: 'Previous Bookings', icon: <ClipboardList size={20} /> },
    { key: 'support', label: 'Support', icon: <HelpCircle size={20} /> },
  ]

  // Book for relatives state
  const [showRelativesForm, setShowRelativesForm] = useState(false)
  const [relativesStep, setRelativesStep] = useState('details') // 'details' or 'otp'
  const [relativesForm, setRelativesForm] = useState({ phone: '', address: '', location: null, otp: '' })
  const [relativesLoading, setRelativesLoading] = useState(false)
  const [relativesError, setRelativesError] = useState('')
  const [relativesToShow, setRelativesToShow] = useState(null) // stores the location/phone for showing techs
  
  // Booking details modal state
  const [selectedBookingDetails, setSelectedBookingDetails] = useState(null)

  const handleRelativesPhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10)
    setRelativesForm({ ...relativesForm, phone: value })
  }

  const handleRelativesOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6)
    setRelativesForm({ ...relativesForm, otp: value })
  }

  const handleRelativesGetLocation = async () => {
    setRelativesError('')
    const loc = await requestLocation()
    if (loc) {
      const label = loc.address || `Lat: ${loc.lat.toFixed(4)}, Lng: ${loc.lng.toFixed(4)}`
      setRelativesForm({ ...relativesForm, location: loc, address: label })
    }
  }

  const handleRelativesDetails = async (e) => {
    e.preventDefault()
    setRelativesError('')

    if (!validatePhone(relativesForm.phone)) {
      setRelativesError('Please enter a valid 10-digit phone number')
      return
    }

    if (!relativesForm.address) {
      setRelativesError('Please enter address or select current location')
      return
    }

    setRelativesLoading(true)
    // Simulate sending OTP
    setTimeout(() => {
      setRelativesLoading(false)
      setRelativesStep('otp')
    }, 500)
  }

  const handleRelativesOtpVerify = async (e) => {
    e.preventDefault()
    setRelativesError('')

    if (relativesForm.otp.length !== 6) {
      setRelativesError('Please enter a valid 6-digit OTP')
      return
    }

    setRelativesLoading(true)
    // Simulate OTP verification
    setTimeout(() => {
      setRelativesLoading(false)
      setRelativesToShow(relativesForm)
      setShowRelativesForm(false)
      setRelativesStep('details')
      setRelativesForm({ phone: '', address: '', location: null, otp: '' })
    }, 500)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#CFEDEE] via-[#E8F8F9] to-[#D4F0F2] p-4 text-[#1E3A5F]">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Mobile Top Bar */}
        <div className="md:hidden flex items-center justify-between rounded-2xl border border-[#E6A11A]/20 bg-white/95 backdrop-blur-sm px-3 py-3 text-[#1E3A5F] shadow-[0_4px_12px_rgba(230,161,26,0.15)]">
          <button
            aria-label="Open menu"
            className="text-[#1E3A5F] text-xl"
            onClick={() => setIsMobileNavOpen(true)}
          >
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center rounded-lg bg-[#CFEDEE] p-1 shadow-sm">
              <img src="/logo.png" alt="FYXION" className="w-6 h-6 object-contain" />
            </span>
            <div className="text-lg font-bold text-[#1E3A5F]">FYXION</div>
          </div>
          <button aria-label="Notifications" className="text-[#E6A11A] text-lg">
            <Bell size={20} />
          </button>
        </div>
        {/* Welcome Section */}
        <div className="rounded-[32px] border border-[#E6A11A]/30 bg-gradient-to-br from-white/90 via-[#CFEDEE]/40 to-white/80 backdrop-blur-sm p-8 text-[#1E3A5F] shadow-xl">
          <div className="mb-6 flex flex-col items-center gap-6 md:flex-row">
            <span className="flex items-center justify-center rounded-3xl bg-[#CFEDEE] p-3 shadow-[0_8px_24px_rgba(230,161,26,0.2)]">
              <img src="/logo.png" alt="Fyxion" className="w-32 h-32 object-contain" />
            </span>
            <div className="flex-1 space-y-3 text-left">
              <p className="text-xs font-semibold uppercase tracking-[0.5em] text-[#4B5563]">FYXION</p>
              <h1 className="text-4xl font-bold leading-tight text-[#1E3A5F]">Welcome, {userName}! <Hand size={36} className="inline text-yellow-400" /></h1>
              <p className="text-base text-[#4B5563]">Connect with local technicians for all your home service needs.</p>
            </div>
          </div>

          {/* Location box */}
          <div className="mt-5 rounded-2xl border border-[#E6A11A]/20 bg-white/70 backdrop-blur-sm p-4 shadow-md flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1">
              <p className="text-xs uppercase tracking-[0.4em] text-[#4B5563]">Current Location</p>
              {currentLocation?.address ? (
                <div className="mt-2">
                  <p className="text-sm font-semibold text-[#1E3A5F] break-words">{currentLocation.address}</p>
                </div>
              ) : (
                <div className="mt-1 space-y-2">
                  <p className="text-sm text-[#4B5563]">Location not set. Allow location access to autofill.</p>
                  <Button
                    variant="secondary"
                    onClick={handleFetchLocation}
                    className="w-full text-sm sm:w-auto"
                  >
                    Enable location
                  </Button>
                </div>
              )}
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                variant="secondary"
                onClick={() => setActiveSection('changeLocation')}
                className="w-full sm:w-auto"
              >
                Change Location
              </Button>
              <Button
                onClick={handleFetchLocation}
                className="w-full sm:w-auto"
              >
                Use Current Location
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content with Sidebar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar Navigation (desktop/tablet) */}
          <div className="hidden md:block md:col-span-1">
            <nav className="sticky top-24 space-y-2 rounded-2xl border border-[#E6A11A]/20 bg-white/80 backdrop-blur-sm p-4 shadow-md">
              {navItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => setActiveSection(item.key)}
                  className={`w-full text-left px-5 py-3 rounded-xl font-medium transition flex items-center gap-3 ${
                    activeSection === item.key
                      ? 'bg-gradient-to-r from-[#E6A11A] to-[#F0B329] text-white shadow-lg'
                      : 'text-[#4B5563] hover:bg-[#CFEDEE]/30'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span> {item.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content Area */}
          <div className="col-span-1 md:col-span-3">
            <div className="rounded-2xl border border-[#E6A11A]/20 bg-white/90 backdrop-blur-sm p-8 text-[#1E3A5F] shadow-xl">
              {/* Services Section */}
              {activeSection === 'services' && (
                <section className="space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold text-[#1E3A5F] mb-1">Services</h2>
                    <p className="text-sm text-[#4B5563]">Select a category to begin</p>
                  </div>
                  <div className="grid grid-cols-2 max-[360px]:grid-cols-1 gap-3 md:grid-cols-3">
                    {categories.map((category) => (
                      <ServiceCategoryCard key={category.id} category={category} onSelect={handleServiceSelect} />
                    ))}
                  </div>
                </section>
              )}

              {/* Change Location Section */}
              {activeSection === 'changeLocation' && (
                <section className="space-y-5">
                  <div>
                    <h2 className="text-2xl font-bold text-[#1E3A5F] mb-1">Change Location</h2>
                    <p className="text-sm text-[#4B5563]">Select your precise location from the map</p>
                  </div>

                  <div className="rounded-2xl border border-[#E6A11A]/20 bg-white/5 p-6 space-y-4">
                    <div className="space-y-2">
                       <p className="text-sm text-[#4B5563]">Current Location</p>
                      <div className="rounded-xl border border-[#E6A11A]/20 bg-[#CFEDEE]/30 p-4">
                        <p className="font-semibold text-[#1E3A5F]">
                          {currentLocation?.address || 'No location set'}
                        </p>
                        {currentLocation?.lat && currentLocation?.lng && (
                          <p className="text-xs text-[#4B5563] mt-2">
                            {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm text-[#4B5563]">Select New Location</p>
                      <Button
                        onClick={handleOpenMapPicker}
                        className="w-full"
                      >
                        <MapPin size={20} /> Open Map to Select Location
                      </Button>
                      <p className="text-xs text-[#4B5563]">Click the map to pin your exact location</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                      <Button
                        onClick={handleConfirmLocation}
                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                      >
                        Confirm Location
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => setActiveSection('account')}
                        className="w-full"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </section>
              )}

              {/* Service Details - Technicians for Selected Service */}
              {activeSection === 'serviceDetails' && selectedService && (
                <section className="space-y-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setActiveSection('services')
                        setSelectedService(null)
                      }}
                      className="text-[#E6A11A] hover:text-[#C88B12] transition-colors"
                    >
                      ← Back
                    </button>
                    <div>
                      <h2 className="text-2xl font-bold text-[#1E3A5F] mb-1">{selectedService.name} Technicians</h2>
                      <p className="text-sm text-[#4B5563]">Available technicians near your location</p>
                    </div>
                  </div>
                  
                  {onlineTechs.length === 0 ? (
                    <EmptyState
                      title="No technicians available"
                      description="We couldn't find any technicians for this service in your area right now."
                      action={
                        <Button onClick={() => setActiveSection('services')} variant="secondary">
                          Browse Other Services
                        </Button>
                      }
                    />
                  ) : (
                    <div className="space-y-3">
                      {onlineTechs.map((tech) => (
                        <div
                          key={tech.id}
                          className="rounded-xl border border-[#E6A11A]/20 bg-white/95 p-5 hover:bg-white hover:border-[#E6A11A]/40 transition-all cursor-pointer hover:shadow-lg"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-4 flex-1">
                              {/* Technician Avatar */}
                              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#E6A11A] to-[#14B8A6] flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                                {tech.name.charAt(0)}
                              </div>
                              
                              {/* Technician Details */}
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="text-lg font-bold text-[#1E3A5F]">{tech.name}</h3>
                                  {tech.isOnline && (
                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Online</span>
                                  )}
                                </div>
                                
                                {/* Rating */}
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="flex items-center gap-1">
                                    <span className="text-yellow-500"><Star size={16} className="fill-current text-yellow-500" /></span>
                                    <span className="text-sm font-semibold text-[#1E3A5F]">{tech.rating}</span>
                                  </div>
                                  <span className="text-xs text-[#9CA3AF]">({tech.totalRatings} ratings)</span>
                                </div>
                                
                                {/* Distance */}
                                <div className="flex items-center gap-2 text-sm text-[#4B5563] mb-2">
                                  <span><MapPin size={20} /></span>
                                  <span>{tech.distance} km away</span>
                                </div>
                                
                                {/* Services */}
                                <div className="flex flex-wrap gap-2 mb-3">
                                  {tech.services?.slice(0, 3).map((service, idx) => (
                                    <span key={idx} className="text-xs bg-[#CFEDEE] text-[#1E3A5F] px-2 py-1 rounded-full">
                                      {service}
                                    </span>
                                  ))}
                                </div>
                                
                                {/* Experience & Status */}
                                <div className="flex items-center gap-4 text-xs text-[#9CA3AF]">
                                  <span><Clock size={14} className="inline mr-1" /> {tech.experience || '5+'} years exp</span>
                                  <span><CheckCircle2 size={14} className="inline mr-1" /> Verified</span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Book Button */}
                            <Button
                              onClick={() => navigate(`/customer/booking/${tech.id}`)}
                              className="flex-shrink-0"
                            >
                              Book Now
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              )}

              {/* Nearby Technicians Section */}
              {activeSection === 'nearby' && (
                <section className="space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold text-[#1E3A5F] mb-1">Nearby Technicians & Repair Shops</h2>
                    <p className="text-sm text-[#4B5563]">Within 0.5 - 1.5 km radius</p>
                  </div>
                  {onlineTechs.length === 0 ? (
                    <EmptyState
                      title="No technicians online"
                      description="We will alert you as soon as someone is available."
                      action={<span className="text-xs text-slate-500">Check back in a moment.</span>}
                    />
                  ) : (
                    <div className="space-y-3">
                      {onlineTechs.slice(0, 5).map((tech) => (
                        <TechnicianCard key={tech.id} tech={tech} onSelect={(t) => t.isOnline && navigate(`/customer/booking/${t.id}`)} />
                      ))}
                      {onlineTechs.length > 5 && (
                        <Link to="/customer/technicians" className="block text-center text-sm font-semibold text-brand-accent hover:underline py-2">
                          View all {onlineTechs.length} technicians
                        </Link>
                      )}
                    </div>
                  )}
                </section>
              )}

              {/* Account Center Section */}
              {activeSection === 'account' && (
                <section className="space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold text-[#1E3A5F] mb-1">Account Settings</h2>
                  </div>
                  <div className="space-y-3">
                    {accountError && <ErrorBanner message={accountError} onClose={() => setAccountError('')} />}

                    <div className="rounded-xl border border-[#E6A11A]/20 bg-white/90 p-4 hover:bg-white cursor-pointer transition hover:border-[#E6A11A]/40 hover:shadow-lg" onClick={() => { setShowChangeName((prev) => !prev); setAccountError('') }}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-[#1E3A5F]"><Edit2 size={16} className="inline mr-2" /> Edit Name</p>
                          <p className="text-sm text-[#4B5563]">Update your name</p>
                          <p className="mt-1 text-xs text-[#9CA3AF]">Current: {user?.name || 'Not set'}</p>
                        </div>
                        <span className="text-xl text-[#E6A11A]">{showChangeName ? '−' : '→'}</span>
                      </div>
                    </div>

                    <div
                      className="rounded-xl border border-[#E6A11A]/20 bg-white/90 p-4 hover:bg-white cursor-pointer transition hover:border-[#E6A11A]/40 hover:shadow-lg"
                      onClick={() => setActiveSection('changeLocation')}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-[#1E3A5F]"><MapPin size={20} /> Change Location</p>
                          <p className="text-sm text-[#4B5563]">Update your service area</p>
                        </div>
                        <span className="text-xl text-[#E6A11A]">→</span>
                      </div>
                    </div>

                    <div className="rounded-xl border border-[#E6A11A]/20 bg-white/90 p-4 hover:bg-white cursor-pointer transition hover:border-[#E6A11A]/40 hover:shadow-lg" onClick={() => { setShowChangeNumber((prev) => !prev); setAccountError('') }}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-[#1E3A5F]"><Smartphone size={16} className="inline mr-2" /> Change Mobile Number</p>
                          <p className="text-sm text-[#4B5563]">Update your phone number</p>
                          <p className="mt-1 text-xs text-[#9CA3AF]">Current: {user?.phone || 'Not set'}</p>
                        </div>
                        <span className="text-xl text-[#E6A11A]">{showChangeNumber ? '−' : '→'}</span>
                      </div>
                    </div>

                    <div className="rounded-xl border border-[#E6A11A]/20 bg-white/90 p-4 hover:bg-white cursor-pointer transition hover:border-[#E6A11A]/40 hover:shadow-lg" onClick={() => { setShowChangePassword((prev) => !prev); setAccountError('') }}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-[#1E3A5F]"><Lock size={16} className="inline mr-2" /> Change Password</p>
                          <p className="text-sm text-[#4B5563]">Update your password</p>
                          <p className="mt-1 text-xs text-[#9CA3AF]">Recovery email: {user?.email || 'Add email in profile'}</p>
                        </div>
                        <span className="text-xl text-[#E6A11A]">{showChangePassword ? '−' : '→'}</span>
                      </div>
                    </div>

                    <div className="rounded-xl border border-red-300 bg-red-50 p-4 hover:bg-red-100 cursor-pointer transition" onClick={handleDeleteAccount}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-red-900"><Trash2 size={16} className="inline mr-2" /> Delete Account</p>
                          <p className="text-sm text-red-700">Permanently delete your account</p>
                        </div>
                        <span className="text-xl text-red-600">→</span>
                      </div>
                    </div>

                    <div className="rounded-xl border border-[#E6A11A]/20 bg-white/90 p-4 hover:bg-white cursor-pointer transition" onClick={handleLogout}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-[#1E3A5F]"><LogOut size={16} className="inline mr-2" /> Log Out</p>
                          <p className="text-sm text-[#4B5563]">Sign out of this account</p>
                        </div>
                        <span className="text-xl text-[#E6A11A]">→</span>
                      </div>
                    </div>

                    {showChangeName && (
                      <div className="rounded-xl border border-[#E6A11A]/20 bg-white/95 p-4 space-y-3">
                        <p className="text-sm font-semibold text-[#1E3A5F]">Update your name</p>
                        <Input
                          label="First Name"
                          value={newFirstName}
                          onChange={(e) => setNewFirstName(e.target.value)}
                          placeholder="Enter your first name"
                        />
                        <Input
                          label="Last Name"
                          value={newLastName}
                          onChange={(e) => setNewLastName(e.target.value)}
                          placeholder="Enter your last name"
                        />
                        <div className="flex flex-col sm:flex-row gap-2">
                          <Button className="w-full" onClick={handleChangeName}>
                            Save Name
                          </Button>
                          <Button
                            variant="secondary"
                            className="w-full"
                            onClick={() => {
                              setShowChangeName(false)
                              setNewFirstName(user?.name?.split(' ')[0] || '')
                              setNewLastName(user?.name?.split(' ').slice(1).join(' ') || '')
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}

                    {showChangeNumber && (
                      <div className="rounded-xl border border-[#E6A11A]/20 bg-white/95 p-4 space-y-3">
                        <p className="text-sm font-semibold text-[#1E3A5F]">Verify new number</p>
                        <Input label="Current number" value={user?.phone || ''} disabled helper="Read-only" />
                        <Input
                          label="New number"
                          type="tel"
                          value={newNumber}
                          onChange={(e) => setNewNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                          placeholder="10-digit mobile number"
                          maxLength={10}
                        />
                        {numberStep === 'otp' && (
                          <Input
                            label="Enter OTP"
                            type="tel"
                            value={numberOtp}
                            onChange={(e) => setNumberOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            placeholder="6-digit OTP"
                            maxLength={6}
                          />
                        )}
                        <div className="flex flex-col sm:flex-row gap-2">
                          {numberStep === 'enter' ? (
                            <Button className="w-full" onClick={handleSendNumberOtp}>
                              Send OTP
                            </Button>
                          ) : (
                            <>
                              <Button className="w-full" onClick={handleVerifyNumberOtp}>
                                Verify & Update
                              </Button>
                              <Button variant="secondary" className="w-full" onClick={() => { setNumberStep('enter'); setNumberOtp('') }}>
                                Resend/Change
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    {showChangePassword && (
                      <div className="rounded-xl border border-white/40 bg-white/80 p-4 space-y-3">
                        <p className="text-sm font-semibold text-slate-900">Reset password via email code</p>
                        {passwordStep === 'code' && (
                          <div className="flex flex-col sm:flex-row gap-2">
                            <Button className="w-full" onClick={handleSendPasswordCode}>
                              Send verification code
                            </Button>
                            <Button
                              variant="secondary"
                              className="w-full"
                              onClick={() => { setShowChangePassword(false); setAccountError('') }}
                            >
                              Cancel
                            </Button>
                          </div>
                        )}

                        {passwordStep === 'reset' && (
                          <>
                            <Input
                              label="Email code"
                              type="tel"
                              value={emailCode}
                              onChange={(e) => setEmailCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                              placeholder="6-digit code"
                              maxLength={6}
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <Input
                                label="New password"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Enter new password"
                              />
                              <Input
                                label="Confirm password"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Re-enter password"
                              />
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2">
                              <Button className="w-full" onClick={handleVerifyAndChangePassword}>
                                Change Password
                              </Button>
                              <Button
                                variant="secondary"
                                className="w-full"
                                onClick={() => {
                                  setPasswordStep('code')
                                  setEmailCode('')
                                  setNewPassword('')
                                  setConfirmPassword('')
                                }}
                              >
                                Back
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* Book for Others Section */}
              {activeSection === 'relatives' && (
                <section className="space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-1">Book Technician for Others</h2>
                    <p className="text-sm text-slate-600">Book a technician for your parents, family, or friends</p>
                  </div>
                  
                  {!showRelativesForm && !relativesToShow ? (
                    <Button 
                      onClick={() => setShowRelativesForm(true)} 
                      className="w-full"
                    >
                      Start booking for someone else
                    </Button>
                  ) : showRelativesForm ? (
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 space-y-4">
                      <p className="text-sm text-slate-600">Enter their details to find nearby technicians</p>

                      {relativesError && <ErrorBanner message={relativesError} onClose={() => setRelativesError('')} />}

                      {relativesStep === 'details' && (
                        <form onSubmit={handleRelativesDetails} className="space-y-3">
                          <Input
                            label="Phone number"
                            type="tel"
                            required
                            value={relativesForm.phone}
                            onChange={handleRelativesPhoneChange}
                            placeholder="10-digit mobile number"
                            helper="Enter their Indian mobile starting with 6-9"
                          />
                          <Input
                            label="Their address"
                            type="text"
                            required
                            value={relativesForm.address}
                            onChange={(e) => setRelativesForm({ ...relativesForm, address: e.target.value })}
                            placeholder="House, Street, Area, City, Pincode"
                          />
                          <div className="flex gap-2">
                            <Button 
                              type="button" 
                              variant="secondary" 
                              className="flex-1"
                              onClick={handleRelativesGetLocation}
                            >
                              <MapPin size={20} /> Use Current Location
                            </Button>
                          </div>
                          <div className="flex gap-2">
                            <Button type="button" variant="secondary" onClick={() => setShowRelativesForm(false)} className="flex-1" disabled={relativesLoading}>
                              Cancel
                            </Button>
                            <Button type="submit" className="flex-1" disabled={relativesLoading}>
                              {relativesLoading ? 'Sending OTP...' : 'Send OTP'}
                            </Button>
                          </div>
                        </form>
                      )}

                      {relativesStep === 'otp' && (
                        <form onSubmit={handleRelativesOtpVerify} className="space-y-3">
                          <p className="text-sm text-slate-600">OTP sent to {relativesForm.phone}</p>
                          <Input
                            label="Enter OTP"
                            type="tel"
                            required
                            value={relativesForm.otp}
                            onChange={handleRelativesOtpChange}
                            placeholder="6-digit OTP"
                            maxLength="6"
                          />
                          <div className="flex gap-2">
                            <Button type="button" variant="secondary" onClick={() => setRelativesStep('details')} className="flex-1" disabled={relativesLoading}>
                              Back
                            </Button>
                            <Button type="submit" className="flex-1" disabled={relativesLoading}>
                              {relativesLoading ? 'Verifying...' : 'Verify & Continue'}
                            </Button>
                          </div>
                        </form>
                      )}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-green-200 bg-green-50 p-6 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">Location verified ✓</p>
                          <p className="text-xs text-slate-600">{relativesToShow.address}</p>
                        </div>
                        <button 
                          onClick={() => setRelativesToShow(null)}
                          className="text-xs text-slate-500 hover:text-slate-700"
                        >
                          Clear
                        </button>
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-slate-700">Available technicians nearby:</p>
                        {onlineTechs.slice(0, 3).map((tech) => (
                          <TechnicianCard key={tech.id} tech={tech} onSelect={(t) => t.isOnline && navigate(`/customer/booking/${t.id}`)} />
                        ))}
                      </div>
                    </div>
                  )}
                </section>
              )}

              {/* Support & Help Section */}
              {activeSection === 'support' && (
                <section className="space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-1">Support & Help</h2>
                  </div>
                  <div className="space-y-3">
                    <div
                      className="rounded-xl border border-slate-200 p-4 hover:bg-blue-50 cursor-pointer transition hover:border-brand-accent hover:shadow-md"
                      onClick={() => navigate('/support/contact')}
                    >
                      <p className="font-semibold text-slate-900"><PhoneCall size={20} /> Contact Support</p>
                      <p className="text-sm text-slate-600 mt-1">Reach out to our support team</p>
                    </div>
                    <div
                      className="rounded-xl border border-slate-200 p-4 hover:bg-blue-50 cursor-pointer transition hover:border-brand-accent hover:shadow-md"
                      onClick={() => navigate('/support/help')}
                    >
                      <p className="font-semibold text-slate-900"><Lightbulb size={16} className="inline mr-1" /> Help Center</p>
                      <p className="text-sm text-slate-600 mt-1">Browse FAQs and guides</p>
                    </div>
                    <div
                      className="rounded-xl border border-slate-200 p-4 hover:bg-blue-50 cursor-pointer transition hover:border-brand-accent hover:shadow-md"
                      onClick={() => navigate('/support/privacy')}
                    >
                      <p className="font-semibold text-slate-900"><Lock size={16} className="inline mr-1" /> Privacy Policy</p>
                      <p className="text-sm text-slate-600 mt-1">Read our privacy policy</p>
                    </div>
                    <div
                      className="rounded-xl border border-slate-200 p-4 hover:bg-blue-50 cursor-pointer transition hover:border-brand-accent hover:shadow-md"
                      onClick={() => navigate('/support/terms')}
                    >
                      <p className="font-semibold text-slate-900"><ClipboardList size={20} /> Terms & Conditions</p>
                      <p className="text-sm text-slate-600 mt-1">Review our terms of service</p>
                    </div>
                  </div>
                </section>
              )}

              {/* Previous Bookings Section */}
              {activeSection === 'previousBookings' && (
                <section className="space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-1">Previous Bookings</h2>
                    <p className="text-sm text-slate-600">Your completed service history</p>
                  </div>
                  
                  {previousBookings.length === 0 ? (
                    <EmptyState 
                      title="No previous bookings" 
                      description="Your completed bookings will appear here"
                    />
                  ) : (
                    <div className="space-y-3">
                      {previousBookings.map((booking) => (
                        <div 
                          key={booking.id} 
                          className="rounded-xl border border-slate-200 bg-white p-5 hover:shadow-md transition"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <p className="font-semibold text-lg text-slate-900">{booking.technicianName}</p>
                              <p className="text-sm text-slate-600">{booking.service} service</p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-brand-primary">₹{booking.amount}</p>
                              <p className="text-xs text-slate-500">{new Date(booking.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 mb-3">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                              ✓ {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                            </span>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                              <CreditCard size={16} className="inline mr-1" /> Payment {booking.paymentStatus}
                            </span>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                              <Star size={16} className="fill-current text-yellow-500" /> {booking.rating}
                            </span>
                          </div>
                          
                          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                            <p className="text-xs text-slate-500">Technician attended and job completed</p>
                            <button 
                              onClick={() => setSelectedBookingDetails(booking)}
                              className="text-xs font-semibold text-brand-accent hover:underline"
                            >
                              View Details
                            </button>
                          </div>
                        </div>
                      ))}
                      
                      <div className="text-center pt-4">
                        <p className="text-sm text-slate-500">
                          Showing {previousBookings.length} completed booking{previousBookings.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  )}
                </section>
              )}

              {/* Ongoing Booking Section */}
              {activeSection === 'ongoing' && (
                <section className="space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-1">Ongoing Booking</h2>
                    <p className="text-sm text-slate-600">Track your active service request</p>
                  </div>
                  
                  {!ongoingJob ? (
                    <EmptyState 
                      title="No ongoing booking" 
                      description="You don't have any active bookings at the moment"
                    />
                  ) : (
                    <div className="space-y-4">
                      <div className="rounded-xl border-2 border-brand-accent bg-gradient-to-br from-blue-50 to-white p-5 shadow-md">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <p className="text-xs text-brand-accent font-semibold uppercase tracking-wide">Active Service</p>
                            <h3 className="text-xl font-bold text-slate-900 mt-1">{ongoingJob.issue}</h3>
                            <p className="text-sm text-slate-600 mt-1">{ongoingJob.description}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-brand-primary">₹{ongoingJob.estimate}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mb-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                            ongoingJob.status === 'accepted' 
                              ? 'bg-blue-100 text-blue-800'
                              : ongoingJob.status === 'enroute'
                              ? 'bg-purple-100 text-purple-800'
                              : ongoingJob.status === 'arrived'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {ongoingJob.status === 'accepted' && '✓ Accepted'}
                            {ongoingJob.status === 'enroute' && '<Car size={16} className="inline mr-1" /> On the way'}
                            {ongoingJob.status === 'arrived' && '<MapPin size={20} /> Arrived'}
                            {ongoingJob.status !== 'accepted' && ongoingJob.status !== 'enroute' && ongoingJob.status !== 'arrived' && ongoingJob.status}
                          </span>
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                            <CreditCard size={16} className="inline mr-1" /> Paid
                          </span>
                        </div>

                        <div className="bg-white rounded-lg p-4 space-y-3 mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-primary to-brand-accent flex items-center justify-center text-white text-xl font-bold">
                              {ongoingJob.customerName?.charAt(0) || 'T'}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">{ongoingJob.customerName}</p>
                              <p className="text-xs text-slate-500">Assigned Technician</p>
                            </div>
                          </div>
                          <div className="pt-3 border-t border-slate-100">
                            <p className="text-xs text-slate-500 mb-2">OTP Code:</p>
                            <p className="text-2xl font-bold text-brand-accent tracking-wider">{ongoingJob.otp}</p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button 
                            className="flex-1"
                            onClick={() => navigate('/customer/tracking')}
                          >
                            <MapPin size={20} /> Track Technician
                          </Button>
                          <Button 
                            variant="secondary"
                            className="flex-1"
                            onClick={() => navigate('/customer/status')}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </section>
              )}
            </div>
          </div>
        </div>
        
        {/* Booking Details Modal */}
        {selectedBookingDetails && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setSelectedBookingDetails(null)}>
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
              {/* Modal Header */}
              <div className="sticky top-0 bg-gradient-to-r from-brand-primary to-brand-accent text-white p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold">Booking Details</h3>
                    <p className="text-sm text-blue-100 mt-1">Complete service information</p>
                  </div>
                  <button 
                    onClick={() => setSelectedBookingDetails(null)}
                    className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Service Info */}
                <div className="bg-gradient-to-r from-blue-50 to-emerald-50 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-lg font-bold text-slate-900">{selectedBookingDetails.service} Service</p>
                      <p className="text-sm text-slate-600 mt-1">{selectedBookingDetails.workDescription}</p>
                    </div>
                    <p className="text-2xl font-bold text-brand-primary">₹{selectedBookingDetails.amount}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                      ✓ Completed
                    </span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                      <CreditCard size={16} className="inline mr-1" /> Payment successful
                    </span>
                  </div>
                </div>

                {/* Technician Details */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                    <span className="text-xl"><User size={20} /></span> Technician Details
                  </h4>
                  <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Name:</span>
                      <span className="text-sm font-semibold text-slate-900">{selectedBookingDetails.technicianName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Contact:</span>
                      <a href={`tel:${selectedBookingDetails.technicianPhone}`} className="text-sm font-semibold text-brand-accent hover:underline">
                        {selectedBookingDetails.technicianPhone}
                      </a>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Location:</span>
                      <span className="text-sm font-semibold text-slate-900 text-right">{selectedBookingDetails.technicianAddress}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Distance:</span>
                      <span className="text-sm font-semibold text-slate-900">{selectedBookingDetails.distance} km away</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Rating:</span>
                      <span className="text-sm font-semibold text-yellow-600"><Star size={16} className="fill-current text-yellow-500" /> {selectedBookingDetails.rating}</span>
                    </div>
                  </div>
                </div>

                {/* Service Timeline */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                    <span className="text-xl"><Clock size={16} className="inline mr-1" /></span> Service Timeline
                  </h4>
                  <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm"><Calendar size={16} className="inline mr-1" /></span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-900">Booking Date</p>
                        <p className="text-sm text-slate-600">{new Date(selectedBookingDetails.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm"><Car size={16} className="inline mr-1" /></span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-900">Scheduled Time</p>
                        <p className="text-sm text-slate-600">{selectedBookingDetails.time}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm"><MapPin size={20} /></span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-900">Technician Arrived</p>
                        <p className="text-sm text-slate-600">{selectedBookingDetails.arrivalTime}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm"><CheckCircle2 size={14} className="inline mr-1" /></span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-900">Work Completed</p>
                        <p className="text-sm text-slate-600">{selectedBookingDetails.completionTime}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* OTP & Location Details */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                    <span className="text-xl"><Lock size={16} className="inline mr-2" /></span> Verification & Location
                  </h4>
                  <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                    <div className="bg-white rounded-lg p-3 border border-slate-200">
                      <p className="text-xs text-slate-600 mb-1">OTP Received at Customer Home</p>
                      <div className="flex items-center justify-between">
                        <p className="text-2xl font-bold text-brand-primary tracking-wider">{selectedBookingDetails.otp}</p>
                        <p className="text-sm text-slate-600">{selectedBookingDetails.otpReceivedTime}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 mb-1">Service Location</p>
                      <p className="text-sm text-slate-600">{selectedBookingDetails.customerAddress}</p>
                    </div>
                  </div>
                </div>

                {/* Close Button */}
                <Button 
                  onClick={() => setSelectedBookingDetails(null)}
                  className="w-full"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Drawer */}
      {isMobileNavOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-[#1E3A5F]/30 backdrop-blur-sm"
            onClick={() => setIsMobileNavOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-72 max-w-[78%] bg-gradient-to-b from-white via-[#CFEDEE]/20 to-white shadow-2xl border-r border-[#E6A11A]/30 flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#E6A11A]/20 bg-white/80 backdrop-blur-sm">
              <span className="text-lg font-bold text-[#1E3A5F]">FYXION</span>
              <button aria-label="Close menu" className="text-xl text-[#4B5563] hover:text-[#E6A11A]" onClick={() => setIsMobileNavOpen(false)}>
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => {
                    setActiveSection(item.key)
                    setIsMobileNavOpen(false)
                  }}
                  className={`w-full text-left px-4 py-3 rounded-xl font-medium transition flex items-center gap-3 ${
                    activeSection === item.key
                      ? 'bg-gradient-to-r from-[#E6A11A] to-[#F0B329] text-white shadow-lg'
                      : 'bg-white/80 border border-[#E6A11A]/20 text-[#1E3A5F] hover:border-[#E6A11A]/40 hover:bg-[#CFEDEE]/30'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-sm">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* HACKATHON UPGRADE – AI HELP CHAT WIDGET */}
      <AIHelpChat />
    </div>
  )
}

export default CustomerHome

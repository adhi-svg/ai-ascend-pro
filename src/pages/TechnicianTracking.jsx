import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { createTrackingWebSocket } from '../services/api'
import L from 'leaflet'

const TechnicianTracking = () => {
  const navigate = useNavigate()
  const { jobs, setJobs, setToast } = useApp()
  const active = jobs[0]
  const mapRef = useRef(null)
  const mapInstance = useRef(null)
  const markerRefs = useRef({ customer: null, technician: null })
  const wsRef = useRef(null)

  // Get customer location from booking or use default
  const [customerLocation, setCustomerLocation] = useState({ lat: 28.6139, lng: 77.2090 }) // Delhi default
  const [techLocation, setTechLocation] = useState({ lat: 28.6139, lng: 77.2090 })
  const [eta, setEta] = useState(15)
  const [distance, setDistance] = useState(2.5)
  const [mapLoaded, setMapLoaded] = useState(true)
  const [hasArrived, setHasArrived] = useState(false)
  const [otp, setOtp] = useState('')
  const [otpError, setOtpError] = useState('')
  const [showOtpModal, setShowOtpModal] = useState(false)

  // Set customer location from booking when active changes
  useEffect(() => {
    if (active && active.location) {
      // If booking has location (lat/lng)
      if (active.location.lat && active.location.lng) {
        setCustomerLocation({ lat: active.location.lat, lng: active.location.lng })
      }
    }
  }, [active])

  // Initialize Leaflet map with OpenStreetMap
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || mapInstance.current) return

    try {
      // Create map centered on customer location
      mapInstance.current = L.map(mapRef.current).setView(
        [customerLocation.lat, customerLocation.lng],
        15
      )

      // Add OpenStreetMap tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(mapInstance.current)

      // Customer marker (blue)
      markerRefs.current.customer = L.marker([customerLocation.lat, customerLocation.lng], {
        icon: L.icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
        }),
        title: 'Your Location',
      })
        .bindPopup('📍 Your Location')
        .addTo(mapInstance.current)

      // Technician marker (green)
      markerRefs.current.technician = L.marker([techLocation.lat, techLocation.lng], {
        icon: L.icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
        }),
        title: active?.technicianName || 'Technician',
      })
        .bindPopup(`<strong>${active?.technicianName}</strong><br/>En route to your location`)
        .addTo(mapInstance.current)
    } catch (error) {
      console.error('Error initializing Leaflet map:', error)
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove()
        mapInstance.current = null
      }
    }
  }, [mapLoaded, customerLocation, active?.technicianName])

  // Update technician marker position
  useEffect(() => {
    if (!mapInstance.current || !markerRefs.current.technician) return
    markerRefs.current.technician.setLatLng([techLocation.lat, techLocation.lng])
  }, [techLocation])

  // Simulate technician movement
  useEffect(() => {
    const interval = setInterval(() => {
      setTechLocation(prev => ({
        lat: prev.lat + (Math.random() - 0.495) * 0.01,
        lng: prev.lng + (Math.random() - 0.495) * 0.01,
      }))
      setDistance(prev => Math.max(0, prev - 0.2))
      setEta(prev => Math.max(0, prev - 1))
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  // Check if technician has arrived
  useEffect(() => {
    if (eta <= 0 && distance <= 0.1 && !hasArrived) {
      setHasArrived(true)
      setShowOtpModal(true)
      // Update job status to arrived
      setJobs((prev) =>
        prev.map((job) =>
          job.id === active?.id
            ? { ...job, status: 'arrived' }
            : job
        )
      )
      // Show arrival notification
      setToast({ message: `🎯 ${active?.technicianName} has arrived at your location!`, type: 'success' })
    }
  }, [eta, distance, hasArrived, active?.id, active?.technicianName, setJobs, setToast])

  // Handle OTP submission
  const handleOtpSubmit = (e) => {
    e.preventDefault()
    
    // Mock OTP verification (in real app, this would be an API call)
    const correctOtp = active?.otp || '1234'
    
    if (otp === correctOtp) {
      setOtpError('')
      // Update job to completed
      setJobs((prev) =>
        prev.map((job) =>
          job.id === active?.id
            ? { ...job, status: 'completed' }
            : job
        )
      )
      // Show success notification
      setToast({ message: '✅ Service started successfully! Technician is working on your issue.', type: 'success' })
      // Navigate to rating/feedback page
      setTimeout(() => {
        navigate('/customer/rating')
      }, 2000)
    } else {
      setOtpError('Invalid OTP. Please check and try again.')
    }
  }

  // Connect to WebSocket for real-time location updates
  useEffect(() => {
    if (!active?.id) return

    try {
      wsRef.current = createTrackingWebSocket(active.id, (location) => {
        if (location && location.latitude && location.longitude) {
          setTechLocation({
            lat: location.latitude,
            lng: location.longitude,
          })
        }
      })
    } catch (error) {
      console.error('Failed to connect WebSocket:', error)
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
    }
  }, [active?.id])

  if (!active) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#050014] via-[#080020] to-[#180533] p-6 flex items-center justify-center text-brand-text-primary">
        <Button onClick={() => navigate('/customer/home')}>Back to Home</Button>
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-[#CFEDEE] via-[#E8F8F9] to-[#D4F0F2] p-4 pb-60">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-[#E6A11A]/20 rounded-2xl p-6 mb-6 shadow-[0_4px_12px_rgba(30,58,95,0.08)]">
            <button
              onClick={() => navigate('/customer/home')}
              className="text-2xl mb-4 text-[#1E3A5F] hover:text-[#E6A11A] transition-colors"
            >
              ← Back
            </button>
            <h1 className="text-2xl font-bold text-[#1E3A5F]">Technician Tracking</h1>
            <p className="text-[#4B5563] mt-1">Real-time location of {active.technicianName}</p>
          </div>

          {/* Map Area */}
          <div className="bg-white rounded-2xl shadow-md overflow-hidden mb-6 aspect-video relative border border-[#E6A11A]/10">
            {mapLoaded ? (
              <div ref={mapRef} className="w-full h-full"></div>
            ) : (
              <div className="w-full h-full bg-gradient-to-b from-slate-100 to-slate-200 relative flex items-center justify-center">
                {/* Mock Google Maps - Fallback */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0 bg-[linear-gradient(0deg,transparent_24%,rgba(0,0,0,.05)_25%,rgba(0,0,0,.05)_26%,transparent_27%,transparent_74%,rgba(0,0,0,.05)_75%,rgba(0,0,0,.05)_76%,transparent_77%,transparent),linear-gradient(90deg,transparent_24%,rgba(0,0,0,.05)_25%,rgba(0,0,0,.05)_26%,transparent_27%,transparent_74%,rgba(0,0,0,.05)_75%,rgba(0,0,0,.05)_76%,transparent_77%,transparent)] bg-[length:50px_50px]"></div>
                </div>

                {/* Map content */}
                {/* ...existing code... */}
                <div className="relative w-full h-full flex items-center justify-center p-8">
                  {/* Customer Location Marker */}
                  <div className="absolute top-1/4 left-1/4">
                    <div className="relative">
                      <div className="w-4 h-4 bg-blue-600 rounded-full border-4 border-blue-300 shadow-lg"></div>
                      <div className="absolute top-full left-0 mt-2 bg-blue-600 text-white text-xs px-2 py-1 rounded whitespace-nowrap font-semibold">
                        Your Location
                      </div>
                    </div>
                  </div>

                  {/* Technician Location Marker */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="relative animate-pulse">
                      <div className="w-6 h-6 bg-green-500 rounded-full border-4 border-green-300 shadow-xl flex items-center justify-center">
                        <span className="text-white text-sm">🚗</span>
                      </div>
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-green-600 text-white text-xs px-3 py-1 rounded whitespace-nowrap font-semibold">
                        {active.technicianName}
                      </div>
                      {/* Distance circle */}
                      <div
                        className="absolute inset-0 rounded-full border-2 border-green-300 border-dashed animate-ping"
                        style={{ width: '40px', height: '40px', top: '-7px', left: '-7px' }}
                      ></div>
                    </div>
                  </div>

                  {/* Distance line simulation */}
                  <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }}>
                    <line x1="25%" y1="25%" x2="50%" y2="50%" stroke="#3b82f6" strokeWidth="2" strokeDasharray="5,5" />
                  </svg>

                  {/* Map Attribution */}
                  <div className="absolute bottom-2 right-2 text-xs text-white/80 bg-black/30 px-2 py-1 rounded">
                    📍 Mock Location Map
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border-2 border-blue-300 shadow-md">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-xl">📍</span>
                </div>
                <div>
                  <p className="text-xs text-blue-700 font-semibold uppercase tracking-wide">Distance</p>
                  <p className="text-2xl font-bold text-blue-900">{distance.toFixed(1)} km</p>
                </div>
              </div>
              <p className="text-xs text-blue-600">{hasArrived ? 'Arrived at your location!' : 'Getting closer...'}</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-6 border-2 border-green-300 shadow-md">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-xl">⏱️</span>
                </div>
                <div>
                  <p className="text-xs text-green-700 font-semibold uppercase tracking-wide">ETA</p>
                  <p className="text-2xl font-bold text-green-900">{eta > 0 ? `${eta} mins` : 'Arrived!'}</p>
                </div>
              </div>
              <p className="text-xs text-green-600">{hasArrived ? 'Technician has reached!' : 'Estimated time of arrival'}</p>
            </div>
          </div>

          {/* Service Details */}
          <div className="bg-white rounded-2xl border border-[#E6A11A]/20 p-6 mb-6 shadow-sm">
            <h3 className="font-bold text-[#1E3A5F] text-lg mb-4">Service Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between pb-3 border-b border-[#E6A11A]/10">
                <span className="text-[#4B5563]">Service:</span>
                <span className="font-semibold text-[#1E3A5F]">{active.service}</span>
              </div>
              <div className="flex justify-between pb-3 border-b border-[#E6A11A]/10">
                <span className="text-[#4B5563]">Amount:</span>
                <span className="font-semibold text-[#E6A11A]">₹{active.amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#4B5563]">Status:</span>
                <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                  🟢 On the Way
                </span>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-2xl border border-[#E6A11A]/20 p-6 mb-24 shadow-sm">
            <h3 className="font-bold text-[#1E3A5F] text-lg mb-4">Timeline</h3>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-4 h-4 bg-green-600 rounded-full"></div>
                  <div className="w-1 h-12 bg-gray-200"></div>
                </div>
                <div>
                  <p className="font-semibold text-[#1E3A5F]">Booking Confirmed</p>
                  <p className="text-xs text-[#9CA3AF]">Payment received</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
                  <div className="w-1 h-12 bg-gray-200"></div>
                </div>
                <div>
                  <p className="font-semibold text-[#1E3A5F]">Technician On the Way</p>
                  <p className="text-xs text-[#9CA3AF]">Started from location, {Math.ceil(eta)} mins away</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                </div>
                <div>
                  <p className="font-semibold text-[#1E3A5F]">Technician Arrives</p>
                  <p className="text-xs text-[#9CA3AF]">Share OTP for verification</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-[#E6A11A]/20 p-4 shadow-2xl z-50">
            <div className="mx-auto max-w-4xl space-y-3">
              {!hasArrived ? (
                <>
                  <button
                    onClick={() => alert(`Calling ${active.technicianName}...`)}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 px-4 rounded-lg transition"
                  >
                    📞 Call Technician
                  </button>
                  <button
                    onClick={() => navigate('/customer/home')}
                    className="w-full border border-[#E6A11A]/30 bg-white text-[#1E3A5F] font-bold py-3 px-4 rounded-lg transition hover:bg-[#CFEDEE]/30"
                  >
                    Back to Home
                  </button>
                </>
              ) : (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-500 rounded-2xl p-6">
                  <div className="text-center mb-4">
                    <div className="w-16 h-16 mx-auto bg-green-500 rounded-full flex items-center justify-center mb-3 animate-bounce">
                      <span className="text-3xl">✓</span>
                    </div>
                    <h3 className="text-xl font-bold text-green-800 mb-1">Technician Arrived!</h3>
                    <p className="text-sm text-green-700">{active.technicianName} has reached your location</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* OTP Verification Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative animate-[slideUp_0.3s_ease-out]">
            {/* Success Icon */}
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-lg">
              <span className="text-4xl">✓</span>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-[#1E3A5F] text-center mb-2">
              Technician Arrived!
            </h2>
            <p className="text-center text-[#4B5563] mb-6">
              Please ask {active.technicianName} for the OTP to verify their arrival and start the service
            </p>

            {/* OTP Form */}
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#1E3A5F] mb-2">
                  Enter OTP
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value)
                    setOtpError('')
                  }}
                  placeholder="e.g., 1234"
                  maxLength="6"
                  className="w-full px-4 py-3 text-center text-2xl font-bold tracking-widest border-2 border-[#E6A11A]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E6A11A] focus:border-transparent"
                  autoFocus
                />
                {otpError && (
                  <p className="text-red-600 text-sm mt-2 text-center font-semibold">
                    {otpError}
                  </p>
                )}
                <p className="text-xs text-[#9CA3AF] mt-2 text-center">
                  Mock OTP for demo: <span className="font-bold text-[#E6A11A]">{active?.otp || '1234'}</span>
                </p>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-[#E6A11A] to-[#F0B329] hover:from-[#C88B12] hover:to-[#E6A11A] text-white font-bold py-4 px-6 rounded-xl transition shadow-lg"
              >
                Verify & Start Service
              </button>

              <button
                type="button"
                onClick={() => setShowOtpModal(false)}
                className="w-full border-2 border-[#E6A11A]/30 text-[#1E3A5F] font-semibold py-3 px-6 rounded-xl hover:bg-[#CFEDEE]/30 transition"
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

export default TechnicianTracking

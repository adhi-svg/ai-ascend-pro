import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  fetchCategories,
  fetchComplaints,
  fetchEarnings,
  fetchNearbyJobs,
  fetchTechnicians,
  postBooking,
  submitComplaint,
  updateJobStatus,
  completeJobWithOtp,
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
  getCurrentUser,
} from '../services/api'

const AppContext = createContext()

const technicianPlaceholderImages = [
  'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=320&h=320&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=320&h=320&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=320&h=320&q=80',
  'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=320&h=320&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=320&h=320&q=80',
  'https://images.unsplash.com/photo-1463453091185-61582044d556?auto=format&fit=crop&w=320&h=320&q=80',
]

const getPricing = (distance, rating) => {
  if (distance <= 2) return 99
  if (distance <= 6) return 120
  if (rating >= 4.8 || distance > 6) return 150
  return 120
}

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(() => getCurrentUser())
  const [categories, setCategories] = useState([])
  const [techs, setTechs] = useState([])
  const [jobs, setJobs] = useState([])
  const [complaints, setComplaints] = useState([])
  const [earnings, setEarnings] = useState({ total: 0, jobs: [] })
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)
  const [introShown, setIntroShown] = useState(false)
  const [currentLocation, setCurrentLocationState] = useState(() => {
    const saved = localStorage.getItem('user_location')
    return saved ? JSON.parse(saved) : null
  })

  // Sync localStorage user changes with context state
  useEffect(() => {
    const handleStorageChange = () => {
      const updatedUser = getCurrentUser()
      console.log('[AppContext] Storage change detected, user:', updatedUser?.email)
      setUser(updatedUser)
    }

    const pollUser = setInterval(() => {
      const storedUser = getCurrentUser()
      setUser(prev => {
        // Only update if it actually changed
        if (JSON.stringify(prev) !== JSON.stringify(storedUser)) {
          if (storedUser) {
            console.log('[AppContext] User updated from localStorage:', storedUser.email)
          }
          return storedUser
        }
        return prev
      })
    }, 50)

    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(pollUser)
    }
  }, [])

  const setCurrentLocation = (location) => {
    setCurrentLocationState(location)
    if (location) {
      localStorage.setItem('user_location', JSON.stringify(location))
    } else {
      localStorage.removeItem('user_location')
    }
  }

  const getAddressFromCoords = async (lat, lng) => {
    try {
      // Using OpenStreetMap's Nominatim geocoding service (free, no API key required)
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      console.log('Fetching address from OpenStreetMap Nominatim...')
      
      const response = await fetch(url)
      const data = await response.json()
      
      console.log('Nominatim API response:', data)

      if (data.address) {
        const address = data.display_name
        console.log('Address found:', address)
        return address
      } else {
        console.warn('No address found for coordinates')
        setToast({ type: 'warning', message: 'No address found for this location' })
      }

      return null
    } catch (error) {
      console.error('Error fetching address:', error)
      return null
    }
  }

  useEffect(() => {
    const bootstrap = async () => {
      if (!user) {
        setLoading(false)
        return
      }
      
      setLoading(true)
      console.log('[AppContext] Bootstrap started for user:', user.email || user.phone)
      
      // Safety timeout - ensure loading never stays true for more than 10 seconds
      const safetyTimeout = setTimeout(() => {
        console.warn('[AppContext] Bootstrap timeout - forcing loading false')
        setLoading(false)
      }, 10000)
      
      try {
        // Fetch data with individual error handling to prevent one failure from blocking everything
        const [cats, t, j, c] = await Promise.allSettled([
          fetchCategories().catch(err => { console.error('[AppContext] Categories error:', err); return [] }),
          fetchTechnicians().catch(err => { console.error('[AppContext] Technicians error:', err); return [] }),
          fetchNearbyJobs().catch(err => { console.error('[AppContext] Jobs error:', err); return [] }),
          fetchComplaints().catch(err => { console.error('[AppContext] Complaints error:', err); return [] }),
        ]).then(results => results.map(r => r.status === 'fulfilled' ? r.value : []))
        
        console.log('[AppContext] Bootstrap data fetched:', {
          categories: cats?.length,
          technicians: t?.length,
          jobs: j?.length,
          complaints: c?.length
        })
        
        setCategories(Array.isArray(cats) ? cats : [])
        setTechs(
          Array.isArray(t) ? t.map((tech, index) => ({
            ...tech,
            // Transform snake_case to camelCase for frontend compatibility
            isOnline: tech.is_online ?? tech.isOnline ?? false,
            shopAvailable: tech.shop_available ?? tech.shopAvailable ?? false,
            ratingCount: tech.rating_count ?? tech.ratingCount ?? 0,
            totalJobs: tech.total_jobs ?? tech.totalJobs ?? 0,
            services: tech.skills || tech.services || [],
            totalRatings: tech.rating_count ?? tech.ratingCount ?? 0,
            distance: tech.distance || 2.5,
            photoUrl:
              tech.photo_url ||
              tech.profile_photo_url ||
              tech.photoUrl ||
              tech.profilePhotoUrl ||
              technicianPlaceholderImages[index % technicianPlaceholderImages.length],
            confirmationCharge: tech.confirmationCharge || getPricing(tech.distance || 3, tech.rating || 4.5),
          })) : []
        )
        setJobs(Array.isArray(j) ? j : [])
        setComplaints(Array.isArray(c) ? c : [])
        
        // Fetch earnings only for technicians
        if (user.role === 'TECHNICIAN') {
          try {
            const e = await fetchEarnings()
            setEarnings(e)
          } catch (err) {
            console.error('[AppContext] Earnings error:', err)
          }
        }
        
        console.log('[AppContext] Bootstrap complete')
      } catch (error) {
        console.error('[AppContext] Bootstrap fatal error:', error)
        if (error?.message?.includes('Session expired')) {
          setUser(null)
        }
        // Don't show error toast for bootstrap failures - let the page load
        console.warn('[AppContext] Continuing with empty data after error')
        setCategories([])
        setTechs([])
        setJobs([])
        setComplaints([])
      } finally {
        clearTimeout(safetyTimeout)
        setLoading(false)
        console.log('[AppContext] Bootstrap finished, loading set to false')
      }
    }
    bootstrap()
  }, [user])

  const requestLocation = async () => {
    if (!navigator.geolocation) {
      setToast({ type: 'warning', message: 'Location not supported by browser' })
      return
    }

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        })
      })

      const lat = position.coords.latitude
      const lng = position.coords.longitude
      
      console.log('Got coordinates:', { lat, lng })
      const address = await getAddressFromCoords(lat, lng)

      if (address) {
        setToast({ type: 'success', message: 'Location detected successfully' })
      } else {
        setToast({ type: 'success', message: 'Location coordinates detected' })
      }
      
      return { lat, lng, address }
    } catch (error) {
      if (error?.code === 1) {
        setToast({ type: 'warning', message: 'Location permission denied. Allow it in browser settings.' })
      } else if (error?.code === 2) {
        setToast({ type: 'warning', message: 'Location unavailable. Check device location services.' })
      } else if (error?.code === 3) {
        setToast({ type: 'warning', message: 'Location request timed out. Try again.' })
      } else {
        setToast({ type: 'warning', message: 'Location access failed. Try again.' })
      }
      return null
    }
  }

  const login = async ({ email, password }) => {
    try {
      setLoading(true)
      const data = await apiLogin(email, password)
      const userData = {
        ...data.user,
        email: email || data.user.email
      }
      setUser(userData)
      setToast({ type: 'success', message: 'Logged in successfully' })
      return userData
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Login failed' })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const register = async ({ email, password, name, phone, role = 'customer', skills = [] }) => {
    try {
      setLoading(true)
      const data = await apiRegister({ email, password, name, phone, role, skills })
      setUser(data.user)
      setToast({ type: 'success', message: 'Account created successfully' })
      return data.user
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Registration failed' })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const createBooking = useCallback(async (payload) => {
    try {
      setLoading(true)

      const desiredCategory = (payload?.complaint_category || payload?.service || payload?.category || '').trim()
      const resolvedCategory = categories.find((cat) => {
        if (!desiredCategory) return false
        return String(cat?.name || '').toLowerCase() === desiredCategory.toLowerCase()
      })

      const fallbackCategory = categories[0]
      const categoryId = resolvedCategory?.id || fallbackCategory?.id

      if (!categoryId) {
        throw new Error('No service category available for booking')
      }

      const address = payload?.address || currentLocation?.address || null
      const notes = payload?.details || payload?.description || payload?.notes || null

      const apiPayload = {
        category_id: categoryId,
        address,
        notes,
        complaint_text: payload?.complaint_text || null,
        complaint_category: payload?.complaint_category || null,
        complaint_urgency: payload?.complaint_urgency || null,
        auto_assign: !!payload?.auto_assign,
      }

      const booking = await postBooking(apiPayload)
      setJobs((prev) => [...prev, booking])
      setToast({ type: 'success', message: 'Booking placed. Technician will confirm.' })
      return booking
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Booking failed' })
      throw error
    } finally {
      setLoading(false)
    }
  }, [categories, currentLocation])

  const updateJob = async (jobId, status) => {
    setLoading(true)
    await updateJobStatus(jobId, status)
    setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, status } : j)))
    setLoading(false)
  }

  const completeJob = async (jobId, otp) => {
    setLoading(true)
    const res = await completeJobWithOtp(jobId, otp)
    setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, status: 'completed' } : j)))
    setLoading(false)
    setToast({ type: 'success', message: 'Job completed' })
    return res
  }

  const logout = () => {
    apiLogout()
    setUser(null)
    setJobs([])
    setComplaints([])
    setEarnings({ total: 0, jobs: [] })
    setToast({ type: 'info', message: 'Logged out' })
  }

  const updatePhone = (newPhone) => {
    setUser((prev) => (prev ? { ...prev, phone: newPhone } : prev))
    setToast({ type: 'success', message: 'Phone number updated' })
  }

  const updatePassword = (newPassword) => {
    setUser((prev) => (prev ? { ...prev, password: newPassword } : prev))
    setToast({ type: 'success', message: 'Password updated' })
  }

  const addComplaint = async (payload) => {
    setLoading(true)
    const saved = await submitComplaint(payload)
    setComplaints((prev) => [saved, ...prev])
    setLoading(false)
    setToast({ type: 'success', message: 'Complaint submitted' })
  }

  const contextValue = useMemo(
    () => ({
      user,
      categories,
      techs,
      jobs,
      complaints,
      earnings,
      loading,
      toast,
      setToast,
      setJobs,
      setUser,
      currentLocation,
      setCurrentLocation,
      requestLocation,
      login,
      register,
      createBooking,
      updateJob,
      completeJob,
      logout,
      updatePhone,
      updatePassword,
      addComplaint,
      getPricing,
      introShown,
      setIntroShown,
    }),
    [user, categories, techs, jobs, complaints, earnings, loading, toast, createBooking, currentLocation],
  )

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
}

export const useApp = () => useContext(AppContext)

import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { Hourglass } from 'lucide-react'

const OAuthCallback = () => {
  const navigate = useNavigate()
  const { setUser, setToast } = useApp()
  const authCompleteRef = useRef(false)

  useEffect(() => {
    // Prevent duplicate execution
    if (authCompleteRef.current) return
    authCompleteRef.current = true

    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    const userParam = params.get('user')
    const error = params.get('error')

    // ── Handle error redirects from backend ──
    if (error) {
      console.error('[OAuthCallback] Error from backend:', error)
      if (setToast) setToast({ type: 'error', message: `Login error: ${error}` })
      setTimeout(() => navigate('/login', { replace: true }), 2000)
      return
    }

    // ── Cognito flow: backend redirected here with token + user in URL ──
    if (token && userParam) {
      try {
        const userData = JSON.parse(userParam)

        // Store in localStorage (same keys the rest of the app expects)
        localStorage.setItem('auth_token', token)
        localStorage.setItem('user_info', JSON.stringify(userData))

        // Update React context
        if (setUser) setUser(userData)

        // Security: remove auth params from the URL
        window.history.replaceState({}, document.title, window.location.pathname)

        if (setToast) setToast({ type: 'success', message: `Welcome, ${userData.name || 'User'}!` })

        console.log('[OAuthCallback] Cognito login complete, navigating to /customer/home')
        navigate('/customer/home', { replace: true })
      } catch (err) {
        console.error('[OAuthCallback] Failed to process Cognito login data:', err)
        if (setToast) setToast({ type: 'error', message: 'Failed to process login data' })
        setTimeout(() => navigate('/login', { replace: true }), 2000)
      }
      return
    }

    // ── No valid params — redirect to login ──
    console.warn('[OAuthCallback] No token or code found in URL, redirecting to login')
    setTimeout(() => navigate('/login', { replace: true }), 1000)
  }, [navigate, setUser, setToast])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#CFEDEE] via-[#E8F8F9] to-[#D4F0F2]">
      <div className="text-center">
        <div className="animate-spin mb-4 text-4xl">
          <Hourglass size={16} className="inline mr-1" />
        </div>
        <p className="text-[#1E3A5F] font-semibold">Processing your login...</p>
        <p className="text-[#1E3A5F]/60 text-sm mt-2">Please wait</p>
        <p className="text-[#FF6B6B]/60 text-xs mt-4">If this takes more than 10 seconds, please try again.</p>
      </div>
    </div>
  )
}

export default OAuthCallback

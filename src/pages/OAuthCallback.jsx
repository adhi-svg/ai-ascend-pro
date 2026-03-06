import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { exchangeGoogleCode } from '../services/api'

const OAuthCallback = () => {
  const navigate = useNavigate()
  const { setUser, setToast } = useApp()
  const authCompleteRef = useRef(false)

  useEffect(() => {
    // Prevent duplicate execution
    if (authCompleteRef.current) return
    authCompleteRef.current = true

    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    const state = params.get('state')
    const error = params.get('error')
    const storedState = sessionStorage.getItem('oauth_state')

    console.log('[OAuthCallback] Received OAuth callback', {
      code: code?.substring(0, 10) + '...',
      state,
      storedState,
      error
    })

    if (error) {
      console.error('[OAuthCallback] OAuth error from Google:', error)
      sessionStorage.removeItem('oauth_state')
      setToast({ type: 'error', message: `Google OAuth error: ${error}` })
      setTimeout(() => navigate('/login', { replace: true }), 2000)
      return
    }

    if (!code || !state || !storedState || state !== storedState) {
      console.error('[OAuthCallback] Invalid state or missing code', { code: !!code, state: !!state, storedState: !!storedState, match: state === storedState })
      sessionStorage.removeItem('oauth_state')
      setToast({ type: 'error', message: 'Authentication validation failed - state mismatch' })
      setTimeout(() => navigate('/login', { replace: true }), 2000)
      return
    }

    const finalize = async () => {
      try {
        sessionStorage.removeItem('oauth_state')

        console.log('[OAuthCallback] Exchanging code for token...')

        // Add timeout
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Exchange request timed out - backend not responding')), 10000)
        )

        const exchangePromise = exchangeGoogleCode(code)
        const data = await Promise.race([exchangePromise, timeoutPromise])

        console.log('[OAuthCallback] Code exchanged successfully, user:', data?.user?.email)

        // Verify localStorage was actually set
        const token = localStorage.getItem('auth_token')
        const userInfo = localStorage.getItem('user_info')

        console.log('[OAuthCallback] localStorage check - token:', !!token, 'user:', !!userInfo)

        if (!token || !userInfo) {
          throw new Error('Failed to save authentication data')
        }

        // Update the context with the user data
        if (data?.user) {
          setUser(data.user)
        }

        setToast({ type: 'success', message: 'Welcome!' })

        // Security: remove auth params from the URL
        window.history.replaceState({}, document.title, window.location.pathname)

        // Navigate to dashboard
        console.log('[OAuthCallback] Navigating to /customer/home...')
        navigate('/customer/home', { replace: true })
      } catch (err) {
        console.error('[OAuthCallback] Authentication error:', err)
        authCompleteRef.current = false
        setToast({ type: 'error', message: err.message || 'Login failed' })
        setTimeout(() => navigate('/login', { replace: true }), 2000)
      }
    }

    finalize()
  }, [navigate, setUser, setToast])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#CFEDEE] via-[#E8F8F9] to-[#D4F0F2]">
      <div className="text-center">
        <div className="animate-spin mb-4 text-4xl"><Hourglass size={16} className="inline mr-1" /></div>
        <p className="text-[#1E3A5F] font-semibold">Processing your login...</p>
        <p className="text-[#1E3A5F]/60 text-sm mt-2">Please wait</p>
        <p className="text-[#FF6B6B]/60 text-xs mt-4">If this takes more than 10 seconds, please try again.</p>
      </div>
    </div>
  )
}

export default OAuthCallback

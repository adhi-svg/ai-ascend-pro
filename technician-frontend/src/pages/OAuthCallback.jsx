import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { exchangeGoogleCode } from '../services/techApi'

const OAuthCallback = () => {
  const navigate = useNavigate()
  const authCompleteRef = useRef(false)
  const [errorStatus, setErrorStatus] = useState('')

  useEffect(() => {
    if (authCompleteRef.current) return
    authCompleteRef.current = true

    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    const state = params.get('state')
    const error = params.get('error')
    const storedState = sessionStorage.getItem('oauth_state')

    if (error) {
      sessionStorage.removeItem('oauth_state')
      setErrorStatus(`Google OAuth error: ${error}`)
      setTimeout(() => navigate('/login', { replace: true }), 2000)
      return
    }

    if (!code || !state || !storedState || state !== storedState) {
      sessionStorage.removeItem('oauth_state')
      setErrorStatus('Authentication validation failed - state mismatch')
      setTimeout(() => navigate('/login', { replace: true }), 2000)
      return
    }

    const finalize = async () => {
      try {
        sessionStorage.removeItem('oauth_state')
        const exchangePromise = exchangeGoogleCode(code)
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Exchange request timed out - backend not responding')), 10000)
        )

        await Promise.race([exchangePromise, timeoutPromise])

        // Verify localStorage was actually set
        const token = localStorage.getItem('tech_auth_token')
        const userInfo = localStorage.getItem('tech_user_info')

        if (!token || !userInfo) {
          throw new Error('Failed to save authentication data')
        }

        // Navigate with reload to initialize AuthContext
        window.location.href = '/dashboard'
      } catch (err) {
        console.error('[OAuthCallback] Authentication error:', err)
        authCompleteRef.current = false
        setErrorStatus(err.message || 'Login failed')
        setTimeout(() => navigate('/login', { replace: true }), 2000)
      }
    }

    finalize()
  }, [navigate])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#CFEDEE] via-[#E8F8F9] to-[#D4F0F2]">
      <div className="text-center">
        <div className="animate-spin mb-4 flex justify-center">
          <svg className="w-8 h-8 text-[#1E3A5F]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <p className="text-[#1E3A5F] font-semibold">
          {errorStatus ? errorStatus : 'Processing your login...'}
        </p>
        {!errorStatus && (
          <>
            <p className="text-[#1E3A5F]/60 text-sm mt-2">Please wait</p>
            <p className="text-[#FF6B6B]/60 text-xs mt-4">If this takes more than 10 seconds, please try again.</p>
          </>
        )}
      </div>
    </div>
  )
}

export default OAuthCallback

import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const OAuthCallback = () => {
  const navigate = useNavigate()
  const authCompleteRef = useRef(false)
  const [errorStatus, setErrorStatus] = useState('')

  useEffect(() => {
    if (authCompleteRef.current) return
    authCompleteRef.current = true

    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    const userParam = params.get('user')
    const error = params.get('error')

    // ── Handle error redirects from backend ──
    if (error) {
      setErrorStatus(`Login error: ${error}`)
      setTimeout(() => navigate('/login', { replace: true }), 2000)
      return
    }

    // ── Cognito flow: backend redirected here with token + user in URL ──
    if (token && userParam) {
      try {
        const userData = JSON.parse(userParam)

        // Store in localStorage (same keys the technician app expects)
        localStorage.setItem('tech_auth_token', token)
        localStorage.setItem('tech_user_info', JSON.stringify(userData))

        // Security: remove auth params from the URL
        window.history.replaceState({}, document.title, window.location.pathname)

        console.log('[OAuthCallback] Cognito login complete for technician, navigating to /dashboard')

        // Full page reload so AuthContext picks up the new token
        window.location.href = '/dashboard'
      } catch (err) {
        console.error('[OAuthCallback] Failed to process Cognito login data:', err)
        setErrorStatus('Failed to process login data')
        setTimeout(() => navigate('/login', { replace: true }), 2000)
      }
      return
    }

    // ── No valid params — redirect to login ──
    console.warn('[OAuthCallback] No token found in URL, redirecting to login')
    setTimeout(() => navigate('/login', { replace: true }), 1000)
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

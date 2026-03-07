import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import StepBasic from './steps/StepBasic'
import StepProfessional from './steps/StepProfessional'
import StepAadhaar from './steps/StepAadhaar'
import StepAgreement from './steps/StepAgreement'

// Removed localStorage application logic — now using real backend API via AuthContext


export default function TechnicianRegister() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    // Step 1
    fullName: '',
    mobile: '',
    email: '',
    password: '',
    confirmPassword: '',
    profilePhoto: null,
    // Step 2
    primarySkill: '',
    experience: '',
    serviceRadius: '',
    baseVisitFee: '',
    hasShop: false,
    shopName: '',
    shopAddress: '',
    shopLocation: null,
    // Step 3
    aadhaarNumber: '',
    aadhaarFront: null,
    aadhaarBack: null,
    selfie: null,
    // Step 4
    acceptTerms: false,
    acceptConduct: false,
  })
  const [errors, setErrors] = useState({})

  const totalSteps = 4

  const stepTitles = [
    'Basic Information',
    'Professional Details',
    'Aadhaar Verification',
    'Agreement & Submission',
  ]

  const updateFormData = (updates) => {
    setFormData((prev) => ({ ...prev, ...updates }))
    // Clear errors for updated fields
    const updatedFields = Object.keys(updates)
    setErrors((prev) => {
      const newErrors = { ...prev }
      updatedFields.forEach((field) => delete newErrors[field])
      return newErrors
    })
  }

  const validateStep = (step) => {
    const newErrors = {}

    switch (step) {
      case 1:
        if (!formData.fullName?.trim()) newErrors.fullName = 'Full name is required'
        if (!formData.mobile || formData.mobile.length !== 10) newErrors.mobile = 'Valid 10-digit mobile number is required'
        if (!formData.password || formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters'
        if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match'
        break

      case 2:
        if (!formData.primarySkill) newErrors.primarySkill = 'Please select your primary skill'
        if (!formData.experience) newErrors.experience = 'Please select your experience level'
        if (!formData.serviceRadius) newErrors.serviceRadius = 'Please select your service radius'
        if (formData.hasShop) {
          if (!formData.shopName?.trim()) newErrors.shopName = 'Shop name is required'
          if (!formData.shopAddress?.trim()) newErrors.shopAddress = 'Shop address is required'
        }
        break

      case 3:
        if (!formData.aadhaarNumber || formData.aadhaarNumber.length !== 12) newErrors.aadhaarNumber = 'Valid 12-digit Aadhaar number is required'
        if (!formData.aadhaarFront) newErrors.aadhaarFront = 'Please upload Aadhaar front side'
        if (!formData.aadhaarBack) newErrors.aadhaarBack = 'Please upload Aadhaar back side'
        if (!formData.selfie) newErrors.selfie = 'Please upload your selfie'
        break

      case 4:
        if (!formData.acceptTerms) newErrors.acceptTerms = 'You must accept the terms and conditions'
        if (!formData.acceptConduct) newErrors.acceptConduct = 'You must agree to professional conduct rules'
        break

      default:
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps))
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmit = async () => {
    if (!validateStep(4)) return

    setLoading(true)
    setError('')

    // Map frontend fields (mobile, fullName) to backend fields (phone, name)
    const payload = {
      phone: formData.mobile,
      name: formData.fullName,
      email: formData.email,
      password: formData.password,
      role: 'technician',
      // Include technician specific metadata
      skill: formData.primarySkill,
      experience: formData.experience,
      radius_km: formData.serviceRadius,
      base_visit_fee: formData.baseVisitFee,
      has_shop: formData.hasShop,
      shop_name: formData.shopName,
      shop_address: formData.shopAddress,
      shop_location: formData.shopLocation ? JSON.stringify(formData.shopLocation) : null,
      aadhaar_number: formData.aadhaarNumber,
      // For images, we would ideally upload them first or send URLs if they were already uploaded
      profile_photo_url: formData.profilePhoto,
      aadhaar_front_url: formData.aadhaarFront,
      aadhaar_back_url: formData.aadhaarBack,
      selfie_url: formData.selfie,
    }

    try {
      const result = await register(payload)
      if (result.success) {
        setSubmitted(true)
        // Auto-navigate to dashboard or let user read the success screen
        setTimeout(() => navigate('/dashboard'), 3000)
      } else {
        setError(result.error || 'Registration failed. Please check your details.')
        setCurrentStep(1) // Go back to first step to check
      }
    } catch (err) {
      setError('Connection error. Is the backend server running?')
    } finally {
      setLoading(false)
    }
  }

  const handleBackToPrevious = () => {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate('/')
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <StepBasic formData={formData} updateFormData={updateFormData} errors={errors} />
      case 2:
        return <StepProfessional formData={formData} updateFormData={updateFormData} errors={errors} />
      case 3:
        return <StepAadhaar formData={formData} updateFormData={updateFormData} errors={errors} />
      case 4:
        return <StepAgreement formData={formData} updateFormData={updateFormData} errors={errors} onSubmit={handleSubmit} loading={loading} />
      default:
        return null
    }
  }

  if (submitted) {
    return (
      <div className="relative isolate mx-auto flex min-h-screen w-full flex-col items-center justify-center px-4 py-10 bg-gradient-to-br from-[#CFEDEE] via-[#E8F8F9] to-[#D4F0F2]">
        <div className="pointer-events-none absolute -left-16 top-10 h-96 w-96 rounded-full bg-[#E6A11A]/15 blur-[140px]" />
        <div className="pointer-events-none absolute -right-10 bottom-4 h-96 w-96 rounded-full bg-[#14B8A6]/15 blur-[140px]" />

        <div className="relative w-full max-w-2xl">
          <div className="rounded-2xl bg-white/95 backdrop-blur-sm border border-[#E6A11A]/20 shadow-xl p-8 text-center space-y-6">
            {/* Success Icon */}
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <svg className="h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            {/* Title */}
            <div>
              <h1 className="text-3xl font-bold text-[#1E3A5F]">Application Submitted!</h1>
              <p className="mt-2 text-gray-600">Your application is now under review</p>
            </div>

            {/* Status Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-yellow-100 px-6 py-3 border border-yellow-200">
              <svg className="h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-semibold text-yellow-800">Pending Admin Approval</span>
            </div>

            {/* Information */}
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-6 text-left space-y-3">
              <div className="flex gap-3">
                <svg className="h-6 w-6 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm text-blue-700 space-y-2">
                  <p className="font-semibold">What happens next?</p>
                  <ul className="space-y-1 text-xs list-disc list-inside">
                    <li>Admin will review your documents and details within 24-48 hours</li>
                    <li>You will receive an SMS/email notification once approved</li>
                    <li>After approval, you can log in and start receiving booking requests</li>
                    <li>You cannot receive bookings until your account is verified and approved</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Application Details */}
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-left space-y-2">
              <h3 className="font-semibold text-[#1E3A5F] mb-3">Your Application Details</h3>
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium text-[#1E3A5F]">{formData.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Mobile:</span>
                  <span className="font-medium text-[#1E3A5F]">{formData.mobile}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Primary Skill:</span>
                  <span className="font-medium text-[#1E3A5F]">{formData.primarySkill}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Application ID:</span>
                  <span className="font-mono text-xs text-gray-500">TEC{Date.now().toString().slice(-8)}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-4">
              <button
                onClick={() => navigate('/login')}
                className="w-full rounded-full px-6 py-4 text-lg font-semibold text-white transition-all hover:shadow-lg"
                style={{ background: '#E6A11A' }}
              >
                Go to Login Page
              </button>
              <button
                onClick={() => navigate('/')}
                className="w-full rounded-full px-6 py-4 text-lg font-semibold text-[#1E3A5F] border-2 border-[#1E3A5F] transition-all hover:bg-[#1E3A5F] hover:text-white"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative isolate mx-auto flex min-h-screen w-full flex-col items-center px-4 py-10 bg-gradient-to-br from-[#CFEDEE] via-[#E8F8F9] to-[#D4F0F2]">
      <div className="pointer-events-none absolute -left-16 top-10 h-96 w-96 rounded-full bg-[#E6A11A]/15 blur-[140px]" />
      <div className="pointer-events-none absolute -right-10 bottom-4 h-96 w-96 rounded-full bg-[#14B8A6]/15 blur-[140px]" />

      <div className="relative w-full max-w-4xl space-y-6">
        <div>
          <button
            type="button"
            onClick={handleBackToPrevious}
            className="rounded-full border border-[#1E3A5F]/20 px-4 py-2 text-sm font-semibold text-[#1E3A5F] transition-all hover:border-[#1E3A5F]"
          >
            Back
          </button>
        </div>
        {/* Header */}
        <div className="text-center">
          <span className="mx-auto mb-4 flex w-fit items-center justify-center rounded-3xl bg-[#CFEDEE] p-3 shadow-[0_20px_60px_rgba(30,58,95,0.15)]">
            <img src="/logo.png" alt="Fyxion" className="h-20 w-20 object-contain" />
          </span>
          <h1 className="text-3xl font-bold text-[#1E3A5F]">Become a Fyxion Partner</h1>
          <p className="mt-2 text-sm text-gray-600">Complete the registration to start earning</p>
        </div>

        {/* Progress Bar */}
        <div className="rounded-2xl bg-white/95 backdrop-blur-sm border border-[#E6A11A]/20 shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            {stepTitles.map((title, index) => {
              const stepNumber = index + 1
              const isActive = stepNumber === currentStep
              const isCompleted = stepNumber < currentStep

              return (
                <div key={stepNumber} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full border-2 font-semibold transition-all ${isCompleted
                        ? 'bg-green-500 border-green-500 text-white'
                        : isActive
                          ? 'bg-[#E6A11A] border-[#E6A11A] text-white'
                          : 'bg-white border-gray-300 text-gray-400'
                        }`}
                    >
                      {isCompleted ? (
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        stepNumber
                      )}
                    </div>
                    <span
                      className={`mt-2 text-xs font-semibold text-center hidden md:block ${isActive ? 'text-[#1E3A5F]' : 'text-gray-500'
                        }`}
                    >
                      {title}
                    </span>
                  </div>
                  {stepNumber < totalSteps && (
                    <div
                      className={`h-0.5 flex-1 mx-2 transition-all ${stepNumber < currentStep ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                    />
                  )}
                </div>
              )
            })}
          </div>

          {/* Mobile step title */}
          <div className="md:hidden text-center mt-4">
            <span className="text-sm font-semibold text-[#1E3A5F]">
              Step {currentStep}: {stepTitles[currentStep - 1]}
            </span>
          </div>
        </div>

        {/* Step Content */}
        <div className="rounded-2xl bg-white/95 backdrop-blur-sm border border-[#E6A11A]/20 shadow-xl p-8">
          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
          {renderStep()}
        </div>

        {/* Navigation Buttons */}
        {currentStep < 4 && (
          <div className="flex gap-4">
            {currentStep > 1 && (
              <button
                onClick={handleBack}
                className="flex-1 rounded-full border-2 border-gray-300 px-6 py-4 text-lg font-semibold text-gray-700 transition-all hover:border-[#1E3A5F] hover:text-[#1E3A5F]"
              >
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              className={`rounded-full px-6 py-4 text-lg font-semibold text-white transition-all hover:shadow-lg ${currentStep === 1 ? 'w-full' : 'flex-1'
                }`}
              style={{ background: '#E6A11A' }}
            >
              Next Step
            </button>
          </div>
        )}

        {currentStep === 4 && (
          <button
            onClick={handleBack}
            className="w-full rounded-full border-2 border-gray-300 px-6 py-4 text-lg font-semibold text-gray-700 transition-all hover:border-[#1E3A5F] hover:text-[#1E3A5F]"
          >
            Back
          </button>
        )}
      </div>
    </div>
  )
}

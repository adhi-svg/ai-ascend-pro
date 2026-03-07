import { useState } from 'react'

export default function StepBasic({ formData, updateFormData, errors }) {
  const [otpSent, setOtpSent] = useState(false)
  const [otpVerified, setOtpVerified] = useState(false)
  const [otp, setOtp] = useState('')
  const [previewUrl, setPreviewUrl] = useState(null)

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result)
        updateFormData({ profilePhoto: file })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSendOTP = () => {
    if (formData.mobile && formData.mobile.length === 10) {
      setOtpSent(true)
      // UI only - no actual API call yet
    }
  }

  const handleVerifyOTP = () => {
    if (otp.length === 6) {
      setOtpVerified(true)
      // UI only - no actual API call yet
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-[#E6A11A]/20 bg-[#CFEDEE]/30 p-4">
        <h2 className="text-xl font-bold text-[#1E3A5F]">Basic Information</h2>
        <p className="text-xs text-[#4B5563] mt-1">
          Let's start with your basic details. All fields marked with * are required.
        </p>
      </div>

      {/* Profile Photo */}
      <div className="flex flex-col items-center space-y-3">
        <div className="relative">
          <div className="h-24 w-24 rounded-full border-4 border-[#E6A11A]/30 bg-gray-100 overflow-hidden">
            {previewUrl ? (
              <img src={previewUrl} alt="Profile" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center">
                <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            )}
          </div>
          <label className="absolute bottom-0 right-0 cursor-pointer rounded-full bg-[#E6A11A] p-2 text-white shadow-lg hover:bg-[#F0B329] transition-colors">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
          </label>
        </div>
        <p className="text-xs text-gray-500">Upload your profile photo</p>
      </div>

      {/* Full Name */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-[#1E3A5F]">
          Full Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.fullName || ''}
          onChange={(e) => updateFormData({ fullName: e.target.value })}
          placeholder="Enter your full name"
          className="w-full rounded-lg border px-4 py-3 transition-colors focus:outline-none focus:ring-2 focus:ring-[#E6A11A]"
          style={{ borderColor: errors?.fullName ? '#EF4444' : '#D1D5DB', color: '#1E3A5F' }}
        />
        {errors?.fullName && <p className="mt-1 text-xs text-red-500">{errors.fullName}</p>}
      </div>

      {/* Mobile Number */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-[#1E3A5F]">
          Mobile Number <span className="text-xs text-gray-500">(Optional)</span>
        </label>
        <div className="flex gap-2">
          <input
            type="tel"
            value={formData.mobile || ''}
            onChange={(e) => updateFormData({ mobile: e.target.value.replace(/\D/g, '').slice(0, 10) })}
            placeholder="10-digit mobile number"
            disabled={otpVerified}
            className="flex-1 rounded-lg border px-4 py-3 transition-colors focus:outline-none focus:ring-2 focus:ring-[#E6A11A] disabled:bg-gray-100"
            style={{ borderColor: errors?.mobile ? '#EF4444' : '#D1D5DB', color: '#1E3A5F' }}
          />
          {!otpVerified && (
            <button
              type="button"
              onClick={handleSendOTP}
              disabled={!formData.mobile || formData.mobile.length !== 10}
              className="rounded-lg px-6 py-3 text-sm font-semibold text-white transition-all hover:shadow-md disabled:opacity-50"
              style={{ background: '#E6A11A' }}
            >
              {otpSent ? 'Resend OTP' : 'Send OTP'}
            </button>
          )}
          {otpVerified && (
            <div className="flex items-center gap-2 rounded-lg bg-green-50 px-4 py-3 border border-green-200">
              <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm font-semibold text-green-700">Verified</span>
            </div>
          )}
        </div>
        {errors?.mobile && <p className="mt-1 text-xs text-red-500">{errors.mobile}</p>}
      </div>

      {/* OTP Input */}
      {otpSent && !otpVerified && (
        <div className="rounded-lg border border-[#E6A11A]/30 bg-[#CFEDEE]/20 p-4 space-y-3">
          <label className="block text-sm font-semibold text-[#1E3A5F]">
            Enter OTP <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="6-digit OTP"
              className="flex-1 rounded-lg border px-4 py-3 transition-colors focus:outline-none focus:ring-2 focus:ring-[#E6A11A]"
              style={{ borderColor: '#D1D5DB', color: '#1E3A5F' }}
            />
            <button
              type="button"
              onClick={handleVerifyOTP}
              disabled={otp.length !== 6}
              className="rounded-lg px-6 py-3 text-sm font-semibold text-white transition-all hover:shadow-md disabled:opacity-50"
              style={{ background: '#14B8A6' }}
            >
              Verify OTP
            </button>
          </div>
          <p className="text-xs text-gray-500">OTP sent to your mobile number</p>
        </div>
      )}

      {/* Note about Aadhaar */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
        <div className="flex gap-2">
          <svg className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xs text-blue-700">
            Mobile number must be linked with Aadhaar for verification in Step 3.
          </p>
        </div>
      </div>

      {/* Email */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-[#1E3A5F]">
          Email <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          value={formData.email || ''}
          onChange={(e) => updateFormData({ email: e.target.value })}
          placeholder="your.email@example.com"
          className="w-full rounded-lg border px-4 py-3 transition-colors focus:outline-none focus:ring-2 focus:ring-[#E6A11A]"
          style={{ borderColor: errors?.email ? '#EF4444' : '#D1D5DB', color: '#1E3A5F' }}
        />
        {errors?.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
      </div>

      {/* Password */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-[#1E3A5F]">
          Password <span className="text-red-500">*</span>
        </label>
        <input
          type="password"
          value={formData.password || ''}
          onChange={(e) => updateFormData({ password: e.target.value })}
          placeholder="Minimum 6 characters"
          className="w-full rounded-lg border px-4 py-3 transition-colors focus:outline-none focus:ring-2 focus:ring-[#E6A11A]"
          style={{ borderColor: errors?.password ? '#EF4444' : '#D1D5DB', color: '#1E3A5F' }}
        />
        {errors?.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
      </div>

      {/* Confirm Password */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-[#1E3A5F]">
          Confirm Password <span className="text-red-500">*</span>
        </label>
        <input
          type="password"
          value={formData.confirmPassword || ''}
          onChange={(e) => updateFormData({ confirmPassword: e.target.value })}
          placeholder="Re-enter password"
          className="w-full rounded-lg border px-4 py-3 transition-colors focus:outline-none focus:ring-2 focus:ring-[#E6A11A]"
          style={{ borderColor: errors?.confirmPassword ? '#EF4444' : '#D1D5DB', color: '#1E3A5F' }}
        />
        {errors?.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>}
      </div>
    </div>
  )
}

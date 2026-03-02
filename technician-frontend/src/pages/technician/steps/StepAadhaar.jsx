import { useState } from 'react'

export default function StepAadhaar({ formData, updateFormData, errors }) {
  const [verificationStatus, setVerificationStatus] = useState('not-verified') // not-verified | pending | verified
  const [aadhaarFrontPreview, setAadhaarFrontPreview] = useState(null)
  const [aadhaarBackPreview, setAadhaarBackPreview] = useState(null)
  const [selfiePreview, setSelfiePreview] = useState(null)

  const handleAadhaarFrontUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setAadhaarFrontPreview(reader.result)
        updateFormData({ aadhaarFront: file })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAadhaarBackUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setAadhaarBackPreview(reader.result)
        updateFormData({ aadhaarBack: file })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSelfieUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setSelfiePreview(reader.result)
        updateFormData({ selfie: file })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleVerifyAadhaar = () => {
    // UI only - simulate verification
    setVerificationStatus('pending')
    setTimeout(() => {
      setVerificationStatus('verified')
    }, 2000)
  }

  const getStatusBadge = () => {
    switch (verificationStatus) {
      case 'verified':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 border border-green-200">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Verified
          </span>
        )
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700 border border-yellow-200">
            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Pending
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700 border border-gray-200">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Not Verified
          </span>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-[#E6A11A]/20 bg-[#CFEDEE]/30 p-4">
        <h2 className="text-xl font-bold text-[#1E3A5F]">Aadhaar Verification</h2>
        <p className="text-xs text-[#4B5563] mt-1">
          We need your Aadhaar details for identity verification. All documents are securely stored.
        </p>
      </div>

      {/* Aadhaar Number */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-[#1E3A5F]">
          Aadhaar Number <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.aadhaarNumber || ''}
          onChange={(e) => updateFormData({ aadhaarNumber: e.target.value.replace(/\D/g, '').slice(0, 12) })}
          placeholder="Enter 12-digit Aadhaar number"
          maxLength={12}
          className="w-full rounded-lg border px-4 py-3 transition-colors focus:outline-none focus:ring-2 focus:ring-[#E6A11A]"
          style={{ borderColor: errors?.aadhaarNumber ? '#EF4444' : '#D1D5DB', color: '#1E3A5F' }}
        />
        {formData.aadhaarNumber && formData.aadhaarNumber.length === 12 && (
          <p className="mt-1 text-xs text-green-600 flex items-center gap-1">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Valid Aadhaar number format
          </p>
        )}
        {errors?.aadhaarNumber && <p className="mt-1 text-xs text-red-500">{errors.aadhaarNumber}</p>}
      </div>

      {/* Upload Aadhaar Front */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-[#1E3A5F]">
          Upload Aadhaar Front <span className="text-red-500">*</span>
        </label>
        <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center hover:border-[#E6A11A] transition-colors">
          {aadhaarFrontPreview ? (
            <div className="space-y-3">
              <img src={aadhaarFrontPreview} alt="Aadhaar Front" className="mx-auto max-h-48 rounded-lg" />
              <label className="inline-block cursor-pointer rounded-lg bg-[#E6A11A] px-4 py-2 text-sm font-semibold text-white hover:bg-[#F0B329] transition-colors">
                Change Image
                <input type="file" className="hidden" accept="image/*" onChange={handleAadhaarFrontUpload} />
              </label>
            </div>
          ) : (
            <label className="cursor-pointer">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="mt-2 text-sm text-gray-600">Click to upload Aadhaar front side</p>
              <p className="mt-1 text-xs text-gray-500">PNG, JPG up to 5MB</p>
              <input type="file" className="hidden" accept="image/*" onChange={handleAadhaarFrontUpload} />
            </label>
          )}
        </div>
        {errors?.aadhaarFront && <p className="mt-1 text-xs text-red-500">{errors.aadhaarFront}</p>}
      </div>

      {/* Upload Aadhaar Back */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-[#1E3A5F]">
          Upload Aadhaar Back <span className="text-red-500">*</span>
        </label>
        <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center hover:border-[#E6A11A] transition-colors">
          {aadhaarBackPreview ? (
            <div className="space-y-3">
              <img src={aadhaarBackPreview} alt="Aadhaar Back" className="mx-auto max-h-48 rounded-lg" />
              <label className="inline-block cursor-pointer rounded-lg bg-[#E6A11A] px-4 py-2 text-sm font-semibold text-white hover:bg-[#F0B329] transition-colors">
                Change Image
                <input type="file" className="hidden" accept="image/*" onChange={handleAadhaarBackUpload} />
              </label>
            </div>
          ) : (
            <label className="cursor-pointer">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="mt-2 text-sm text-gray-600">Click to upload Aadhaar back side</p>
              <p className="mt-1 text-xs text-gray-500">PNG, JPG up to 5MB</p>
              <input type="file" className="hidden" accept="image/*" onChange={handleAadhaarBackUpload} />
            </label>
          )}
        </div>
        {errors?.aadhaarBack && <p className="mt-1 text-xs text-red-500">{errors.aadhaarBack}</p>}
      </div>

      {/* Selfie Upload */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-[#1E3A5F]">
          Selfie Photo <span className="text-red-500">*</span>
        </label>
        <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center hover:border-[#E6A11A] transition-colors">
          {selfiePreview ? (
            <div className="space-y-3">
              <img src={selfiePreview} alt="Selfie" className="mx-auto max-h-48 rounded-lg" />
              <label className="inline-block cursor-pointer rounded-lg bg-[#E6A11A] px-4 py-2 text-sm font-semibold text-white hover:bg-[#F0B329] transition-colors">
                Change Photo
                <input type="file" className="hidden" accept="image/*" onChange={handleSelfieUpload} />
              </label>
            </div>
          ) : (
            <label className="cursor-pointer">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="mt-2 text-sm text-gray-600">Click to upload your selfie</p>
              <p className="mt-1 text-xs text-gray-500">Clear face photo for verification</p>
              <input type="file" className="hidden" accept="image/*" onChange={handleSelfieUpload} />
            </label>
          )}
        </div>
        {errors?.selfie && <p className="mt-1 text-xs text-red-500">{errors.selfie}</p>}
      </div>

      {/* Aadhaar-Linked Mobile Verification */}
      <div className="rounded-lg border border-[#E6A11A]/30 bg-white p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-[#1E3A5F]">Aadhaar-linked Mobile Verification</h3>
            <p className="text-xs text-gray-500 mt-1">Verify that your mobile is linked with Aadhaar</p>
          </div>
          {getStatusBadge()}
        </div>
        
        {verificationStatus === 'not-verified' && (
          <button
            type="button"
            onClick={handleVerifyAadhaar}
            disabled={!formData.aadhaarNumber || formData.aadhaarNumber.length !== 12}
            className="w-full rounded-lg px-6 py-3 text-sm font-semibold text-white transition-all hover:shadow-md disabled:opacity-50"
            style={{ background: '#14B8A6' }}
          >
            Check Verification Status
          </button>
        )}
        
        {verificationStatus === 'verified' && (
          <div className="rounded bg-green-50 p-3 text-xs text-green-700">
            ✓ Your mobile number is linked with this Aadhaar number
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <div className="flex gap-3">
          <svg className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <div className="text-xs text-blue-700 space-y-1">
            <p className="font-semibold">Privacy & Security</p>
            <p>We use Aadhaar only for identity verification. Your documents are securely stored and encrypted. Admin will review these documents before approving your account.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

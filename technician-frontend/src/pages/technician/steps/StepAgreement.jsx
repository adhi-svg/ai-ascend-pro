import { useState } from 'react'

export default function StepAgreement({ formData, updateFormData, errors, onSubmit, loading }) {
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [acceptConduct, setAcceptConduct] = useState(false)

  const handleAcceptTerms = (checked) => {
    setAcceptTerms(checked)
    updateFormData({ acceptTerms: checked })
  }

  const handleAcceptConduct = (checked) => {
    setAcceptConduct(checked)
    updateFormData({ acceptConduct: checked })
  }

  const canSubmit = acceptTerms && acceptConduct

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-[#E6A11A]/20 bg-[#CFEDEE]/30 p-4">
        <h2 className="text-xl font-bold text-[#1E3A5F]">Agreement & Submission</h2>
        <p className="text-xs text-[#4B5563] mt-1">
          Please review and accept the terms before submitting your application.
        </p>
      </div>

      {/* Terms & Conditions */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 space-y-4">
        <h3 className="text-lg font-semibold text-[#1E3A5F]">Partner Terms & Conditions</h3>

        <div className="max-h-64 overflow-y-auto rounded border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 space-y-3">
          <div>
            <h4 className="font-semibold text-[#1E3A5F] mb-2">1. Service Commitment</h4>
            <p className="text-xs">
              As a Fyxion partner, you agree to provide services professionally and maintain high quality standards. You must respond to service requests within the agreed timeframe and complete jobs as committed.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-[#1E3A5F] mb-2">2. Pricing & Payments</h4>
            <p className="text-xs">
              All service charges must be transparent and agreed upon with customers before starting work. Fyxion will process payments within 5-7 business days after service completion and customer confirmation.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-[#1E3A5F] mb-2">3. Professional Conduct</h4>
            <p className="text-xs">
              You must maintain professional behavior with all customers. Any form of harassment, misconduct, or unprofessional behavior will result in immediate account suspension and legal action.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-[#1E3A5F] mb-2">4. Identity Verification</h4>
            <p className="text-xs">
              All documents submitted must be genuine and valid. Providing fake documents is a criminal offense and will result in permanent account ban and legal consequences.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-[#1E3A5F] mb-2">5. Service Area</h4>
            <p className="text-xs">
              You must honor the service radius specified during registration. Consistently declining jobs within your area may affect your account standing.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-[#1E3A5F] mb-2">6. Account Termination</h4>
            <p className="text-xs">
              Fyxion reserves the right to suspend or terminate accounts for violation of terms, repeated customer complaints, or fraudulent activities.
            </p>
          </div>
        </div>

        {/* Terms Checkbox */}
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={acceptTerms}
            onChange={(e) => handleAcceptTerms(e.target.checked)}
            className="mt-1 h-5 w-5 rounded border-gray-300 text-[#E6A11A] focus:ring-[#E6A11A] cursor-pointer"
          />
          <span className="text-sm text-gray-700">
            I have read and agree to the <span className="font-semibold text-[#1E3A5F]">Fyxion Partner Terms & Conditions</span>
            <span className="text-red-500 ml-1">*</span>
          </span>
        </label>
        {errors?.acceptTerms && <p className="text-xs text-red-500">{errors.acceptTerms}</p>}
      </div>

      {/* Professional Conduct Agreement */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 space-y-4">
        <h3 className="text-lg font-semibold text-[#1E3A5F]">Professional Conduct & Safety</h3>

        <div className="space-y-3 text-sm text-gray-700">
          <div className="flex items-start gap-2">
            <svg className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-xs">Maintain professional behavior and respect customer privacy at all times</p>
          </div>

          <div className="flex items-start gap-2">
            <svg className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-xs">Follow all safety protocols and guidelines while providing services</p>
          </div>

          <div className="flex items-start gap-2">
            <svg className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-xs">Provide complete and accurate information about service charges before starting work</p>
          </div>

          <div className="flex items-start gap-2">
            <svg className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-xs">Respond to service requests promptly and communicate any delays</p>
          </div>

          <div className="flex items-start gap-2">
            <svg className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-xs">Use genuine parts and provide warranty for work completed where applicable</p>
          </div>
        </div>

        {/* Conduct Checkbox */}
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={acceptConduct}
            onChange={(e) => handleAcceptConduct(e.target.checked)}
            className="mt-1 h-5 w-5 rounded border-gray-300 text-[#E6A11A] focus:ring-[#E6A11A] cursor-pointer"
          />
          <span className="text-sm text-gray-700">
            I agree to maintain <span className="font-semibold text-[#1E3A5F]">professional conduct and follow all safety rules</span>
            <span className="text-red-500 ml-1">*</span>
          </span>
        </label>
        {errors?.acceptConduct && <p className="text-xs text-red-500">{errors.acceptConduct}</p>}
      </div>

      {/* Warning Notice */}
      <div className="rounded-lg border-2 border-red-200 bg-red-50 p-4">
        <div className="flex gap-3">
          <svg className="h-6 w-6 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div className="text-sm">
            <p className="font-bold text-red-800 mb-1">Important Warning</p>
            <p className="text-xs text-red-700">
              Submitting fake documents, engaging in misconduct, or violating professional standards will result in <span className="font-semibold">permanent account suspension</span> and may lead to legal action. We take the safety and trust of our customers very seriously.
            </p>
          </div>
        </div>
      </div>

      {/* Application Summary */}
      <div className="rounded-lg border border-[#E6A11A]/30 bg-[#CFEDEE]/20 p-6 space-y-3">
        <h3 className="text-lg font-semibold text-[#1E3A5F]">Application Summary</h3>
        <div className="grid gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Full Name:</span>
            <span className="font-semibold text-[#1E3A5F]">{formData.fullName || 'Not provided'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Mobile:</span>
            <span className="font-semibold text-[#1E3A5F]">{formData.mobile || 'Not provided'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Primary Skill:</span>
            <span className="font-semibold text-[#1E3A5F]">{formData.primarySkill || 'Not provided'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Experience:</span>
            <span className="font-semibold text-[#1E3A5F]">{formData.experience || 'Not provided'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Service Radius:</span>
            <span className="font-semibold text-[#1E3A5F]">{formData.serviceRadius || 'Not provided'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Aadhaar Verified:</span>
            <span className="font-semibold text-[#1E3A5F]">
              {formData.aadhaarNumber && formData.aadhaarNumber.length === 12 ? 'Yes' : 'Pending'}
            </span>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={onSubmit}
          disabled={!canSubmit || loading}
          className="w-full rounded-full px-6 py-4 text-lg font-semibold text-white transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          style={{ background: canSubmit && !loading ? '#E6A11A' : '#9CA3AF' }}
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Submitting...
            </>
          ) : (
            'Submit for Admin Approval'
          )}
        </button>

        {!canSubmit && (
          <p className="text-center text-xs text-red-500">
            Please accept both checkboxes above to submit your application
          </p>
        )}
      </div>
    </div>
  )
}

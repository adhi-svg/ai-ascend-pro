import { useState } from 'react'

export default function StepProfessional({ formData, updateFormData, errors }) {
  const [hasShop, setHasShop] = useState(formData.hasShop || false)

  const skills = [
    'Electrician',
    'Plumber',
    'AC Mechanic',
    'Appliance Repair',
    'TV Repair',
    'Fridge Repair',
    'Washing Machine Repair',
  ]

  const experienceOptions = ['0-2 years', '2-5 years', '5-10 years', '10+ years']
  const radiusOptions = ['3 km', '5 km', '10 km', '15 km']

  const handleShopToggle = (value) => {
    setHasShop(value)
    updateFormData({ hasShop: value })
    if (!value) {
      // Clear shop fields if toggled off
      updateFormData({
        shopName: '',
        shopAddress: '',
        shopLocation: null,
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-[#E6A11A]/20 bg-[#CFEDEE]/30 p-4">
        <h2 className="text-xl font-bold text-[#1E3A5F]">Professional Details</h2>
        <p className="text-xs text-[#4B5563] mt-1">
          Tell us about your skills and service area to help customers find you.
        </p>
      </div>

      {/* Primary Skill */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-[#1E3A5F]">
          Primary Skill <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.primarySkill || ''}
          onChange={(e) => updateFormData({ primarySkill: e.target.value })}
          className="w-full rounded-lg border px-4 py-3 transition-colors focus:outline-none focus:ring-2 focus:ring-[#E6A11A]"
          style={{ borderColor: errors?.primarySkill ? '#EF4444' : '#D1D5DB', color: '#1E3A5F' }}
        >
          <option value="">Select your primary skill</option>
          {skills.map((skill) => (
            <option key={skill} value={skill}>
              {skill}
            </option>
          ))}
        </select>
        {errors?.primarySkill && <p className="mt-1 text-xs text-red-500">{errors.primarySkill}</p>}
      </div>

      {/* Years of Experience */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-[#1E3A5F]">
          Years of Experience <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.experience || ''}
          onChange={(e) => updateFormData({ experience: e.target.value })}
          className="w-full rounded-lg border px-4 py-3 transition-colors focus:outline-none focus:ring-2 focus:ring-[#E6A11A]"
          style={{ borderColor: errors?.experience ? '#EF4444' : '#D1D5DB', color: '#1E3A5F' }}
        >
          <option value="">Select experience</option>
          {experienceOptions.map((exp) => (
            <option key={exp} value={exp}>
              {exp}
            </option>
          ))}
        </select>
        {errors?.experience && <p className="mt-1 text-xs text-red-500">{errors.experience}</p>}
      </div>

      {/* Service Radius */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-[#1E3A5F]">
          Service Radius <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.serviceRadius || ''}
          onChange={(e) => updateFormData({ serviceRadius: e.target.value })}
          className="w-full rounded-lg border px-4 py-3 transition-colors focus:outline-none focus:ring-2 focus:ring-[#E6A11A]"
          style={{ borderColor: errors?.serviceRadius ? '#EF4444' : '#D1D5DB', color: '#1E3A5F' }}
        >
          <option value="">Select service radius</option>
          {radiusOptions.map((radius) => (
            <option key={radius} value={radius}>
              {radius}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-gray-500">Maximum distance you can travel for service calls</p>
        {errors?.serviceRadius && <p className="mt-1 text-xs text-red-500">{errors.serviceRadius}</p>}
      </div>

      {/* Base Visit Fee */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-[#1E3A5F]">
          Base Visit Fee <span className="text-xs text-gray-500">(Optional)</span>
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
          <input
            type="number"
            value={formData.baseVisitFee || ''}
            onChange={(e) => updateFormData({ baseVisitFee: e.target.value })}
            placeholder="200"
            className="w-full rounded-lg border px-4 py-3 pl-8 transition-colors focus:outline-none focus:ring-2 focus:ring-[#E6A11A]"
            style={{ borderColor: '#D1D5DB', color: '#1E3A5F' }}
          />
        </div>
        <p className="mt-1 text-xs text-gray-500">Your standard inspection/visit charge</p>
      </div>

      {/* Own a Shop Toggle */}
      <div className="rounded-lg border border-[#E6A11A]/30 bg-[#CFEDEE]/20 p-4">
        <label className="mb-3 block text-sm font-semibold text-[#1E3A5F]">Own a shop?</label>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => handleShopToggle(true)}
            className={`flex-1 rounded-lg py-3 text-sm font-semibold transition-all ${
              hasShop
                ? 'bg-[#E6A11A] text-white shadow-md'
                : 'bg-white text-[#4B5563] border border-gray-200 hover:border-[#E6A11A]'
            }`}
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => handleShopToggle(false)}
            className={`flex-1 rounded-lg py-3 text-sm font-semibold transition-all ${
              !hasShop
                ? 'bg-[#E6A11A] text-white shadow-md'
                : 'bg-white text-[#4B5563] border border-gray-200 hover:border-[#E6A11A]'
            }`}
          >
            No
          </button>
        </div>
      </div>

      {/* Shop Details (Conditional) */}
      {hasShop && (
        <div className="space-y-4 rounded-lg border border-[#E6A11A]/30 bg-white p-4">
          <h3 className="text-sm font-semibold text-[#1E3A5F]">Shop Information</h3>

          {/* Shop Name */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-[#1E3A5F]">
              Shop Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.shopName || ''}
              onChange={(e) => updateFormData({ shopName: e.target.value })}
              placeholder="Enter shop name"
              className="w-full rounded-lg border px-4 py-3 transition-colors focus:outline-none focus:ring-2 focus:ring-[#E6A11A]"
              style={{ borderColor: errors?.shopName ? '#EF4444' : '#D1D5DB', color: '#1E3A5F' }}
            />
            {errors?.shopName && <p className="mt-1 text-xs text-red-500">{errors.shopName}</p>}
          </div>

          {/* Shop Address */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-[#1E3A5F]">
              Shop Address <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.shopAddress || ''}
              onChange={(e) => updateFormData({ shopAddress: e.target.value })}
              placeholder="Enter complete shop address"
              rows={3}
              className="w-full rounded-lg border px-4 py-3 transition-colors focus:outline-none focus:ring-2 focus:ring-[#E6A11A]"
              style={{ borderColor: errors?.shopAddress ? '#EF4444' : '#D1D5DB', color: '#1E3A5F' }}
            />
            {errors?.shopAddress && <p className="mt-1 text-xs text-red-500">{errors.shopAddress}</p>}
          </div>

          {/* Shop Location Map Placeholder */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-[#1E3A5F]">
              Shop Location <span className="text-xs text-gray-500">(Optional)</span>
            </label>
            <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="mt-2 text-sm text-gray-600">Map location picker</p>
              <button
                type="button"
                className="mt-3 rounded-lg border border-[#E6A11A] px-4 py-2 text-sm font-semibold text-[#E6A11A] transition-all hover:bg-[#E6A11A] hover:text-white"
              >
                Pick Location on Map
              </button>
              <p className="mt-2 text-xs text-gray-500">Click to select your shop location</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

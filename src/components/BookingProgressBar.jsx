const BookingProgressBar = ({ currentStep }) => {
  const steps = [
    { id: 1, label: 'Select Service', icon: '🛠️' },
    { id: 2, label: 'Choose Technician', icon: '👨‍🔧' },
    { id: 3, label: 'Confirmation', icon: '✓' },
    { id: 4, label: 'Payment', icon: '💳' },
    { id: 5, label: 'Tracking', icon: '📍' },
    { id: 6, label: 'Complete', icon: '⭐' }
  ]

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-2 border-[#E6A11A]/20 mb-6">
      <div className="flex items-center justify-between relative">
        {/* Progress Line */}
        <div className="absolute top-5 left-0 right-0 h-1 bg-[#E6A11A]/20 rounded-full">
          <div
            className="h-full bg-gradient-to-r from-[#E6A11A] to-[#F0B329] rounded-full transition-all duration-700 ease-out"
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          />
        </div>

        {/* Steps */}
        {steps.map((step) => {
          const isCompleted = step.id < currentStep
          const isCurrent = step.id === currentStep
          const isUpcoming = step.id > currentStep

          return (
            <div key={step.id} className="flex flex-col items-center relative z-10 flex-1">
              {/* Circle */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-300 shadow-lg
                  ${isCompleted ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white scale-100 animate-success-pulse' : ''}
                  ${isCurrent ? 'bg-gradient-to-br from-[#E6A11A] to-[#F0B329] text-white scale-110 animate-bounce-in' : ''}
                  ${isUpcoming ? 'bg-white border-2 border-[#E6A11A]/30 text-[#9CA3AF] scale-90' : ''}
                `}
              >
                {isCompleted ? '✓' : step.icon}
              </div>

              {/* Label */}
              <span
                className={`mt-2 text-xs font-semibold transition-all duration-300 text-center hidden sm:block
                  ${isCompleted ? 'text-green-600' : ''}
                  ${isCurrent ? 'text-[#E6A11A]' : ''}
                  ${isUpcoming ? 'text-[#9CA3AF]' : ''}
                `}
              >
                {step.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default BookingProgressBar

const DemoCredentials = ({ onClose }) => {
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text)
    alert('Copied to clipboard!')
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[999] p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8 animate-bounce-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-[#1E3A5F]">🎯 Demo Credentials</h2>
          <button
            onClick={onClose}
            className="text-[#9CA3AF] hover:text-[#1E3A5F] transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Customer Credentials */}
        <div className="mb-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl">
                👤
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#1E3A5F]">Customer Account</h3>
                <p className="text-sm text-[#4B5563]">Book technician services</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="bg-white rounded-xl p-3 flex items-center justify-between">
                <div>
                  <p className="text-xs text-[#9CA3AF] font-semibold uppercase">Email</p>
                  <p className="text-[#1E3A5F] font-mono font-semibold">demo@customer.com</p>
                </div>
                <button
                  onClick={() => handleCopy('demo@customer.com')}
                  className="text-[#E6A11A] hover:text-[#C88B12] transition-colors"
                >
                  📋
                </button>
              </div>
              <div className="bg-white rounded-xl p-3 flex items-center justify-between">
                <div>
                  <p className="text-xs text-[#9CA3AF] font-semibold uppercase">Password</p>
                  <p className="text-[#1E3A5F] font-mono font-semibold">demo123</p>
                </div>
                <button
                  onClick={() => handleCopy('demo123')}
                  className="text-[#E6A11A] hover:text-[#C88B12] transition-colors"
                >
                  📋
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Technician Credentials */}
        <div className="mb-6">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-2xl">
                🔧
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#1E3A5F]">Technician Account</h3>
                <p className="text-sm text-[#4B5563]">Accept and manage jobs</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="bg-white rounded-xl p-3 flex items-center justify-between">
                <div>
                  <p className="text-xs text-[#9CA3AF] font-semibold uppercase">Phone</p>
                  <p className="text-[#1E3A5F] font-mono font-semibold">+91-9999999999</p>
                </div>
                <button
                  onClick={() => handleCopy('+91-9999999999')}
                  className="text-[#E6A11A] hover:text-[#C88B12] transition-colors"
                >
                  📋
                </button>
              </div>
              <div className="bg-white rounded-xl p-3 flex items-center justify-between">
                <div>
                  <p className="text-xs text-[#9CA3AF] font-semibold uppercase">OTP</p>
                  <p className="text-[#1E3A5F] font-mono font-semibold">1234</p>
                </div>
                <button
                  onClick={() => handleCopy('1234')}
                  className="text-[#E6A11A] hover:text-[#C88B12] transition-colors"
                >
                  📋
                </button>
              </div>
            </div>
            <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-3">
              <p className="text-xs text-amber-800">
                <span className="font-bold">💡 Tip:</span> Open technician app at localhost:5174
              </p>
            </div>
          </div>
        </div>

        {/* Quick Tips */}
        <div className="bg-gradient-to-r from-[#CFEDEE] to-[#E8F8F9] rounded-2xl p-6 border-2 border-[#E6A11A]/30">
          <h4 className="font-bold text-[#1E3A5F] mb-3 text-center">🎬 Presentation Flow</h4>
          <ol className="space-y-2 text-sm text-[#1E3A5F]">
            <li className="flex items-start gap-2">
              <span className="font-bold text-[#E6A11A]">1.</span>
              <span>Login as customer → Select service → Book technician</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-[#E6A11A]">2.</span>
              <span>Payment (mock) → Track on map with live ETA</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-[#E6A11A]">3.</span>
              <span>Technician arrives → Enter OTP (1234) → Rate service</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-[#E6A11A]">4.</span>
              <span>Show technician app running on port 5174 (dual demo)</span>
            </li>
          </ol>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="mt-6 w-full bg-gradient-to-r from-[#E6A11A] to-[#F0B329] hover:from-[#C88B12] hover:to-[#E6A11A] text-white font-bold py-4 px-6 rounded-xl transition shadow-lg"
        >
          Got it! Let's start the demo 🚀
        </button>
      </div>
    </div>
  )
}

export default DemoCredentials

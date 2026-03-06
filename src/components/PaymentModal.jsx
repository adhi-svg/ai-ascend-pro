import { postPayment } from '../services/api'

const PaymentModal = ({ booking, onPaymentSuccess, onClose }) => {
  const [selectedMethod, setSelectedMethod] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [error, setError] = useState('')

  const paymentMethods = [
    {
      id: 'phonepe',
      name: 'PhonePe',
      icon: '📱',
      color: 'from-purple-500 to-purple-600'
    },
    {
      id: 'googlepay',
      name: 'Google Pay',
      icon: '🔵',
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'paytm',
      name: 'Paytm',
      icon: '🟦',
      color: 'from-cyan-500 to-cyan-600'
    },
    {
      id: 'upi',
      name: 'UPI',
      icon: '💳',
      color: 'from-orange-500 to-orange-600'
    }
  ]

  const handlePayment = async () => {
    if (!selectedMethod) return

    setIsProcessing(true)
    setError('')

    try {
      await postPayment(booking.id, selectedMethod, booking.amount)
      setIsProcessing(false)
      setPaymentSuccess(true)

      // Call parent callback after 2 seconds to show success message
      setTimeout(() => {
        onPaymentSuccess()
      }, 2000)
    } catch (err) {
      setError(err.message || 'Payment failed. Please try again.')
      setIsProcessing(false)
    }
  }

  if (paymentSuccess) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
        <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-md w-full text-center space-y-6 animate-bounce-in">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-2xl animate-celebration">
            <span className="text-5xl text-white font-bold">✓</span>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-[#1E3A5F] mb-2 animate-slide-in-left">Payment Successful!</h2>
            <p className="text-[#4B5563] animate-slide-in-right">₹{booking.amount} paid via {selectedMethod}</p>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 space-y-3 text-left border-2 border-green-200 animate-scale-in">
            <div className="flex justify-between text-sm">
              <span className="text-[#4B5563]">Service:</span>
              <span className="font-semibold text-[#1E3A5F]">{booking.service}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#4B5563]">Technician:</span>
              <span className="font-semibold text-[#1E3A5F]">{booking.technicianName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#4B5563]">Amount:</span>
              <span className="font-semibold text-green-600 text-lg">₹{booking.amount}</span>
            </div>
          </div>

          <p className="text-slate-600 text-sm">
            🚗 Technician is starting their journey towards you. You can track their location now.
          </p>

          <Button
            onClick={onPaymentSuccess}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
          >
            Track Technician
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-[#E6A11A] to-[#F0B329] text-white p-6 rounded-t-3xl shadow-lg">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold">Confirm Payment</h2>
              <p className="text-white/90 text-sm mt-1">🔒 100% Secure & Safe</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Booking Summary */}
          <div className="bg-gradient-to-r from-[#CFEDEE] to-[#E8F8F9] rounded-2xl p-5 space-y-3 border-2 border-[#E6A11A]/20 animate-scale-in">
            <h3 className="font-bold text-[#1E3A5F] flex items-center gap-2">
              <span>📋</span>
              Booking Summary
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[#4B5563]">Service:</span>
                <span className="font-semibold text-[#1E3A5F]">{booking.service}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#4B5563]">Technician:</span>
                <span className="font-semibold text-[#1E3A5F]">{booking.technicianName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#4B5563]">Service Charge:</span>
                <span className="font-semibold text-[#1E3A5F]">₹{booking.amount}</span>
              </div>
              <div className="border-t-2 border-[#E6A11A]/30 pt-3 flex justify-between items-center">
                <span className="font-bold text-[#1E3A5F] text-lg">Total Amount:</span>
                <span className="font-bold text-2xl text-[#E6A11A]">₹{booking.amount}</span>
              </div>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div>
            <h3 className="font-bold text-[#1E3A5F] mb-4 flex items-center gap-2">
              <span>💳</span>
              Select Payment Method
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setSelectedMethod(method.id)}
                  className={`p-4 rounded-xl border-2 transition transform hover:scale-105 ${selectedMethod === method.id
                    ? `border-blue-500 bg-blue-50`
                    : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                >
                  <div className="text-3xl mb-2">{method.icon}</div>
                  <div className="text-sm font-semibold text-slate-900">{method.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Info/Error */}
          {error && (
            <div className="bg-red-50 rounded-xl p-4 border border-red-200">
              <p className="text-sm text-red-900 font-semibold flex items-center gap-2">
                <span>⚠️</span>
                {error}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2">
            <button
              onClick={handlePayment}
              disabled={!selectedMethod || isProcessing}
              className={`w-full py-3 px-4 rounded-xl font-bold text-white transition transform ${!selectedMethod || isProcessing
                ? 'bg-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 hover:scale-105'
                }`}
            >
              {isProcessing ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </div>
              ) : (
                `Pay ₹${booking.amount} with ${selectedMethod ? paymentMethods.find(m => m.id === selectedMethod).name : 'selected method'}`
              )}
            </button>
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="w-full py-3 px-4 rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
            >
              Cancel
            </button>
          </div>

          {/* Security Badge */}
          <div className="text-center text-xs text-slate-600">
            🔒 Secure & encrypted transaction
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentModal

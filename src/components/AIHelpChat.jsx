// ============================================================
// HACKATHON UPGRADE – FLEX AI CHAT WIDGET WITH VISION
// Theme: "Intelligent. Autonomous. Agentic in Action."
// Meet FLEX AI: Your intelligent assistant for home services
// Now with Gemini Vision API for image understanding
// ============================================================

import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from './ui/Button'

const AIHelpChat = () => {
  const [isOpen, setIsOpen] = useState(true)
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '👋 Hi! I\'m FLEX AI, your intelligent home services assistant. You can ask questions, upload photos of issues, and I\'ll help with DIY tips or connect you with professionals. What do you need?',
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)  // VISION UPGRADE
  const [imagePreview, setImagePreview] = useState(null)   // VISION UPGRADE
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)                        // VISION UPGRADE
  const navigate = useNavigate()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // VISION UPGRADE: Handle image selection
  const handleImageSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB')
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      setSelectedImage(event.target.result)
      setImagePreview(URL.createObjectURL(file))
    }
    reader.readAsDataURL(file)
  }

  // VISION UPGRADE: Clear selected image
  const clearImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() && !selectedImage || isLoading) return

    const userMessage = inputMessage.trim() || '(Image only)'
    setInputMessage('')

    // Add user message with image preview if applicable
    setMessages(prev => [...prev, {
      role: 'user',
      content: userMessage,
      image: imagePreview,  // VISION UPGRADE
      timestamp: new Date()
    }])

    clearImage()
    setIsLoading(true)

    try {
      // VISION UPGRADE: Include image_base64 in request
      const requestBody = {
        message: userMessage,
        context: {
          user_role: 'customer',
          locale: 'en-IN'
        }
      }

      if (selectedImage) {
        requestBody.image_base64 = selectedImage
      }

      const response = await fetch('http://localhost:8000/api/v1/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      const result = await response.json()

      if (result.success && result.data) {
        const aiData = result.data

        // Add FLEX AI assistant message with vision data
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: aiData.reply,
          assistant_name: aiData.assistant_name || 'FLEX AI',
          timestamp: new Date(),
          intent: aiData.intent,
          category: aiData.category,
          urgency: aiData.urgency,
          suggest_booking: aiData.suggest_booking,
          safe_steps: aiData.safe_steps,
          disclaimer: aiData.disclaimer,
          vision_detected: aiData.vision_detected,  // VISION UPGRADE
          originalMessage: userMessage
        }])
      } else {
        throw new Error('FLEX AI response failed')
      }
    } catch (error) {
      console.error('FLEX AI chat error:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '❌ Sorry, I encountered an error. Please try again or contact support.',
        timestamp: new Date()
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleBookTechnician = (msg) => {
    // Prefill booking with FLEX AI chat context
    navigate('/customer/technicians', {
      state: {
        prefillComplaint: {
          complaint_text: msg.originalMessage,
          complaint_category: msg.category,
          complaint_urgency: msg.urgency,
          auto_assign: true
        }
      }
    })
    setIsOpen(false)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <>
      {/* Floating FLEX AI Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 bg-gradient-to-br from-[#14B8A6] to-[#0F9B8E] text-white rounded-full p-4 shadow-2xl hover:shadow-3xl transition-all hover:scale-110 flex items-center gap-2 group"
          aria-label="Open FLEX AI Chat"
        >
          <span className="text-2xl">🤖</span>
          <span className="font-semibold text-sm pr-2 max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300">
            FLEX AI
          </span>
        </button>
      )}

      {/* FLEX AI Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col border-2 border-[#14B8A6]/30">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#14B8A6] to-[#0F9B8E] text-white p-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🤖</span>
              <div>
                <h3 className="font-bold text-lg">FLEX AI</h3>
                <p className="text-xs text-white/80">Intelligent Home Services Assistant with Vision</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 rounded-full p-1 transition"
            >
              ✕
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-br from-[#CFEDEE]/20 to-white">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    msg.role === 'user'
                      ? 'bg-[#14B8A6] text-white'
                      : 'bg-white border border-[#14B8A6]/20 text-[#1E3A5F]'
                  }`}
                >
                  {/* User Image Preview */}
                  {msg.image && msg.role === 'user' && (
                    <div className="mb-2 rounded overflow-hidden max-w-[200px]">
                      <img 
                        src={msg.image} 
                        alt="uploaded" 
                        className="w-full h-auto object-cover"
                      />
                    </div>
                  )}

                  {/* Vision Analysis Summary */}
                  {msg.vision_detected && msg.role === 'assistant' && (
                    <div className="mb-2 p-2 bg-[#14B8A6]/10 rounded border border-[#14B8A6]/30">
                      <p className="text-xs font-bold text-[#14B8A6] mb-1">🔍 Vision Analysis:</p>
                      <ul className="text-xs space-y-0.5">
                        {msg.vision_detected.device_type && (
                          <li><strong>Device:</strong> {msg.vision_detected.device_type}</li>
                        )}
                        {msg.vision_detected.condition && (
                          <li><strong>Condition:</strong> {msg.vision_detected.condition}</li>
                        )}
                        {msg.vision_detected.risk_signals && msg.vision_detected.risk_signals.length > 0 && (
                          <li><strong>Risks:</strong> {msg.vision_detected.risk_signals.join(', ')}</li>
                        )}
                        {msg.vision_detected.confidence && (
                          <li><strong>Confidence:</strong> {(msg.vision_detected.confidence * 100).toFixed(0)}%</li>
                        )}
                      </ul>
                    </div>
                  )}

                  {/* Message Content */}
                  <div className="text-sm whitespace-pre-wrap">{msg.content}</div>

                  {/* Safe Steps (if provided) */}
                  {msg.safe_steps && msg.safe_steps.length > 0 && (
                    <div className="mt-3 p-2 bg-[#E6A11A]/10 rounded border border-[#E6A11A]/30">
                      <p className="text-xs font-bold text-[#E6A11A] mb-1">✅ Safe Steps:</p>
                      <ul className="text-xs space-y-1">
                        {msg.safe_steps.map((step, i) => (
                          <li key={i} className="flex items-start gap-1">
                            <span className="text-[#14B8A6]">•</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Disclaimer */}
                  {msg.disclaimer && (
                    <div className="mt-2 text-xs italic text-[#9CA3AF] border-t border-[#14B8A6]/20 pt-2">
                      {msg.disclaimer}
                    </div>
                  )}

                  {/* Category & Urgency Badges */}
                  {(msg.category || msg.urgency) && (
                    <div className="flex gap-2 mt-2">
                      {msg.category && (
                        <span className="text-xs bg-[#CFEDEE] text-[#1E3A5F] px-2 py-0.5 rounded-full">
                          {msg.category}
                        </span>
                      )}
                      {msg.urgency && (
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                            msg.urgency === 'HIGH'
                              ? 'bg-red-100 text-red-700'
                              : msg.urgency === 'MEDIUM'
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {msg.urgency}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Book Technician CTA */}
                  {msg.suggest_booking && msg.role === 'assistant' && (
                    <button
                      onClick={() => handleBookTechnician(msg)}
                      className="mt-3 w-full bg-[#E6A11A] hover:bg-[#C88B12] text-white font-semibold text-sm py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
                    >
                      <span>📱</span>
                      <span>Book Technician (Recommended)</span>
                    </button>
                  )}

                  {/* Timestamp */}
                  <p className="text-xs mt-1 opacity-60">
                    {msg.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-[#14B8A6]/20 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-[#14B8A6] rounded-full animate-bounce"></span>
                      <span className="w-2 h-2 bg-[#14B8A6] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                      <span className="w-2 h-2 bg-[#14B8A6] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                    </div>
                    <span className="text-xs text-[#4B5563]">FLEX AI is analyzing...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Image Preview */}
          {imagePreview && (
            <div className="px-4 pt-2 pb-0">
              <div className="relative inline-block">
                <img 
                  src={imagePreview} 
                  alt="preview" 
                  className="h-20 rounded border border-[#14B8A6]/30"
                />
                <button
                  onClick={clearImage}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 border-t border-[#14B8A6]/20 bg-white rounded-b-2xl">
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything or describe your issue..."
                className="flex-1 px-3 py-2 border border-[#14B8A6]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14B8A6] text-sm"
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={(!inputMessage.trim() && !selectedImage) || isLoading}
                className="bg-[#14B8A6] hover:bg-[#0F9B8E] text-white px-4 py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="text-lg">📤</span>
              </button>
            </div>

            {/* Image Upload Button */}
            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="flex-1 bg-[#E6A11A]/20 hover:bg-[#E6A11A]/30 text-[#1E3A5F] border border-[#E6A11A]/30 px-3 py-2 rounded-lg transition text-xs font-medium disabled:opacity-50 flex items-center justify-center gap-1"
              >
                <span>📸</span>
                <span>Upload Photo</span>
              </button>
            </div>

            <p className="text-xs text-[#9CA3AF] mt-2 text-center">
              ⚡ Powered by FLEX AI + Gemini Vision
            </p>
          </div>
        </div>
      )}
    </>
  )
}

export default AIHelpChat

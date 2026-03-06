import Button from '../ui/Button'

const TechnicianCard = ({ tech, onSelect }) => {
  const profilePhoto = tech.photoUrl || tech.profile_photo_url || tech.profilePhotoUrl || null

  return (
    <div className="group relative bg-white rounded-xl p-5 hover:shadow-lg transition-all duration-300 border border-[#E6A11A]/20 hover:border-[#E6A11A]/40">
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#E6A11A]/0 to-transparent group-hover:from-[#E6A11A]/5 transition-all duration-300 pointer-events-none rounded-xl" />

      {/* Main Content */}
      <div className="relative flex items-start justify-between gap-4">
        {/* Left: Avatar and Info */}
        <div className="flex items-start gap-4 flex-1">
          {profilePhoto ? (
            <img
              src={profilePhoto}
              alt={tech.name}
              className="w-16 h-16 rounded-full object-cover shadow-md flex-shrink-0 ring-2 ring-[#E6A11A]/20"
              loading="lazy"
            />
          ) : (
            <div className="w-16 h-16 bg-gradient-to-br from-[#E6A11A] to-[#14B8A6] rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md flex-shrink-0">
              {tech.name.charAt(0)}
            </div>
          )}

          <div className="flex-1">
            {/* Name and Online Status */}
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-lg text-[#1E3A5F]">{tech.name}</h3>
              {tech.isOnline && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Online</span>
              )}
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-1">
                <span className="text-yellow-500">⭐</span>
                <span className="text-sm font-semibold text-[#1E3A5F]">{tech.rating.toFixed(1)}</span>
              </div>
              <span className="text-xs text-[#9CA3AF]">({tech.totalRatings || '100+'} ratings)</span>
            </div>

            {/* Distance and Shop */}
            <div className="flex items-center gap-3 text-sm text-[#4B5563] mb-2">
              <span className="flex items-center gap-1">
                <span>📍</span>
                <span>{tech.distance} km away</span>
              </span>
              {tech.shopAvailable && (
                <>
                  <span className="text-[#9CA3AF]">•</span>
                  <span className="flex items-center gap-1">
                    <span>🏪</span>
                    <span>Shop Available</span>
                  </span>
                </>
              )}
            </div>

            {/* Services */}
            <div className="flex flex-wrap gap-2 mb-3">
              {tech.skills?.slice(0, 3).map((skill, idx) => (
                <span key={idx} className="text-xs bg-[#CFEDEE] text-[#1E3A5F] px-2 py-1 rounded-full font-medium">
                  {skill}
                </span>
              ))}
            </div>

            {/* Experience and Verified */}
            <div className="flex items-center gap-4 text-xs text-[#9CA3AF]">
              <span className="flex items-center gap-1">
                <span>⏱️</span>
                <span>{tech.experience || '5+'} years exp</span>
              </span>
              <span className="flex items-center gap-1 text-green-600">
                <span>✅</span>
                <span>Verified</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right: Book Button */}
        <div className="flex-shrink-0">
          <Button
            onClick={() => onSelect?.(tech)}
            className="whitespace-nowrap"
          >
            Book Now
          </Button>
        </div>
      </div>
    </div>
  )
}

export default TechnicianCard

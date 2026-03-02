import {
  MdElectricBolt,
  MdPlumbing,
  MdAir,
  MdKitchen,
  MdTv,
  MdLocalLaundryService,
  MdWaterDrop,
  MdWifi,
  MdBuild
} from 'react-icons/md'

const iconMap = {
  electrical: MdElectricBolt,
  plumbing: MdPlumbing,
  ac: MdAir,
  fridge: MdKitchen,
  tv: MdTv,
  washing: MdLocalLaundryService,
  dishwasher: MdWaterDrop,
  wifi: MdWifi,
}

// Real service images from Unsplash - RELEVANT TO EACH SERVICE
const serviceImages = {
  electrical: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400&h=300&fit=crop&q=80', // Electrician working
  plumbing: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&h=300&fit=crop&q=80', // Plumbing pipes/work
  ac: 'https://images.unsplash.com/photo-1545259741-2ea3ebf61fa3?w=400&h=300&fit=crop&q=80', // AC thermostat
  fridge: 'https://images.unsplash.com/photo-1584568694244-14fbbc50d737?w=400&h=300&fit=crop&q=80', // Refrigerator
  tv: 'https://images.unsplash.com/photo-1522869635100-ce51e59b69fa?w=400&h=300&fit=crop&q=80', // TV/Entertainment
  washing: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=300&fit=crop&q=80', // Washing machine/laundry
  dishwasher: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop&q=80', // Dishwasher
  wifi: 'https://images.unsplash.com/photo-1517220436465-c1efdf5a5368?w=400&h=300&fit=crop&q=80', // Router/WiFi
}

const ServiceCategoryCard = ({ category, onSelect }) => {
  const IconComponent = iconMap[category.id]
  const imageUrl = serviceImages[category.id]
  
  return (
    <button
      onClick={() => onSelect?.(category)}
      className="group relative flex w-full flex-col items-start gap-2 rounded-2xl bg-white border border-[#E6A11A]/10 overflow-hidden shadow-[0_2px_12px_rgba(30,58,95,0.08)] transition-all duration-300 hover:border-[#E6A11A]/40 hover:shadow-[0_12px_32px_rgba(230,161,26,0.2)] hover:scale-105"
    >
      {/* Service Image */}
      {imageUrl && (
        <div className="relative w-full h-32 overflow-hidden rounded-t-2xl bg-gradient-to-br from-[#E6A11A]/10 to-[#14B8A6]/10">
          <img
            src={imageUrl}
            alt={category.name}
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/40 group-hover:to-white/20 transition-all duration-300" />
        </div>
      )}

      {/* Content */}
      <div className="relative px-5 py-3 w-full">
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#E6A11A]/0 to-[#E6A11A]/0 group-hover:from-[#E6A11A]/5 group-hover:to-[#E6A11A]/10 transition-all duration-300 rounded-2xl" />
        
        <div className="relative text-3xl transform group-hover:scale-110 transition-transform duration-300 z-10 text-[#E6A11A]">
          {IconComponent ? <IconComponent /> : <MdBuild />}
        </div>
        <p className="relative text-base font-semibold text-[#1E3A5F] group-hover:text-[#E6A11A] transition-colors duration-300 z-10 mt-2">{category.name}</p>
        <p className="relative text-xs text-[#9CA3AF] group-hover:text-[#4B5563] transition-colors duration-300 z-10">{category.tagline}</p>
        
        {/* Arrow indicator on hover */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300 z-10">
          <svg className="w-5 h-5 text-[#E6A11A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </div>
      </div>
    </button>
  )
}

export default ServiceCategoryCard

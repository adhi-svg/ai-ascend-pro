import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import TechnicianCard from '../components/cards/TechnicianCard'
import EmptyState from '../components/ui/EmptyState'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import Loader from '../components/ui/Loader'
import { useApp } from '../context/AppContext'

const getApprovedTechnicians = () => {
  try {
    const list = JSON.parse(localStorage.getItem('fixora_technicians') || '[]')
    return list.filter((tech) => tech.status === 'APPROVED').map((tech) => ({
      id: tech.id,
      name: tech.fullName,
      phone: tech.phone,
      skills: tech.skill ? [tech.skill] : [],
      distance: parseFloat(tech.radiusKm) || 10,
      rating: 4.5,
      reviews: 24,
      profilePhoto: tech.profilePhotoUrl,
    }))
  } catch {
    return []
  }
}

const TechnicianList = () => {
  const { techs, getPricing, loading } = useApp()
  const [query, setQuery] = useState('')
  const [searchRadius, setSearchRadius] = useState(1.5)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const selectedService = searchParams.get('service')
  const serviceName = searchParams.get('name')

  const allTechs = useMemo(() => {
    const mockTechs = techs || []
    const approvedTechs = getApprovedTechnicians()
    return [...mockTechs, ...approvedTechs]
  }, [techs])

  const filtered = useMemo(() => {
    return allTechs
      .map((t) => ({ ...t, confirmationCharge: getPricing(t.distance, t.rating) }))
      .filter((t) => {
        if (t.distance > searchRadius) return false

        if (selectedService) {
          const searchTerm = serviceName?.toLowerCase() || selectedService.toLowerCase()
          return t.skills.some((skill) => skill.toLowerCase().includes(searchTerm))
        }
        return t.name.toLowerCase().includes(query.toLowerCase()) || t.skills.join(',').toLowerCase().includes(query.toLowerCase())
      })
  }, [allTechs, query, getPricing, selectedService, serviceName, searchRadius])

  const handleExtendRadius = () => {
    setSearchRadius((prev) => parseFloat((prev + 0.5).toFixed(1)))
  }

  const handleTryAnotherLocation = () => {
    navigate('/customer/home?section=account')
  }

  if (loading) {
    return <Loader label="Finding local technicians in your area..." />
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto px-4">
      {selectedService && (
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-900">Local {serviceName} technicians near you</p>
              <p className="text-xs text-gray-600 mt-1">Within {searchRadius} km • Independent local professionals</p>
            </div>
            <Button
              variant="secondary"
              onClick={() => {
                navigate('/customer/home')
              }}
              className="text-xs"
            >
              ← Back
            </Button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <p className="text-xs uppercase tracking-widest font-semibold text-gray-500 mb-1">Local Professionals</p>
        <p className="text-sm text-gray-600">Independent technicians in your neighborhood</p>
      </div>

      <Input
        label="Search local technician or skill"
        placeholder="e.g., electrician, plumber, AC repair"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {filtered.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center space-y-4">
          <div>
            <p className="text-lg font-semibold text-gray-900 mb-2"><MapPin size={16} className="inline mr-1" /> No local technicians found</p>
            <p className="text-sm text-gray-600 mb-4">
              {selectedService
                ? `No local ${serviceName} technicians available within ${searchRadius} km`
                : 'No technicians match your search in this area'}
            </p>
          </div>
          <div className="flex gap-3 flex-col sm:flex-row justify-center">
            <Button
              onClick={handleExtendRadius}
              className="flex-1 sm:flex-none"
            >
              <Search size={16} className="inline mr-1" /> Extend search to {(searchRadius + 0.5).toFixed(1)} km
            </Button>
            <Button
              variant="secondary"
              onClick={handleTryAnotherLocation}
              className="flex-1 sm:flex-none"
            >
              <MapPin size={16} className="inline mr-1" /> Try another location
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-gray-700">
            Found {filtered.length} local technician{filtered.length !== 1 ? 's' : ''} within {searchRadius} km
          </p>
          {filtered.map((tech) => (
            <TechnicianCard
              key={tech.id}
              tech={tech}
              onSelect={(t) => navigate('/login', { state: { techId: t.id } })}
            />
          ))}
          {filtered.length > 0 && searchRadius < 10 && (
            <div className="text-center pt-2">
              <Button
                variant="secondary"
                onClick={handleExtendRadius}
                className="text-sm"
              >
                <Search size={16} className="inline mr-1" /> Extend search to {(searchRadius + 0.5).toFixed(1)} km
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default TechnicianList

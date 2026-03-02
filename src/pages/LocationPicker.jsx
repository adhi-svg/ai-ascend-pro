import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import Button from '../components/ui/Button'
import L from 'leaflet'

const LocationPicker = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { setToast, setCurrentLocation } = useApp()
  const mapRef = useRef(null)
  const mapInstance = useRef(null)
  const markerRef = useRef(null)

  const [selectedLocation, setSelectedLocation] = useState(null)
  const [searchAddress, setSearchAddress] = useState('')
  const [coordinates, setCoordinates] = useState({
    lat: 28.6139,
    lng: 77.2090,
  })

  // Initialize map on component mount
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return

    try {
      // Create map centered on default coordinates
      mapInstance.current = L.map(mapRef.current).setView(
        [coordinates.lat, coordinates.lng],
        13
      )

      // Add OpenStreetMap tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(mapInstance.current)

      // Add click handler to map
      mapInstance.current.on('click', handleMapClick)

      // Add initial marker at default location
      markerRef.current = L.marker([coordinates.lat, coordinates.lng], {
        icon: L.icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
        }),
        draggable: true,
        title: 'Drag to adjust or click map',
      })
        .bindPopup('📍 Click map or drag marker to select location')
        .addTo(mapInstance.current)

      // Handle marker drag
      markerRef.current.on('dragend', () => {
        const latLng = markerRef.current.getLatLng()
        setCoordinates({ lat: latLng.lat, lng: latLng.lng })
        reverseGeocode(latLng.lat, latLng.lng)
      })

      // Open popup
      markerRef.current.openPopup()
    } catch (error) {
      console.error('Error initializing map:', error)
      setToast({ type: 'error', message: 'Failed to load map' })
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove()
        mapInstance.current = null
      }
    }
  }, [])

  // Handle map clicks
  const handleMapClick = (e) => {
    const { lat, lng } = e.latlng
    setCoordinates({ lat, lng })

    // Move marker to clicked location
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng])
    }

    // Get address from coordinates
    reverseGeocode(lat, lng)
  }

  // Reverse geocode (coordinates to address)
  const reverseGeocode = async (lat, lng) => {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      const response = await fetch(url)
      const data = await response.json()

      if (data.display_name) {
        setSearchAddress(data.display_name)
        console.log('Address retrieved:', data.display_name)
        return data.display_name
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error)
    }
    return null
  }

  // Forward geocode (address to coordinates)
  const handleSearch = async () => {
    if (!searchAddress.trim()) {
      setToast({ type: 'warning', message: 'Enter an address to search' })
      return
    }

    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchAddress)}`
      const response = await fetch(url)
      const data = await response.json()

      if (data.length === 0) {
        setToast({ type: 'warning', message: 'Address not found' })
        return
      }

      const result = data[0]
      const lat = parseFloat(result.lat)
      const lng = parseFloat(result.lon)

      setCoordinates({ lat, lng })

      // Update map view
      if (mapInstance.current) {
        mapInstance.current.setView([lat, lng], 15)

        // Move marker
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng])
        }
      }

      setToast({ type: 'success', message: 'Location found!' })
    } catch (error) {
      console.error('Error searching address:', error)
      setToast({ type: 'error', message: 'Failed to search address' })
    }
  }

  // Use current location
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setToast({ type: 'warning', message: 'Geolocation not supported' })
      return
    }

    setToast({ type: 'info', message: 'Getting your current location...' })

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        setCoordinates({ lat: latitude, lng: longitude })

        if (mapInstance.current) {
          mapInstance.current.setView([latitude, longitude], 15)
          if (markerRef.current) {
            markerRef.current.setLatLng([latitude, longitude])
          }
        }

        // Wait for the reverse geocode to complete and get the address
        await reverseGeocode(latitude, longitude)
        setToast({ type: 'success', message: 'Current location detected with address' })
      },
      (error) => {
        console.error('Geolocation error:', error)
        if (error?.code === 1) {
          setToast({ type: 'error', message: 'Location permission denied. Enable it in browser settings.' })
        } else if (error?.code === 2) {
          setToast({ type: 'error', message: 'Location unavailable. Check your device settings.' })
        } else if (error?.code === 3) {
          setToast({ type: 'error', message: 'Location request timed out. Try again.' })
        } else {
          setToast({ type: 'error', message: 'Failed to get current location' })
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    )
  }

  // Confirm location selection
  const handleConfirmLocation = () => {
    const locationData = {
      lat: coordinates.lat,
      lng: coordinates.lng,
      address: searchAddress,
    }

    // Update the global context with the selected location
    setCurrentLocation(locationData)
    setToast({ type: 'success', message: 'Location updated successfully' })

    // Navigate back to the previous page
    navigate(-1, { replace: true })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#CFEDEE] via-[#E8F8F9] to-[#D4F0F2] p-4">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-[#E6A11A]/20 rounded-2xl p-4 mb-4 shadow-md">
          <button
            onClick={() => navigate(-1)}
            className="text-2xl mb-2 text-[#1E3A5F] hover:text-[#E6A11A] transition-colors"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-[#1E3A5F]">Select Precise Location</h1>
          <p className="text-sm text-[#4B5563] mt-1">Click on map or drag marker to pin your location</p>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-2xl shadow-md border border-[#E6A11A]/10 p-4 mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search address..."
              value={searchAddress}
              onChange={(e) => setSearchAddress(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1 px-4 py-2 border border-[#E6A11A]/20 rounded-lg focus:outline-none focus:border-[#E6A11A]"
            />
            <Button
              onClick={handleSearch}
              className="bg-[#E6A11A] hover:bg-[#C88B12] text-white px-4 py-2"
            >
              Search
            </Button>
            <Button
              onClick={handleUseCurrentLocation}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2"
              title="Use my current location"
            >
              📍
            </Button>
          </div>
        </div>

        {/* Map Container */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-[#E6A11A]/10 mb-4 aspect-video">
          <div ref={mapRef} className="w-full h-full" />
        </div>

        {/* Coordinates Display */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-white rounded-xl p-4 border border-[#E6A11A]/10 shadow-sm">
            <p className="text-xs text-[#4B5563] mb-1">Latitude</p>
            <p className="text-lg font-semibold text-[#1E3A5F]">{coordinates.lat.toFixed(6)}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-[#E6A11A]/10 shadow-sm">
            <p className="text-xs text-[#4B5563] mb-1">Longitude</p>
            <p className="text-lg font-semibold text-[#1E3A5F]">{coordinates.lng.toFixed(6)}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-[#E6A11A]/10 shadow-sm">
            <p className="text-xs text-[#4B5563] mb-1">Address</p>
            <p className="text-sm font-semibold text-[#1E3A5F] line-clamp-2">
              {searchAddress || 'Detecting...'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4 pb-20">
          <Button
            onClick={() => navigate(-1)}
            className="border-2 border-[#E6A11A] text-[#1E3A5F] hover:bg-[#E6A11A]/10"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmLocation}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
          >
            ✓ Confirm Location
          </Button>
        </div>
      </div>
    </div>
  )
}

export default LocationPicker

const STORAGE_KEY = 'fixora_technicians'
const SESSION_KEY = 'fixora_admin_session'

const safeParse = (value, fallback) => {
  if (!value) return fallback
  try {
    const parsed = JSON.parse(value)
    return parsed ?? fallback
  } catch {
    return fallback
  }
}

const normalizeRecord = (record = {}) => {
  const createdAt = record.createdAt || new Date().toISOString()
  return {
    id: record.id || `tech_${Date.now()}`,
    fullName: record.fullName || record.name || '',
    phone: record.phone || record.mobile || '',
    email: record.email || '',
    profilePhotoUrl: record.profilePhotoUrl || record.profilePhoto || '/logo.png',
    skill: record.skill || record.primarySkill || '',
    experience: record.experience || '',
    radiusKm: record.radiusKm || record.serviceRadius || '',
    baseVisitFee: record.baseVisitFee || record.baseFee || '',
    hasShop: Boolean(record.hasShop),
    shopName: record.shopName || '',
    shopAddress: record.shopAddress || '',
    shopLocationText: record.shopLocationText || record.shopLocation || '',
    aadhaarNumber: record.aadhaarNumber || '',
    aadhaarFrontUrl: record.aadhaarFrontUrl || '',
    aadhaarBackUrl: record.aadhaarBackUrl || '',
    selfieUrl: record.selfieUrl || '',
    status: record.status || 'PENDING',
    rejectionReason: record.rejectionReason || '',
    createdAt,
  }
}

const loadExistingSignupData = () => {
  const candidateKeys = [
    'fixora_technician_applications',
    'fixora_technician_signup',
    'technician_applications',
    'tech_user_info',
  ]

  for (const key of candidateKeys) {
    const raw = localStorage.getItem(key)
    if (!raw) continue
    const parsed = safeParse(raw, null)
    if (Array.isArray(parsed)) {
      const normalized = parsed.map(normalizeRecord)
      if (normalized.length > 0) return normalized
    }
    if (parsed && typeof parsed === 'object') {
      return [normalizeRecord(parsed)]
    }
  }

  return []
}

export const seedIfEmpty = () => {
  const existing = safeParse(localStorage.getItem(STORAGE_KEY), null)
  if (Array.isArray(existing) && existing.length > 0) return

  const migrated = loadExistingSignupData()
  if (migrated.length > 0) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated))
    return
  }

  const now = new Date()
  const seed = [
    {
      id: `tech_${now.getTime()}`,
      fullName: 'Ravi Sharma',
      phone: '9876543210',
      email: 'ravi.sharma@example.com',
      profilePhotoUrl: '/logo.png',
      skill: 'Electrical',
      experience: '5 years',
      radiusKm: '8',
      baseVisitFee: '199',
      hasShop: true,
      shopName: 'Ravi Electricals',
      shopAddress: '22 Green Park, Mumbai',
      shopLocationText: 'Near City Mall',
      aadhaarNumber: '123412341234',
      aadhaarFrontUrl: '/logo.png',
      aadhaarBackUrl: '/logo.png',
      selfieUrl: '/logo.png',
      status: 'PENDING',
      rejectionReason: '',
      createdAt: now.toISOString(),
    },
    {
      id: `tech_${now.getTime() + 1}`,
      fullName: 'Priya Nair',
      phone: '9123456780',
      email: 'priya.nair@example.com',
      profilePhotoUrl: '/logo.png',
      skill: 'Plumbing',
      experience: '3 years',
      radiusKm: '10',
      baseVisitFee: '149',
      hasShop: false,
      shopName: '',
      shopAddress: '',
      shopLocationText: '',
      aadhaarNumber: '234523452345',
      aadhaarFrontUrl: '/logo.png',
      aadhaarBackUrl: '/logo.png',
      selfieUrl: '/logo.png',
      status: 'APPROVED',
      rejectionReason: '',
      createdAt: new Date(now.getTime() - 86400000).toISOString(),
    },
    {
      id: `tech_${now.getTime() + 2}`,
      fullName: 'Imran Khan',
      phone: '9988776655',
      email: 'imran.khan@example.com',
      profilePhotoUrl: '/logo.png',
      skill: 'HVAC',
      experience: '7 years',
      radiusKm: '12',
      baseVisitFee: '249',
      hasShop: true,
      shopName: 'Cool Air Services',
      shopAddress: '7 Lake Road, Pune',
      shopLocationText: 'Opposite Metro Station',
      aadhaarNumber: '345634563456',
      aadhaarFrontUrl: '/logo.png',
      aadhaarBackUrl: '/logo.png',
      selfieUrl: '/logo.png',
      status: 'REJECTED',
      rejectionReason: 'Aadhaar image is unclear',
      createdAt: new Date(now.getTime() - 172800000).toISOString(),
    },
  ]

  localStorage.setItem(STORAGE_KEY, JSON.stringify(seed))
}

export const getAllTechnicians = () => {
  seedIfEmpty()
  return safeParse(localStorage.getItem(STORAGE_KEY), [])
}

export const getTechnicianById = (id) => {
  const list = getAllTechnicians()
  return list.find((tech) => tech.id === id) || null
}

export const saveTechnicians = (list) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

export const approveTechnician = (id) => {
  const list = getAllTechnicians()
  const updated = list.map((tech) =>
    tech.id === id
      ? { ...tech, status: 'APPROVED', rejectionReason: '' }
      : tech,
  )
  saveTechnicians(updated)
  return updated
}

export const rejectTechnician = (id, reason) => {
  const list = getAllTechnicians()
  const updated = list.map((tech) =>
    tech.id === id
      ? { ...tech, status: 'REJECTED', rejectionReason: reason }
      : tech,
  )
  saveTechnicians(updated)
  return updated
}

export const adminSessionKey = SESSION_KEY

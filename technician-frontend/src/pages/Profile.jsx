import { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { useTechApp } from '../context/TechAppContext.jsx'
import Button from '../components/ui/Button.jsx'
import Card from '../components/ui/Card.jsx'
import Input from '../components/ui/Input.jsx'

export default function Profile() {
  const { user, updateProfile } = useAuth()
  const { addToast } = useTechApp()
  const technicianPhoto =
    user?.profilePhotoUrl ||
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&h=160&q=80'
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    skills: user?.skills?.join(', ') || '',
    serviceArea: user?.serviceArea || '',
    experience: user?.experience || '',
  })

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    updateProfile({
      name: form.name,
      phone: form.phone,
      skills: form.skills.split(',').map((item) => item.trim()),
      serviceArea: form.serviceArea,
      experience: form.experience,
    })
    addToast({ title: 'Profile saved', message: 'Local profile updated.' })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="heading-lg">Profile</h2>
        <p className="text-sm text-brand-text-secondary">Manage technician details.</p>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-4">
          <img src={technicianPhoto} alt="TechFlow" className="h-14 w-14 rounded-full object-cover" />
          <div>
            <p className="text-lg font-semibold text-brand-primary">{user?.name}</p>
            <p className="text-sm text-brand-text-secondary">{user?.serviceArea}</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-xs font-semibold text-brand-text-secondary">Name</label>
            <Input name="name" value={form.name} onChange={handleChange} />
          </div>
          <div>
            <label className="text-xs font-semibold text-brand-text-secondary">Phone</label>
            <Input name="phone" value={form.phone} onChange={handleChange} />
          </div>
          <div>
            <label className="text-xs font-semibold text-brand-text-secondary">Skills</label>
            <Input name="skills" value={form.skills} onChange={handleChange} />
          </div>
          <div>
            <label className="text-xs font-semibold text-brand-text-secondary">Service area</label>
            <Input name="serviceArea" value={form.serviceArea} onChange={handleChange} />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-semibold text-brand-text-secondary">Experience</label>
            <Input name="experience" value={form.experience} onChange={handleChange} />
          </div>
          <div className="md:col-span-2">
            <Button type="submit">Save changes</Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

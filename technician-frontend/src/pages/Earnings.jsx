import { useMemo } from 'react'
import { useTechApp } from '../context/TechAppContext.jsx'
import Card from '../components/ui/Card.jsx'

export default function Earnings() {
  const { bookings } = useTechApp()

  const completed = useMemo(
    () => bookings.filter((booking) => booking.status === 'completed'),
    [bookings],
  )

  const total = completed.reduce((sum, booking) => sum + (booking.amount || 0), 0)
  const avgRating = 4.7

  const chartData = [
    { label: 'Mon', value: 120 },
    { label: 'Tue', value: 80 },
    { label: 'Wed', value: 150 },
    { label: 'Thu', value: 90 },
    { label: 'Fri', value: 200 },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="heading-lg">Earnings</h2>
        <p className="text-sm text-brand-text-secondary">Weekly performance and payouts.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-5">
          <p className="text-xs text-brand-text-secondary">Total earnings</p>
          <p className="text-2xl font-semibold text-brand-primary">${total}</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs text-brand-text-secondary">Completed jobs</p>
          <p className="text-2xl font-semibold text-brand-primary">{completed.length}</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs text-brand-text-secondary">Avg rating</p>
          <p className="text-2xl font-semibold text-brand-primary">{avgRating}</p>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-sm font-semibold text-brand-primary">Weekly earnings</h3>
        <div className="mt-6 flex items-end gap-4">
          {chartData.map((item) => (
            <div key={item.label} className="flex flex-col items-center gap-2">
              <div
                className="w-10 rounded-2xl bg-brand-accent/40"
                style={{ height: `${item.value}px` }}
              />
              <span className="text-xs text-brand-text-secondary">{item.label}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

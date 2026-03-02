import { Link } from 'react-router-dom'
import Card from '../components/ui/Card.jsx'

export default function NotAuthorized() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="w-full max-w-lg p-8 text-center">
        <h1 className="heading-md">Access denied</h1>
        <p className="mt-2 text-sm text-brand-text-secondary">
          This area is for technician accounts only.
        </p>
        <Link to="/login" className="mt-4 inline-block text-xs font-semibold text-brand-primary">
          Back to login
        </Link>
      </Card>
    </div>
  )
}

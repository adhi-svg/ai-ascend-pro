import Badge from '../ui/Badge'
import Button from '../ui/Button'

const JobInvitationCard = ({ job, onAccept, onReject }) => (
  <div className="card-base rounded-2xl bg-white p-4">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-slate-500">{job.customer}</p>
        <p className="text-lg font-semibold text-slate-900">{job.title}</p>
        <p className="mt-1 text-sm text-slate-600">{job.description}</p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
          <Badge tone="brand">OTP: {job.otp}</Badge>
          <Badge tone="neutral">Est. ₹{job.budget}</Badge>
          <Badge tone="warning">{job.status}</Badge>
        </div>
      </div>
      <img
        src={job.imageUrl || 'https://via.placeholder.com/72x72?text=Issue'}
        alt="Issue"
        className="h-16 w-16 rounded-xl object-cover"
      />
    </div>
    <div className="mt-4 flex items-center gap-2">
      <Button variant="secondary" className="flex-1" onClick={() => onReject?.(job)}>
        Reject
      </Button>
      <Button className="flex-1" onClick={() => onAccept?.(job)}>
        Accept
      </Button>
    </div>
  </div>
)

export default JobInvitationCard

export default function Loader({ lines = 3 }) {
  const items = Array.from({ length: lines }, (_, index) => index)
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item} className="h-4 w-full rounded-full bg-white/70 animate-shimmer" />
      ))}
    </div>
  )
}

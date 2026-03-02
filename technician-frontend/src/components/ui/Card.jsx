export default function Card({ children, className = '' }) {
  return <div className={`card-base ${className}`}>{children}</div>
}

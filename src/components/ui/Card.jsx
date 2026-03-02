const Card = ({ children, className = '' }) => (
  <div className={`rounded-lg bg-white p-4 shadow-[0_2px_12px_rgba(30,58,95,0.08)] hover:shadow-[0_4px_20px_rgba(230,161,26,0.12)] transition-shadow duration-300 card-base ${className}`}>{children}</div>
)

export default Card

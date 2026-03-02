const Input = ({ label, helper, size = "medium", horizontal = false, ...rest }) => {
  const sizeClasses = {
    small: "w-48",
    medium: "w-full",
    large: "w-full"
  }

  if (horizontal) {
    return (
      <div className="flex items-start gap-4">
        <label className="flex-shrink-0 text-base font-bold text-[#1E3A5F] pt-3 min-w-max">
          {label}
        </label>
        <div className="flex flex-col gap-2 flex-1">
          <input
            className={`w-80 rounded-lg border border-[#E6A11A]/30 bg-white px-4 py-3 text-[#1E3A5F] placeholder:text-[#9CA3AF] shadow-[0_2px_8px_rgba(30,58,95,0.06)] transition duration-300 focus:border-[#E6A11A] focus:ring-2 focus:ring-[#E6A11A]/20 focus:outline-none`}
            {...rest}
          />
          {helper && <span className="text-xs font-normal text-[#9CA3AF]">{helper}</span>}
        </div>
      </div>
    )
  }

  return (
    <label className="flex flex-col gap-2 text-sm font-medium text-[#1E3A5F]">
      {label}
      <input
        className={`${sizeClasses[size]} rounded-lg border border-[#E6A11A]/30 bg-white px-4 py-3 text-[#1E3A5F] placeholder:text-[#9CA3AF] shadow-[0_2px_8px_rgba(30,58,95,0.06)] transition duration-300 focus:border-[#E6A11A] focus:ring-2 focus:ring-[#E6A11A]/20 focus:outline-none`}
        {...rest}
      />
      {helper && <span className="text-xs font-normal text-[#9CA3AF]">{helper}</span>}
    </label>
  )
}

export default Input

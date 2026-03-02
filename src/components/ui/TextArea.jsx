const TextArea = ({ label, helper, rows = 4, ...rest }) => (
  <label className="flex flex-col gap-2 text-sm font-medium text-[#1E3A5F]">
    {label}
    <textarea
      rows={rows}
      className="w-full rounded-2xl border border-[#E6A11A]/30 bg-white px-4 py-3 text-[#1E3A5F] placeholder:text-[#9CA3AF] shadow-[0_2px_8px_rgba(30,58,95,0.06)] transition duration-300 focus:border-[#E6A11A] focus:ring-2 focus:ring-[#E6A11A]/20 focus:outline-none resize-none"
      {...rest}
    />
    {helper && <span className="text-xs font-normal text-[#9CA3AF]">{helper}</span>}
  </label>
)

export default TextArea

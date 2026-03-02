const Footer = () => {
  return (
    <footer className="border-t border-[#E6A11A]/20 bg-gradient-to-r from-[#1E3A5F] to-[#2E5A8F] backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center rounded-xl bg-[#CFEDEE] p-1 shadow-sm">
            <img src="/logo.png" alt="FIXORA" className="w-8 h-8 object-contain" />
          </span>
          <div>
            <p className="font-bold text-white text-lg">FIXORA</p>
            <p className="text-xs text-white/70">Your Trusted Technician Partner</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-6 text-white/80 hover:text-white transition-colors">
          <a href="/support/help" className="text-sm hover:text-[#E6A11A] transition-colors">Support</a>
          <a href="/support/privacy" className="text-sm hover:text-[#E6A11A] transition-colors">Privacy</a>
          <a href="/support/terms" className="text-sm hover:text-[#E6A11A] transition-colors">Terms</a>
          <a href="/support/contact" className="text-sm hover:text-[#E6A11A] transition-colors">Contact</a>
        </div>
        <p className="text-xs text-white/60">© 2026 FIXORA. All rights reserved.</p>
      </div>
    </footer>
  )
}

export default Footer

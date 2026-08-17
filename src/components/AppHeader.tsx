export function AppHeader() {
  return (
    <header className="bg-forest-950 text-[#f8f5ea]">
      <div className="mx-auto flex min-h-16 max-w-[1040px] items-center justify-between px-4 sm:min-h-[76px] sm:px-5">
        <div className="flex items-center gap-3 text-left" aria-label="PMCS">
          <span className="grid size-[34px] place-items-center rounded-lg border border-white/40 bg-olive-300 text-base font-extrabold text-[#22311f]">
            P
          </span>
          <span>
            <strong className="block text-[15px] tracking-[0.16em] text-[#f8f5ea]">PMCS</strong>
            <small className="mt-px block text-[11px] text-[#b7c0ad]">Vehicle readiness</small>
          </span>
        </div>
        <span className="hidden items-center gap-2 text-[13px] text-[#dce6cb] sm:flex">
          <span className="size-2 rounded-full bg-[#b8d843] shadow-[0_0_0_4px_rgba(184,216,67,0.12)]" />
          System online
        </span>
      </div>
    </header>
  )
}

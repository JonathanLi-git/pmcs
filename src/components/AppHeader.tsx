export function AppHeader() {
  return (
    <header className="border-b border-line bg-surface text-ink">
      <div className="mx-auto flex min-h-14 max-w-[1040px] items-center px-4 sm:px-5">
        <div className="flex items-center gap-3 text-left" aria-label="PMCS">
          <span className="h-5 w-1 bg-selected" aria-hidden="true" />
          <strong className="text-sm tracking-[0.14em] text-ink">PMCS</strong>
          <span className="border-l border-line pl-3 text-[11px] font-bold tracking-[0.1em] text-muted">
            FIELD INSPECTION
          </span>
        </div>
      </div>
    </header>
  )
}

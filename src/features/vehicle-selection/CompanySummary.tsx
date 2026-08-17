import type { Company } from '../../types/fleet'

interface CompanySummaryProps {
  company: Company
}

export function CompanySummary({ company }: CompanySummaryProps) {
  const vehicleCount = company.platoons.reduce(
    (total, platoon) => total + platoon.vehicles.length,
    0,
  )

  return (
    <section
      className="mt-5 flex flex-col gap-3 border-b border-line pb-4 text-left sm:flex-row sm:items-end sm:justify-between"
      aria-label="Selected company"
    >
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted">Unit</p>
        <h2 className="mt-1 text-lg leading-tight font-semibold tracking-[-0.02em] text-ink">
          {company.name}
        </h2>
        <p className="mt-1 text-sm text-muted">{company.unit}</p>
      </div>
      <p className="text-sm tabular-nums text-muted">
        {company.platoons.length} platoons <span aria-hidden="true">&middot;</span> {vehicleCount} vehicles
      </p>
    </section>
  )
}

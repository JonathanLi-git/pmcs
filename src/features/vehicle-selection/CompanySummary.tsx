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
      className="mt-7 flex items-center gap-3 rounded-[14px] border border-[#d8decd] bg-[#fbfcf6] p-4 text-left shadow-[0_9px_22px_rgba(42,54,34,0.05)] sm:mt-9 sm:gap-4 sm:px-[22px] sm:py-5"
      aria-label="Selected company"
    >
      <div className="grid size-12 shrink-0 place-items-center rounded-[10px] border border-[#9eaa81] bg-[#e9efcd] text-[13px] font-extrabold tracking-[0.08em] text-[#405031]">
        AC
      </div>
      <div>
        <p className="mb-1 text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#68735e]">
          Selected company
        </p>
        <h2 className="font-display mb-1 text-[23px] leading-[1.15] font-semibold tracking-[-0.025em] text-ink">
          {company.name}
        </h2>
        <p className="text-[15px] text-[#68735e]">
          {company.unit} &middot; {company.platoons.length} platoons &middot; {vehicleCount} vehicles
        </p>
      </div>
      <div className="ml-auto min-w-12 border-l border-[#dde2d3] pl-3 text-center sm:min-w-[88px] sm:pl-6">
        <strong className="font-display block text-[27px] leading-none text-ink">{vehicleCount}</strong>
        <span className="mt-1 block text-[11px] font-bold uppercase text-[#68735e]">vehicles</span>
      </div>
    </section>
  )
}

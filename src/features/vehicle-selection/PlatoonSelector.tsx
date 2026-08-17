import type { Platoon } from '../../types/fleet'

interface PlatoonSelectorProps {
  platoons: Platoon[]
  selectedPlatoonId: string
  onSelectPlatoon: (platoonId: string) => void
}

export function PlatoonSelector({
  platoons,
  selectedPlatoonId,
  onSelectPlatoon,
}: PlatoonSelectorProps) {
  return (
    <section className="mt-10 text-left" aria-labelledby="platoon-heading">
      <p className="mb-1.5 text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#68735e]">
        Step 1 of 2
      </p>
      <h2
        id="platoon-heading"
        className="font-display text-[23px] leading-[1.15] font-semibold tracking-[-0.025em] text-ink"
      >
        Choose a platoon
      </h2>

      <div className="mt-4 grid grid-cols-1 gap-3.5 sm:grid-cols-2" role="tablist" aria-label="Platoons">
        {platoons.map((platoon) => {
          const isActive = platoon.id === selectedPlatoonId

          return (
            <button
              type="button"
              role="tab"
              aria-selected={isActive}
              className={
                isActive
                  ? 'rounded-xl border border-forest-800 bg-forest-800 px-5 py-[18px] text-left text-[#f7f8ef] shadow-[0_8px_18px_rgba(50,67,39,0.16)] transition hover:-translate-y-0.5 focus:outline-none focus-visible:ring-3 focus-visible:ring-[#a5c848] focus-visible:ring-offset-3'
                  : 'rounded-xl border border-[#d6dccb] bg-[#fbfcf7] px-5 py-[18px] text-left text-[#4e5948] transition hover:-translate-y-0.5 hover:border-[#98a67b] focus:outline-none focus-visible:ring-3 focus-visible:ring-[#a5c848] focus-visible:ring-offset-3'
              }
              key={platoon.id}
              onClick={() => onSelectPlatoon(platoon.id)}
            >
              <span className="block text-[17px] font-bold">{platoon.name}</span>
              <small className={isActive ? 'mt-1 block text-xs text-[#d4ddbc]' : 'mt-1 block text-xs text-[#778270]'}>
                {platoon.vehicles.length} vehicles
              </small>
            </button>
          )
        })}
      </div>
    </section>
  )
}

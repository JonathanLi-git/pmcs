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
    <section className="mt-6 text-left" aria-labelledby="platoon-heading">
      <div className="flex items-baseline justify-between gap-4">
        <h2 id="platoon-heading" className="text-sm font-semibold text-ink">
          Platoon
        </h2>
        <span className="text-xs text-muted">Choose roster</span>
      </div>

      <div
        className="mt-3 inline-flex max-w-full flex-wrap gap-px border border-line bg-line"
        role="group"
        aria-label="Platoon roster"
      >
        {platoons.map((platoon) => {
          const isActive = platoon.id === selectedPlatoonId

          return (
            <button
              type="button"
              aria-pressed={isActive}
              className={
                isActive
                  ? 'bg-selected-soft px-3 py-2 text-left text-ink transition focus:outline-none focus-visible:ring-2 focus-visible:ring-selected focus-visible:ring-offset-2 focus-visible:ring-offset-surface'
                  : 'bg-panel px-3 py-2 text-left text-muted transition hover:bg-panel-raised hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-selected focus-visible:ring-offset-2 focus-visible:ring-offset-surface'
              }
              key={platoon.id}
              onClick={() => onSelectPlatoon(platoon.id)}
            >
              <span className="block text-sm font-semibold">{platoon.name}</span>
              <small className={isActive ? 'mt-0.5 block text-[11px] text-selected' : 'mt-0.5 block text-[11px] text-muted'}>
                {platoon.vehicles.length} vehicles
              </small>
            </button>
          )
        })}
      </div>
    </section>
  )
}

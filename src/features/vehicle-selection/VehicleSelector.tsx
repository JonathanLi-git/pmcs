import { getVehicleTypeLabel, vehicleTypes } from '../../types/fleet'
import type { Platoon, VehicleFilter } from '../../types/fleet'

interface VehicleSelectorProps {
  platoon: Platoon
  vehicleType: VehicleFilter
  onVehicleTypeChange: (vehicleType: VehicleFilter) => void
  onSelectVehicle: (vehicleId: string) => void
}

export function VehicleSelector({
  platoon,
  vehicleType,
  onVehicleTypeChange,
  onSelectVehicle,
}: VehicleSelectorProps) {
  const visibleVehicles = platoon.vehicles.filter(
    (vehicle) => vehicleType === 'All' || vehicle.type === vehicleType,
  )

  return (
    <section className="mt-7 text-left" aria-labelledby="vehicle-heading">
      <div className="flex flex-col items-start justify-between gap-3 border-b border-line pb-3 sm:flex-row sm:items-end">
        <div>
          <h2 id="vehicle-heading" className="text-lg font-semibold tracking-[-0.02em] text-ink">
            {platoon.name} vehicle roster
          </h2>
          <p className="mt-1 text-sm text-muted">Select a bumper number to start.</p>
        </div>
        <label className="flex w-full items-center justify-between gap-3 text-xs font-semibold text-muted sm:w-auto">
          <span>Filter</span>
          <select
            className="min-h-9 min-w-36 border border-line bg-panel px-2.5 text-sm font-medium text-ink outline-none focus:ring-2 focus:ring-selected focus:ring-offset-2 focus:ring-offset-surface"
            value={vehicleType}
            onChange={(event) => onVehicleTypeChange(event.target.value as VehicleFilter)}
          >
            <option value="All">All vehicles</option>
            {vehicleTypes.map((type) => (
              <option key={type} value={type}>
                {getVehicleTypeLabel(type)}
              </option>
            ))}
          </select>
        </label>
      </div>

      {visibleVehicles.length > 0 ? (
        <div className="mt-4 border border-line bg-panel">
          <div className="hidden grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] gap-4 border-b border-line bg-panel-raised px-4 py-2 text-[11px] font-bold uppercase tracking-[0.1em] text-muted sm:grid">
            <span>Bumper number</span>
            <span>Model</span>
            <span>Action</span>
          </div>
          <ul>
            {visibleVehicles.map((vehicle) => (
              <li className="border-b border-line last:border-b-0" key={vehicle.id}>
                <button
                  type="button"
                  className="group grid min-h-16 w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 px-4 py-3 text-left transition hover:bg-panel-raised focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-selected sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]"
                  onClick={() => onSelectVehicle(vehicle.id)}
                >
                  <span className="min-w-0">
                    <strong className="block text-lg font-semibold tracking-[-0.02em] text-ink">
                      {vehicle.bumper}
                    </strong>
                    <span className="mt-0.5 block text-xs text-muted sm:hidden">
                      {getVehicleTypeLabel(vehicle.type)}
                    </span>
                  </span>
                  <span className="hidden text-sm text-muted sm:block">
                    {getVehicleTypeLabel(vehicle.type)}
                  </span>
                  <span className="flex items-center gap-2 text-sm font-medium text-accent">
                    <span className="hidden sm:inline">Start PMCS</span>
                    <span className="text-lg leading-none transition-transform group-hover:translate-x-0.5" aria-hidden="true">
                      &rarr;
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="mt-4 border border-dashed border-line px-4 py-5 text-sm text-muted">
          No vehicles match this filter.
        </p>
      )}
    </section>
  )
}

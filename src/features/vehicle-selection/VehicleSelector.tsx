import { getVehicleTypeLabel, vehicleTypes } from '../../types/fleet'
import type { Platoon, VehicleFilter } from '../../types/fleet'

interface VehicleSelectorProps {
  platoon: Platoon
  vehicleType: VehicleFilter
  onVehicleTypeChange: (vehicleType: VehicleFilter) => void
  onSelectVehicle: (vehicleId: string) => void
}

function VehicleIcon() {
  return (
    <svg
      viewBox="0 0 64 44"
      aria-hidden="true"
      className="h-9 w-9 fill-none stroke-current"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 29V16.5c0-2.5 2-4.5 4.5-4.5h25c2.5 0 4.5 2 4.5 4.5V29" />
      <path d="M42 20h8.5l6 8.5V34H8v-5h34Z" />
      <path d="M13 12V7h19v5M20 34v3M49 34v3" />
      <circle cx="19" cy="35" r="5" />
      <circle cx="49" cy="35" r="5" />
      <path d="M12 21h20M46 24h5" />
    </svg>
  )
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
    <section className="mt-10 pt-2 text-left" aria-labelledby="vehicle-heading">
      <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="mb-1.5 text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#68735e]">
            Step 2 of 2
          </p>
          <h2
            id="vehicle-heading"
            className="font-display mb-1 text-[23px] leading-[1.15] font-semibold tracking-[-0.025em] text-ink"
          >
            Choose a bumper number
          </h2>
          <p className="text-[15px] text-[#68735e]">
            {platoon.name} &middot; Select the truck you are inspecting.
          </p>
        </div>
        <label className="grid w-full gap-1.5 text-xs font-bold text-[#66725f] sm:w-44">
          <span>Vehicle type</span>
          <select
            className="min-h-10 rounded-lg border border-[#cfd7c3] bg-white px-3 text-sm font-semibold text-[#263021] outline-none focus:ring-3 focus:ring-[#a5c848] focus:ring-offset-2"
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

      <div className="mt-5 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        {visibleVehicles.map((vehicle) => (
            <button
              type="button"
              className="group flex min-h-[122px] w-full items-center gap-3.5 rounded-xl border border-[#d7ddcd] bg-white p-[18px] text-left shadow-none transition hover:-translate-y-0.5 hover:border-[#91a27b] hover:shadow-[0_10px_22px_rgba(41,57,30,0.08)] focus:outline-none focus-visible:ring-3 focus-visible:ring-[#a5c848] focus-visible:ring-offset-3"
              key={vehicle.id}
              onClick={() => onSelectVehicle(vehicle.id)}
            >
              <span className="grid size-[50px] shrink-0 place-items-center rounded-[10px] bg-[#e6edd5] text-[#496136]">
                <VehicleIcon />
              </span>
                <span className="min-w-0">
                  <span className="flex min-h-[18px] items-center gap-2">
                    <span className="text-[11px] font-extrabold uppercase tracking-[0.07em] text-[#65745a]">
                      {getVehicleTypeLabel(vehicle.type)}
                    </span>
                  </span>
                <strong className="mt-1 block text-[23px] tracking-[-0.04em] text-ink">
                  {vehicle.bumper}
                </strong>
                <span className="block text-[13px] text-[#74806d]">Vehicle</span>
              </span>
              <span
                className="ml-auto text-[21px] text-[#849279] transition-transform group-hover:translate-x-1"
                aria-hidden="true"
              >
                &rarr;
              </span>
            </button>
        ))}
      </div>
    </section>
  )
}

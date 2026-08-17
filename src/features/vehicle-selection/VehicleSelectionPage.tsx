import { useState } from 'react'
import { CompanySummary } from './CompanySummary'
import { PlatoonSelector } from './PlatoonSelector'
import { VehicleSelector } from './VehicleSelector'
import type { Company, VehicleFilter } from '../../types/fleet'

interface VehicleSelectionPageProps {
  company: Company
  onSelectVehicle: (vehicleId: string) => void
}

export function VehicleSelectionPage({
  company,
  onSelectVehicle,
}: VehicleSelectionPageProps) {
  const firstPlatoon = company.platoons[0]
  const [activePlatoonId, setActivePlatoonId] = useState(firstPlatoon?.id ?? '')
  const [vehicleType, setVehicleType] = useState<VehicleFilter>('All')

  const activePlatoon =
    company.platoons.find((platoon) => platoon.id === activePlatoonId) ?? firstPlatoon

  function changePlatoon(platoonId: string) {
    setActivePlatoonId(platoonId)
    setVehicleType('All')
  }

  if (!activePlatoon) {
    return (
      <div className="mx-auto w-full max-w-[1040px] px-4 py-9 sm:px-5 sm:py-[52px]">
        <p className="rounded-xl border border-[#d8decd] bg-white p-5 text-[#68735e]">
          No platoons are configured for this company yet.
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-[1040px] px-4 py-9 sm:px-5 sm:py-[52px]">
      <section className="max-w-[650px] text-left" aria-labelledby="page-title">
        <p className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#68735e]">
          10-level maintenance
        </p>
        <h1
          id="page-title"
          className="font-display mb-3 text-[clamp(36px,5vw,50px)] leading-none font-semibold tracking-[-0.055em] text-ink"
        >
          Select a vehicle
        </h1>
        <p className="text-[15px] text-[#68735e]">
          Choose your platoon and bumper number to begin a guided PMCS.
        </p>
      </section>

      <CompanySummary company={company} />
      <PlatoonSelector
        platoons={company.platoons}
        selectedPlatoonId={activePlatoonId}
        onSelectPlatoon={changePlatoon}
      />
      <VehicleSelector
        platoon={activePlatoon}
        vehicleType={vehicleType}
        onVehicleTypeChange={setVehicleType}
        onSelectVehicle={onSelectVehicle}
      />
    </div>
  )
}

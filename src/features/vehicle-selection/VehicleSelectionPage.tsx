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
      <div className="mx-auto w-full max-w-[900px] px-4 py-8 sm:px-6 sm:py-12">
        <p className="border border-line bg-panel px-4 py-3 text-sm text-muted">
          No platoons are configured for this company yet.
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-[900px] px-4 py-8 sm:px-6 sm:py-12">
      <section className="border-b border-line pb-5 text-left" aria-labelledby="page-title">
        <h1
          id="page-title"
          className="text-[clamp(28px,4vw,36px)] leading-none font-semibold tracking-[-0.04em] text-ink"
        >
          Vehicle roster
        </h1>
        <p className="mt-2 text-sm text-muted">Select a platoon and bumper number to begin PMCS.</p>
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

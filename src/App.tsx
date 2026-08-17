import { useMemo, useState } from 'react'
import { AppHeader } from './components/AppHeader'
import { demoCompany } from './data/company'
import { PmcsPage } from './features/pmcs/PmcsPage'
import { VehicleSelectionPage } from './features/vehicle-selection/VehicleSelectionPage'

type AppScreen = 'vehicle-selection' | 'pmcs'

function App() {
  const [screen, setScreen] = useState<AppScreen>('vehicle-selection')
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null)

  const selectedVehicleContext = useMemo(() => {
    for (const platoon of demoCompany.platoons) {
      const vehicle = platoon.vehicles.find((candidate) => candidate.id === selectedVehicleId)

      if (vehicle) {
        return { platoon, vehicle }
      }
    }

    return null
  }, [selectedVehicleId])

  function beginPmcs(vehicleId: string) {
    setSelectedVehicleId(vehicleId)
    setScreen('pmcs')
  }

  function changeVehicle() {
    setScreen('vehicle-selection')
  }

  return (
    <main className="min-h-svh bg-surface text-ink">
      <AppHeader />

      {screen === 'pmcs' && selectedVehicleContext ? (
        <PmcsPage
          companyName={demoCompany.name}
          platoon={selectedVehicleContext.platoon}
          vehicle={selectedVehicleContext.vehicle}
          onChangeVehicle={changeVehicle}
        />
      ) : (
        <VehicleSelectionPage company={demoCompany} onSelectVehicle={beginPmcs} />
      )}
    </main>
  )
}

export default App

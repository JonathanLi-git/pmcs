import { isHummwvVehicleType } from '../types/fleet'
import type { VehicleType } from '../types/fleet'
import type { PmcsChecklist, PmcsInterval } from '../types/pmcs'
import { getLmtvPmcsChecklist } from './lmtvPmcsChecklist'
import { getHummwvPmcsChecklist } from './pmcsChecklist'

export { pmcsIntervalLabels, pmcsIntervals } from './pmcsChecklist'

export type PmcsChecklistResolution =
  | {
      status: 'available'
      checklist: PmcsChecklist
    }
  | {
      status: 'template-pending'
      message: string
    }

export function getPmcsChecklistForVehicle(
  vehicleType: VehicleType,
  interval: PmcsInterval,
): PmcsChecklistResolution {
  if (isHummwvVehicleType(vehicleType)) {
    return {
      status: 'available',
      checklist: getHummwvPmcsChecklist(vehicleType, interval),
    }
  }

  if (vehicleType === 'M1078') {
    return {
      status: 'available',
      checklist: getLmtvPmcsChecklist(interval),
    }
  }

  return {
    status: 'template-pending',
    message:
      'No PMCS checklist template has been configured for this vehicle type yet. Add a separately validated source template before collecting PMCS responses.',
  }
}

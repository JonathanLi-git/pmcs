export type HummwvVehicleType = 'M11A51' | 'M11A65'
export type LmtvVehicleType = 'M1078'
export type VehicleType = HummwvVehicleType | LmtvVehicleType
export type VehicleFilter = VehicleType | 'All'
export type VehiclePlatform = 'hmmwv' | 'lmtv'

export const vehicleTypes: VehicleType[] = ['M11A51', 'M11A65', 'M1078']

const vehicleTypeDetails: Record<VehicleType, { label: string; platform: VehiclePlatform }> = {
  M11A51: { label: 'M11A51', platform: 'hmmwv' },
  M11A65: { label: 'M11A65', platform: 'hmmwv' },
  M1078: { label: 'M1078 LMTV', platform: 'lmtv' },
}

export function getVehicleTypeLabel(vehicleType: VehicleType) {
  return vehicleTypeDetails[vehicleType].label
}

export function isHummwvVehicleType(vehicleType: VehicleType): vehicleType is HummwvVehicleType {
  return vehicleTypeDetails[vehicleType].platform === 'hmmwv'
}

export interface Vehicle {
  id: string
  bumper: string
  type: VehicleType
}

export interface Platoon {
  id: string
  name: string
  vehicles: Vehicle[]
}

export interface Company {
  name: string
  unit: string
  platoons: Platoon[]
}

import type { VehicleType } from './fleet'

export type PmcsInterval = 'before' | 'during' | 'after' | 'weekly' | 'monthly'
export type PmcsOutcome = 'complete' | 'fault' | 'not-applicable'

export interface PmcsStep {
  id: string
  globalRank: number
  intervalRank: number
  interval: PmcsInterval
  tmItemNo: number | string
  item: string
  sourceTable?: string
  appliesTo: string[]
  applicabilityNote?: string
  checks: string[]
  checkItems: string[]
  notReadyIf: string[]
  notes: string[]
  warnings: string[]
  serialConditions: Record<string, string>
  variantChecks: Record<string, string[]>
  isConditionallyApplicable: boolean
}

export interface PmcsChecklist {
  id: string
  title: string
  version: string
  vehicleType: VehicleType
  interval: PmcsInterval
  intervalLabel: string
  technicalManual: {
    number: string
    edition: string
    workPackage: string
  }
  sourceNotice: string
  useRules: string[]
  leakClassification: {
    classI: string
    classII: string
    classIII: string
    operatingRule: string
  }
  steps: PmcsStep[]
}

export interface PmcsStepAnswer {
  outcome?: PmcsOutcome
  checkedCheckIndexes: number[]
  faultNote: string
}

export type PmcsDraftAnswers = Record<string, PmcsStepAnswer>

export interface PmcsSubmission {
  operatorName: string
  attestedAt: string
  status: 'awaiting-supervisor-review'
}

import rawPmcsChecklist from './hummwv_m1151_m1165_10_level_pmcs.json'
import type { HummwvVehicleType } from '../types/fleet'
import type { PmcsChecklist, PmcsInterval, PmcsStep } from '../types/pmcs'

type SourceModel = 'M1151' | 'M1151A1' | 'M1165' | 'M1165A1'

interface RawPmcsStep {
  global_rank: number
  interval: PmcsInterval
  interval_rank: number
  tm_item_no: number | string
  item: string
  applies_to: string[]
  checks?: string[]
  not_ready_if: string[]
  notes?: string[]
  warnings?: string[]
  serial_conditions?: Record<string, string>
  variant_checks?: Record<string, string[]>
}

interface RawPmcsChecklist {
  title: string
  schema_version: string
  generated_date: string
  technical_manual: {
    number: string
    edition_used: string
    authoritative_access_note: string
    pmcs_work_packages: Record<PmcsInterval, string>
  }
  use_rules: string[]
  leak_classification: {
    class_I: string
    class_II: string
    class_III: string
    operating_rule: string
  }
  steps: RawPmcsStep[]
}

const source = rawPmcsChecklist as RawPmcsChecklist

export const pmcsIntervals: PmcsInterval[] = ['weekly', 'before', 'during', 'after', 'monthly']

export const pmcsIntervalLabels: Record<PmcsInterval, string> = {
  before: 'Before operation',
  during: 'During operation',
  after: 'After operation',
  weekly: 'Weekly',
  monthly: 'Monthly',
}

const sourceModelByVehicleType: Record<HummwvVehicleType, SourceModel> = {
  M11A51: 'M1151',
  M11A65: 'M1165',
}

function isApplicableToModel(appliesTo: string[], canonicalModel: SourceModel) {
  const exactModelPattern = new RegExp(`\\b${canonicalModel}\\b`, 'i')
  const hasExplicitModel = appliesTo.some((applicability) =>
    /\bM1151(?:A1)?\b|\bM1165(?:A1)?\b/i.test(applicability),
  )

  if (hasExplicitModel) {
    return appliesTo.some((applicability) => exactModelPattern.test(applicability))
  }

  return appliesTo.some((applicability) => applicability.toLowerCase() === 'equipped vehicles')
}

function isConditionallyApplicable(
  appliesTo: string[],
  serialConditions: Record<string, string>,
  variantChecks: Record<string, string[]>,
) {
  return (
    appliesTo.some((applicability) => applicability.toLowerCase().includes('equipped')) ||
    Object.keys(serialConditions).length > 0 ||
    Object.keys(variantChecks).length > 0
  )
}

function formatVariantLabel(variant: string) {
  return variant.split('_').join(' / ')
}

function toStep(rawStep: RawPmcsStep, canonicalModel: SourceModel): PmcsStep {
  const serialConditions = rawStep.serial_conditions ?? {}
  const variantChecks = Object.fromEntries(
    Object.entries(rawStep.variant_checks ?? {}).filter(([variant]) =>
      variant.split('_').includes(canonicalModel),
    ),
  )
  const checks = rawStep.checks ?? []
  const checkItems = [
    ...checks,
    ...Object.entries(variantChecks).flatMap(([variant, variantItems]) =>
      variantItems.map((item) => `${formatVariantLabel(variant)}: ${item}`),
    ),
  ]

  return {
    id: `tm-step-${String(rawStep.global_rank).padStart(3, '0')}`,
    globalRank: rawStep.global_rank,
    intervalRank: rawStep.interval_rank,
    interval: rawStep.interval,
    tmItemNo: rawStep.tm_item_no,
    item: rawStep.item,
    appliesTo: rawStep.applies_to,
    checks,
    checkItems,
    notReadyIf: rawStep.not_ready_if,
    notes: rawStep.notes ?? [],
    warnings: rawStep.warnings ?? [],
    serialConditions,
    variantChecks,
    isConditionallyApplicable: isConditionallyApplicable(
      rawStep.applies_to,
      serialConditions,
      variantChecks,
    ),
  }
}

export function getHummwvPmcsChecklist(
  vehicleType: HummwvVehicleType,
  interval: PmcsInterval,
): PmcsChecklist {
  const canonicalModel = sourceModelByVehicleType[vehicleType]
  const steps = source.steps
    .filter((rawStep) => rawStep.interval === interval)
    .filter((rawStep) => isApplicableToModel(rawStep.applies_to, canonicalModel))
    .sort((left, right) => left.interval_rank - right.interval_rank)
    .map((rawStep) => toStep(rawStep, canonicalModel))

  return {
    id: `${vehicleType.toLowerCase()}-${interval}-${source.schema_version}`,
    title: source.title,
    version: `Source schema ${source.schema_version} - ${source.generated_date}`,
    vehicleType,
    interval,
    intervalLabel: pmcsIntervalLabels[interval],
    technicalManual: {
      number: source.technical_manual.number,
      edition: source.technical_manual.edition_used,
      workPackage: source.technical_manual.pmcs_work_packages[interval],
    },
    sourceNotice: source.technical_manual.authoritative_access_note,
    useRules: source.use_rules,
    leakClassification: {
      classI: source.leak_classification.class_I,
      classII: source.leak_classification.class_II,
      classIII: source.leak_classification.class_III,
      operatingRule: source.leak_classification.operating_rule,
    },
    steps,
  }
}

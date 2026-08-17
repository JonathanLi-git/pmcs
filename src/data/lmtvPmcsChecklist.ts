import rawLmtvPmcsChecklist from './lmtv_m1078_10_level_pmcs.json'
import type { PmcsChecklist, PmcsInterval, PmcsStep } from '../types/pmcs'
import { pmcsIntervalLabels } from './pmcsChecklist'

interface RawLmtvStep {
  global_rank: number
  table: string
  tm_item_no: string
  interval: PmcsInterval
  item: string
  checks: string[]
  not_fmc_if: string[]
  conditional?: string
  warnings?: string[]
  notes?: string[]
}

interface RawLmtvChecklist {
  title: string
  schema_version: string
  generated_date: string
  vehicle: {
    model: 'M1078'
    excluded_variants: string[]
  }
  technical_manual: {
    number: string
    edition_used: string
    authority_note: string
    pmcs_sections: {
      all_models: string
      m1078_specific: string
    }
  }
  leak_classification: {
    class_I: string
    class_II: string
    class_III: string
    rule: string
  }
  use_rules: string[]
  steps: RawLmtvStep[]
}

const source = rawLmtvPmcsChecklist as RawLmtvChecklist

function toPmcsStep(rawStep: RawLmtvStep, intervalRank: number): PmcsStep {
  return {
    id: `m1078-tm-step-${String(rawStep.global_rank).padStart(3, '0')}`,
    globalRank: rawStep.global_rank,
    intervalRank,
    interval: rawStep.interval,
    tmItemNo: rawStep.tm_item_no,
    item: rawStep.item,
    sourceTable: `Table ${rawStep.table}`,
    appliesTo: rawStep.conditional ? [rawStep.conditional] : ['M1078'],
    applicabilityNote: rawStep.conditional,
    checks: rawStep.checks,
    checkItems: rawStep.checks,
    notReadyIf: rawStep.not_fmc_if,
    notes: rawStep.notes ?? [],
    warnings: rawStep.warnings ?? [],
    serialConditions: {},
    variantChecks: {},
    isConditionallyApplicable: Boolean(rawStep.conditional),
  }
}

export function getLmtvPmcsChecklist(interval: PmcsInterval): PmcsChecklist {
  const steps = source.steps
    .filter((rawStep) => rawStep.interval === interval)
    .sort((left, right) => left.global_rank - right.global_rank)
    .map((rawStep, index) => toPmcsStep(rawStep, index + 1))
  const excludedVariants = source.vehicle.excluded_variants.join(' and ')

  return {
    id: `m1078-${interval}-${source.schema_version}`,
    title: source.title,
    version: `Source schema ${source.schema_version} - ${source.generated_date}`,
    vehicleType: 'M1078',
    interval,
    intervalLabel: pmcsIntervalLabels[interval],
    technicalManual: {
      number: source.technical_manual.number,
      edition: source.technical_manual.edition_used,
      workPackage: `${source.technical_manual.pmcs_sections.all_models} + ${source.technical_manual.pmcs_sections.m1078_specific}`,
    },
    sourceNotice: `This template applies to the base M1078 only; ${excludedVariants} require separate PMCS templates. ${source.technical_manual.authority_note}`,
    useRules: source.use_rules,
    leakClassification: {
      classI: source.leak_classification.class_I,
      classII: source.leak_classification.class_II,
      classIII: source.leak_classification.class_III,
      operatingRule: source.leak_classification.rule,
    },
    steps,
  }
}

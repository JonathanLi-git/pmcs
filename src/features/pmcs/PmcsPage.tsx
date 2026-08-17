import { useMemo, useState } from 'react'
import {
  getPmcsChecklistForVehicle,
  pmcsIntervalLabels,
  pmcsIntervals,
} from '../../data/pmcsCatalog'
import { getVehicleTypeLabel } from '../../types/fleet'
import type { Platoon, Vehicle } from '../../types/fleet'
import type {
  PmcsDraftAnswers,
  PmcsInterval,
  PmcsOutcome,
  PmcsStep,
  PmcsStepAnswer,
  PmcsSubmission,
} from '../../types/pmcs'
import { PmcsReviewPage } from './PmcsReviewPage'
import { PmcsStepCard } from './PmcsStepCard'

interface PmcsPageProps {
  companyName: string
  platoon: Platoon
  vehicle: Vehicle
  onChangeVehicle: () => void
}

type AnswersByChecklist = Record<string, PmcsDraftAnswers>

function createEmptyAnswer(): PmcsStepAnswer {
  return { checkedCheckIndexes: [], faultNote: '' }
}

function isStepReadyForReview(step: PmcsStep, answer?: PmcsStepAnswer) {
  if (!answer?.outcome) {
    return false
  }

  if (answer.outcome === 'complete') {
    return step.checkItems.every((_, index) => answer.checkedCheckIndexes.includes(index))
  }

  if (answer.outcome === 'fault') {
    return answer.faultNote.trim().length > 0
  }

  return step.isConditionallyApplicable
}

export function PmcsPage({ companyName, platoon, vehicle, onChangeVehicle }: PmcsPageProps) {
  const [interval, setInterval] = useState<PmcsInterval>('weekly')
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [answersByChecklist, setAnswersByChecklist] = useState<AnswersByChecklist>({})
  const [isReviewing, setIsReviewing] = useState(false)
  const [submission, setSubmission] = useState<PmcsSubmission | null>(null)

  const vehicleLabel = getVehicleTypeLabel(vehicle.type)
  const checklistResolution = useMemo(
    () => getPmcsChecklistForVehicle(vehicle.type, interval),
    [interval, vehicle.type],
  )

  if (checklistResolution.status === 'template-pending') {
    return (
      <div className="mx-auto w-full max-w-[860px] px-4 py-8 sm:px-5 sm:py-12">
        <section className="border-y border-line py-8 text-left sm:py-10">
          <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-warning">Checklist needed</p>
          <h1 className="mt-2 text-[clamp(28px,5vw,40px)] font-semibold tracking-[-0.04em] text-ink">
            {vehicleLabel} template pending
          </h1>
          <p className="mt-3 text-sm text-muted">
            {vehicle.bumper} &middot; {companyName} &middot; {platoon.name}
          </p>
          <p className="mt-6 border-l-2 border-warning pl-4 text-sm leading-relaxed text-muted">
            {checklistResolution.message}
          </p>
          <button
            type="button"
            className="mt-7 min-h-11 border border-accent bg-accent px-4 text-sm font-extrabold text-black transition hover:bg-[#82bd8f] focus:outline-none focus-visible:ring-3 focus-visible:ring-selected focus-visible:ring-offset-3 focus-visible:ring-offset-surface"
            onClick={onChangeVehicle}
          >
            Change vehicle
          </button>
        </section>
      </div>
    )
  }

  const checklist = checklistResolution.checklist
  const answers = answersByChecklist[checklist.id] ?? {}
  const currentStep = checklist.steps[currentStepIndex]
  const currentAnswer = currentStep ? answers[currentStep.id] : undefined
  const completedStepCount = checklist.steps.filter((step) =>
    isStepReadyForReview(step, answers[step.id]),
  ).length
  const allStepsReady = checklist.steps.every((step) => isStepReadyForReview(step, answers[step.id]))
  const isFirstStep = currentStepIndex === 0
  const isLastStep = currentStepIndex === checklist.steps.length - 1
  const progress = checklist.steps.length > 0 ? ((currentStepIndex + 1) / checklist.steps.length) * 100 : 0

  function replaceCurrentAnswer(update: (answer: PmcsStepAnswer) => PmcsStepAnswer) {
    if (!currentStep) {
      return
    }

    setAnswersByChecklist((previousAnswersByChecklist) => {
      const checklistAnswers = previousAnswersByChecklist[checklist.id] ?? {}
      const existingAnswer = checklistAnswers[currentStep.id] ?? createEmptyAnswer()

      return {
        ...previousAnswersByChecklist,
        [checklist.id]: {
          ...checklistAnswers,
          [currentStep.id]: update(existingAnswer),
        },
      }
    })
    setSubmission(null)
  }

  function toggleCheck(checkIndex: number) {
    replaceCurrentAnswer((answer) => {
      const isChecked = answer.checkedCheckIndexes.includes(checkIndex)
      const checkedCheckIndexes = isChecked
        ? answer.checkedCheckIndexes.filter((index) => index !== checkIndex)
        : [...answer.checkedCheckIndexes, checkIndex]
      const allChecksCompleted = currentStep.checkItems.every((_, index) =>
        checkedCheckIndexes.includes(index),
      )
      const outcome =
        allChecksCompleted && (answer.outcome === undefined || answer.outcome === 'complete')
          ? 'complete'
          : !allChecksCompleted && answer.outcome === 'complete'
            ? undefined
            : answer.outcome

      return { ...answer, checkedCheckIndexes, outcome }
    })
  }

  function setOutcome(outcome: PmcsOutcome) {
    if (outcome === 'not-applicable' && !currentStep?.isConditionallyApplicable) {
      return
    }

    replaceCurrentAnswer((answer) => ({
      ...answer,
      outcome,
      faultNote: outcome === 'fault' ? answer.faultNote : '',
    }))
  }

  function setFaultNote(faultNote: string) {
    replaceCurrentAnswer((answer) => ({ ...answer, faultNote }))
  }

  function clearException() {
    if (!currentStep) {
      return
    }

    replaceCurrentAnswer((answer) => {
      const allChecksCompleted = currentStep.checkItems.every((_, index) =>
        answer.checkedCheckIndexes.includes(index),
      )

      return {
        ...answer,
        outcome: allChecksCompleted ? 'complete' : undefined,
        faultNote: '',
      }
    })
  }

  function selectInterval(nextInterval: PmcsInterval) {
    setInterval(nextInterval)
    setCurrentStepIndex(0)
    setIsReviewing(false)
    setSubmission(null)
  }

  function moveToNextStep() {
    if (!currentStep || !isStepReadyForReview(currentStep, currentAnswer)) {
      return
    }

    if (isLastStep) {
      if (allStepsReady) {
        setIsReviewing(true)
      }
      return
    }

    setCurrentStepIndex((stepIndex) => stepIndex + 1)
  }

  if (submission) {
    return (
      <div className="mx-auto w-full max-w-[860px] px-4 py-8 sm:px-5 sm:py-12">
        <section className="border-y border-selected/60 py-8 text-left sm:py-10">
          <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-selected">Local prototype</p>
          <h1 className="mt-2 text-[clamp(28px,5vw,40px)] font-semibold tracking-[-0.04em] text-ink">
            Review prepared
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            {vehicle.bumper} &middot; {vehicleLabel} &middot; {checklist.intervalLabel} &middot; {submission.operatorName}
          </p>
          <p className="mt-2 text-xs text-muted">{new Date(submission.attestedAt).toLocaleString()}</p>
          <p className="mt-5 border-l-2 border-selected pl-4 text-sm font-semibold text-ink">
            Not submitted or saved.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              className="min-h-11 border border-line bg-black px-4 text-sm font-extrabold text-ink transition hover:border-selected/60 focus:outline-none focus-visible:ring-3 focus-visible:ring-selected focus-visible:ring-offset-3 focus-visible:ring-offset-surface"
              onClick={() => {
                setSubmission(null)
                setIsReviewing(true)
              }}
            >
              View summary
            </button>
            <button
              type="button"
              className="min-h-11 border border-accent bg-accent px-4 text-sm font-extrabold text-black transition hover:bg-[#82bd8f] focus:outline-none focus-visible:ring-3 focus-visible:ring-selected focus-visible:ring-offset-3 focus-visible:ring-offset-surface"
              onClick={onChangeVehicle}
            >
              Inspect another vehicle
            </button>
          </div>
        </section>
      </div>
    )
  }

  if (isReviewing) {
    return (
      <PmcsReviewPage
        companyName={companyName}
        platoon={platoon}
        vehicle={vehicle}
        checklist={checklist}
        answers={answers}
        onReturnToChecklist={() => setIsReviewing(false)}
        onChangeVehicle={onChangeVehicle}
        onSubmit={(nextSubmission) => setSubmission(nextSubmission)}
      />
    )
  }

  if (!currentStep) {
    return (
      <div className="mx-auto w-full max-w-[860px] px-4 py-8 sm:px-5 sm:py-12">
        <section className="border-y border-line py-8 text-left sm:py-10">
          <h1 className="text-3xl font-semibold text-ink">Checklist unavailable</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            No applicable steps were found for this vehicle and interval.
          </p>
          <button
            type="button"
            className="mt-6 min-h-11 border border-accent bg-accent px-4 text-sm font-extrabold text-black transition hover:bg-[#82bd8f] focus:outline-none focus-visible:ring-3 focus-visible:ring-selected focus-visible:ring-offset-3 focus-visible:ring-offset-surface"
            onClick={onChangeVehicle}
          >
            Change vehicle
          </button>
        </section>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-[1040px] px-4 py-6 sm:px-5 sm:py-8">
      <button
        type="button"
        className="inline-flex min-h-10 items-center gap-2 border-b border-transparent text-sm font-extrabold text-muted transition hover:border-selected hover:text-ink focus:outline-none focus-visible:ring-3 focus-visible:ring-selected focus-visible:ring-offset-3 focus-visible:ring-offset-surface"
        onClick={onChangeVehicle}
      >
        <span aria-hidden="true">&larr;</span> Vehicles
      </button>

      <header className="mt-4 border-y border-line py-5 sm:flex sm:items-end sm:justify-between sm:gap-6">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-muted">Vehicle</p>
          <h1 className="mt-1 text-[clamp(32px,5vw,44px)] font-semibold tracking-[-0.045em] text-ink">
            {vehicle.bumper}
          </h1>
          <p className="mt-1 text-[15px] text-muted">
            {vehicleLabel} &middot; {companyName} &middot; {platoon.name}
          </p>
        </div>
        <dl className="mt-5 grid grid-cols-2 gap-x-8 border-t border-line pt-4 text-sm sm:mt-0 sm:min-w-[340px] sm:border-t-0 sm:pt-0">
          <div>
            <dt className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-muted">TM</dt>
            <dd className="mt-1 font-semibold text-ink">{checklist.technicalManual.number}</dd>
          </div>
          <div>
            <dt className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-muted">Interval</dt>
            <dd className="mt-1 font-semibold text-ink">{checklist.intervalLabel}</dd>
          </div>
        </dl>
      </header>

      <section className="border-b border-line py-5" aria-labelledby="interval-heading">
        <div className="flex items-baseline justify-between gap-4">
          <h2 id="interval-heading" className="text-sm font-extrabold uppercase tracking-[0.1em] text-ink">
            Inspection interval
          </h2>
          <span className="text-sm text-muted">{checklist.steps.length} items</span>
        </div>
        <div className="mt-3 grid grid-cols-2 border-y border-line sm:grid-cols-5" aria-label="PMCS intervals">
          {pmcsIntervals.map((availableInterval) => {
            const isSelected = interval === availableInterval

            return (
              <button
                key={availableInterval}
                type="button"
                aria-pressed={isSelected}
                className={`min-h-11 border-b-2 px-3 text-sm font-extrabold transition focus:outline-none focus-visible:ring-3 focus-visible:ring-selected focus-visible:ring-offset-2 focus-visible:ring-offset-surface sm:border-b-0 sm:border-r sm:last:border-r-0 ${
                  isSelected
                    ? 'border-selected bg-selected-soft text-ink'
                    : 'border-transparent bg-transparent text-muted hover:bg-panel-raised hover:text-ink'
                }`}
                onClick={() => selectInterval(availableInterval)}
              >
                {pmcsIntervalLabels[availableInterval]}
              </button>
            )
          })}
        </div>
      </section>

      <details className="border-b border-line py-3 text-sm text-muted">
        <summary className="cursor-pointer font-extrabold text-ink">TM guidance and leak limits</summary>
        <div className="mt-4 grid gap-5 lg:grid-cols-2">
          <div className="border-l-2 border-selected pl-4">
            <p className="leading-relaxed">{checklist.sourceNotice}</p>
            <p className="mt-3 text-xs text-muted">{checklist.technicalManual.workPackage}</p>
            <ul className="mt-4 list-disc space-y-2 pl-5 leading-relaxed">
              {checklist.useRules.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>
          </div>
          <div className="border-l border-line pl-4 leading-relaxed">
            <p>
              <strong className="text-ink">Class I:</strong> {checklist.leakClassification.classI}
            </p>
            <p className="mt-2">
              <strong className="text-ink">Class II:</strong> {checklist.leakClassification.classII}
            </p>
            <p className="mt-2">
              <strong className="text-ink">Class III:</strong> {checklist.leakClassification.classIII}
            </p>
            <p className="mt-3 font-semibold text-ink">{checklist.leakClassification.operatingRule}</p>
          </div>
        </div>
      </details>

      <section className="border-b border-line py-5" aria-label="PMCS progress">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-selected">{checklist.intervalLabel}</p>
            <h2 className="mt-1 text-[24px] font-semibold tracking-[-0.03em] text-ink">
              Item {currentStepIndex + 1} / {checklist.steps.length}
            </h2>
          </div>
          <span className="text-right text-sm font-bold text-muted">{completedStepCount} complete</span>
        </div>
        <div
          className="mt-4 h-1.5 overflow-hidden bg-line"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={checklist.steps.length}
          aria-valuenow={currentStepIndex + 1}
          aria-label={`Item ${currentStepIndex + 1} of ${checklist.steps.length}`}
        >
          <div className="h-full bg-accent transition-[width] duration-200" style={{ width: `${progress}%` }} />
        </div>
      </section>

      <div className="mt-6">
        <PmcsStepCard
          step={currentStep}
          answer={currentAnswer}
          onToggleCheck={toggleCheck}
          onOutcomeChange={setOutcome}
          onFaultNoteChange={setFaultNote}
          onClearException={clearException}
        />
      </div>

      <footer className="sticky bottom-0 z-10 -mx-4 mt-6 border-t border-line bg-surface px-4 py-3 sm:-mx-5 sm:px-5">
        <div className="mx-auto flex max-w-[1040px] items-center justify-between gap-4">
          <button
            type="button"
            className="min-h-11 border border-line bg-black px-4 text-sm font-extrabold text-ink transition hover:border-selected/60 disabled:cursor-not-allowed disabled:border-line/50 disabled:text-muted/45 focus:outline-none focus-visible:ring-3 focus-visible:ring-selected focus-visible:ring-offset-3 focus-visible:ring-offset-surface"
            disabled={isFirstStep}
            onClick={() => setCurrentStepIndex((stepIndex) => Math.max(0, stepIndex - 1))}
          >
            &larr; Previous
          </button>
          <button
            type="button"
            className="min-h-11 border border-accent bg-accent px-5 text-sm font-extrabold text-black transition hover:bg-[#82bd8f] disabled:cursor-not-allowed disabled:border-[#313a42] disabled:bg-[#313a42] disabled:text-[#88959f] focus:outline-none focus-visible:ring-3 focus-visible:ring-selected focus-visible:ring-offset-3 focus-visible:ring-offset-surface"
            disabled={!isStepReadyForReview(currentStep, currentAnswer) || (isLastStep && !allStepsReady)}
            onClick={moveToNextStep}
          >
            {isLastStep ? 'Review record' : 'Next item'} {!isLastStep && <span>&rarr;</span>}
          </button>
        </div>
      </footer>
    </div>
  )
}

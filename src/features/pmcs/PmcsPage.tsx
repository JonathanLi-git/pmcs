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
      <div className="mx-auto w-full max-w-[820px] px-4 py-8 sm:px-5 sm:py-12">
        <section className="rounded-2xl border border-[#d9cf9e] bg-[#fffbed] p-6 text-center shadow-[0_12px_26px_rgba(40,54,31,0.06)] sm:p-9">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#7c6719]">
            Checklist source needed
          </p>
          <h1 className="font-display mt-2 text-[clamp(30px,5vw,42px)] leading-tight font-semibold tracking-[-0.05em] text-ink">
            {vehicleLabel} PMCS template pending
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-[#675b2d]">
            {vehicle.bumper} &middot; {companyName} &middot; {platoon.name}
          </p>
          <p className="mt-5 rounded-xl border border-[#e2d49b] bg-white/75 p-4 text-sm leading-relaxed text-[#665921]">
            {checklistResolution.message}
          </p>
          <p className="mt-4 text-sm leading-relaxed text-[#6c643d]">
            The app intentionally will not display HMMWV PMCS instructions for an LMTV.
          </p>
          <button
            type="button"
            className="mt-6 min-h-11 rounded-lg bg-[#405c2f] px-4 text-sm font-extrabold text-white transition hover:bg-[#314922] focus:outline-none focus-visible:ring-3 focus-visible:ring-[#a5c848] focus-visible:ring-offset-3"
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

    replaceCurrentAnswer((answer) => ({ ...answer, outcome }))
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
      <div className="mx-auto w-full max-w-[820px] px-4 py-8 sm:px-5 sm:py-12">
        <section className="rounded-2xl border border-[#bbd29f] bg-[#f3f9ea] p-6 text-center shadow-[0_12px_26px_rgba(40,54,31,0.06)] sm:p-9">
          <span className="mx-auto grid size-12 place-items-center rounded-full bg-[#dcecc7] text-2xl text-[#40602d]" aria-hidden="true">
            &check;
          </span>
          <p className="mt-5 text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#5a7541]">
            Operator verification recorded
          </p>
          <h1 className="font-display mt-2 text-[clamp(30px,5vw,42px)] leading-tight font-semibold tracking-[-0.05em] text-ink">
            Ready for supervisor review
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-[#4e6541]">
            {vehicle.bumper} &middot; {vehicleLabel} &middot; {checklist.intervalLabel} &middot; Signed by{' '}
            {submission.operatorName} at {new Date(submission.attestedAt).toLocaleString()}.
          </p>
          <p className="mt-4 rounded-xl border border-[#cedebd] bg-white/70 p-4 text-sm leading-relaxed text-[#5c6c53]">
            This browser prototype does not yet persist or transmit the record. The future backend should store this
            signed inspection and route it to the supervisor queue.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              type="button"
              className="min-h-11 rounded-lg border border-[#aabc91] bg-white px-4 text-sm font-extrabold text-[#425c30] transition hover:border-[#829f63] focus:outline-none focus-visible:ring-3 focus-visible:ring-[#a5c848] focus-visible:ring-offset-3"
              onClick={() => {
                setSubmission(null)
                setIsReviewing(true)
              }}
            >
              View signed summary
            </button>
            <button
              type="button"
              className="min-h-11 rounded-lg bg-[#405c2f] px-4 text-sm font-extrabold text-white transition hover:bg-[#314922] focus:outline-none focus-visible:ring-3 focus-visible:ring-[#a5c848] focus-visible:ring-offset-3"
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
      <div className="mx-auto w-full max-w-[820px] px-4 py-8 sm:px-5 sm:py-12">
        <section className="rounded-2xl border border-[#e4c7b5] bg-[#fff8f3] p-6 text-center">
          <h1 className="font-display text-3xl font-semibold text-ink">Checklist unavailable</h1>
          <p className="mt-3 text-sm leading-relaxed text-[#6b5549]">
            No applicable steps were found for this vehicle type and interval. Confirm the selected vehicle and
            checklist source before continuing.
          </p>
          <button
            type="button"
            className="mt-5 min-h-11 rounded-lg bg-[#405c2f] px-4 text-sm font-extrabold text-white transition hover:bg-[#314922]"
            onClick={onChangeVehicle}
          >
            Change vehicle
          </button>
        </section>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-[1040px] px-4 py-7 sm:px-5 sm:py-10">
      <button
        type="button"
        className="inline-flex min-h-10 items-center gap-2 text-sm font-extrabold text-[#466034] transition hover:text-[#314922] focus:outline-none focus-visible:ring-3 focus-visible:ring-[#a5c848] focus-visible:ring-offset-3"
        onClick={onChangeVehicle}
      >
        <span aria-hidden="true">&larr;</span> Change vehicle
      </button>

      <section className="mt-5 rounded-2xl border border-[#cfd8bf] bg-[#f9fbf2] p-5 text-left sm:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#68735e]">PMCS in progress</p>
            <h1 className="font-display mt-2 text-[clamp(32px,5vw,46px)] leading-none font-semibold tracking-[-0.055em] text-ink">
              {vehicle.bumper} <span className="text-[#617452]">&middot;</span> {vehicleLabel}
            </h1>
            <p className="mt-3 text-[15px] text-[#68735e]">
              {companyName} &middot; {platoon.name} &middot; Roster type {vehicleLabel}
            </p>
          </div>

          <div className="rounded-xl border border-[#d7dfc8] bg-white px-4 py-3 lg:min-w-56">
            <span className="block text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#68735e]">
              TM reference
            </span>
            <strong className="mt-1 block text-sm text-ink">
              {checklist.technicalManual.number} &middot; {checklist.technicalManual.workPackage}
            </strong>
            <span className="mt-1 block text-xs text-[#68735e]">{checklist.technicalManual.edition}</span>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-[#ead59c] bg-[#fff7dc] p-4 text-sm leading-relaxed text-[#72520b]">
          <strong>Source context:</strong> {checklist.sourceNotice}
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-[#d8decd] bg-white p-4 sm:p-5" aria-labelledby="interval-heading">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#68735e]">Checklist interval</p>
            <h2 id="interval-heading" className="font-display mt-1 text-[25px] font-semibold tracking-[-0.035em] text-ink">
              Choose the inspection interval
            </h2>
          </div>
          <span className="text-sm font-bold text-[#637259]">
            {checklist.steps.length} applicable items for {vehicleLabel}
          </span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5" role="tablist" aria-label="PMCS intervals">
          {pmcsIntervals.map((availableInterval) => {
            const isSelected = interval === availableInterval

            return (
              <button
                key={availableInterval}
                type="button"
                role="tab"
                aria-selected={isSelected}
                className={`min-h-11 rounded-lg border px-3 text-sm font-extrabold transition focus:outline-none focus-visible:ring-3 focus-visible:ring-[#a5c848] focus-visible:ring-offset-2 ${
                  isSelected
                    ? 'border-[#5f7d43] bg-[#496737] text-white shadow-[0_3px_8px_rgba(52,79,35,0.18)]'
                    : 'border-[#d4dcc8] bg-[#fbfcf8] text-[#53614b] hover:border-[#9cad87]'
                }`}
                onClick={() => selectInterval(availableInterval)}
              >
                {pmcsIntervalLabels[availableInterval]}
              </button>
            )
          })}
        </div>
      </section>

      <details className="mt-4 rounded-xl border border-[#d8decd] bg-[#fbfcf8] px-4 py-3 text-sm text-[#56634e]">
        <summary className="cursor-pointer font-extrabold text-[#42513a]">Checklist guidance and leak reference</summary>
        <div className="mt-4 grid gap-5 lg:grid-cols-2">
          <ul className="list-disc space-y-2 pl-5 leading-relaxed">
            {checklist.useRules.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
          <div className="rounded-lg border border-[#d9e2cd] bg-white p-3 leading-relaxed">
            <p>
              <strong>Class I:</strong> {checklist.leakClassification.classI}
            </p>
            <p className="mt-2">
              <strong>Class II:</strong> {checklist.leakClassification.classII}
            </p>
            <p className="mt-2">
              <strong>Class III:</strong> {checklist.leakClassification.classIII}
            </p>
            <p className="mt-3 font-semibold text-[#4f623f]">{checklist.leakClassification.operatingRule}</p>
          </div>
        </div>
      </details>

      <section className="mt-8" aria-label="PMCS progress">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#68735e]">
              {checklist.intervalLabel} &middot; Item {currentStepIndex + 1} of {checklist.steps.length}
            </p>
            <h2 className="font-display mt-1 text-[25px] font-semibold tracking-[-0.03em] text-ink">
              {completedStepCount} of {checklist.steps.length} ready for review
            </h2>
          </div>
          <span className="text-right text-sm font-bold text-[#5a6851]">
            {currentStep.sourceTable ? `${currentStep.sourceTable} · ` : ''}TM item {currentStep.tmItemNo}
          </span>
        </div>
        <div
          className="mt-4 h-2 overflow-hidden rounded-full bg-[#dfe6d2]"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={checklist.steps.length}
          aria-valuenow={currentStepIndex + 1}
          aria-label={`Item ${currentStepIndex + 1} of ${checklist.steps.length}`}
        >
          <div
            className="h-full rounded-full bg-[#627c41] transition-[width] duration-200"
            style={{ width: `${progress}%` }}
          />
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

      <section className="mt-5 flex items-center justify-between gap-4 rounded-2xl border border-[#d8decd] bg-[#fcfdf8] p-4 shadow-[0_8px_20px_rgba(42,54,34,0.05)]">
        <button
          type="button"
          className="min-h-11 rounded-lg border border-[#cfd7c3] bg-white px-4 text-sm font-extrabold text-[#44523d] transition hover:border-[#98a67b] disabled:cursor-not-allowed disabled:border-[#e0e4da] disabled:text-[#9aa391] focus:outline-none focus-visible:ring-3 focus-visible:ring-[#a5c848] focus-visible:ring-offset-3"
          disabled={isFirstStep}
          onClick={() => setCurrentStepIndex((stepIndex) => Math.max(0, stepIndex - 1))}
        >
          &larr; Previous
        </button>
        <button
          type="button"
          className="min-h-11 rounded-lg bg-[#405c2f] px-4 text-sm font-extrabold text-white shadow-[0_4px_10px_rgba(39,59,28,0.2)] transition hover:-translate-y-0.5 hover:bg-[#314922] disabled:cursor-not-allowed disabled:bg-[#e0e4da] disabled:text-[#839077] disabled:shadow-none focus:outline-none focus-visible:ring-3 focus-visible:ring-[#a5c848] focus-visible:ring-offset-3"
          disabled={!isStepReadyForReview(currentStep, currentAnswer) || (isLastStep && !allStepsReady)}
          onClick={moveToNextStep}
        >
          {isLastStep ? 'Review virtual 5988' : 'Save and next'} {!isLastStep && <span>&rarr;</span>}
        </button>
      </section>
    </div>
  )
}

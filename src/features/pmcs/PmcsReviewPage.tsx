import { useState } from 'react'
import { getVehicleTypeLabel } from '../../types/fleet'
import type { Platoon, Vehicle } from '../../types/fleet'
import type { PmcsChecklist, PmcsDraftAnswers, PmcsSubmission } from '../../types/pmcs'

interface PmcsReviewPageProps {
  companyName: string
  platoon: Platoon
  vehicle: Vehicle
  checklist: PmcsChecklist
  answers: PmcsDraftAnswers
  onReturnToChecklist: () => void
  onChangeVehicle: () => void
  onSubmit: (submission: PmcsSubmission) => void
}

export function PmcsReviewPage({
  companyName,
  platoon,
  vehicle,
  checklist,
  answers,
  onReturnToChecklist,
  onChangeVehicle,
  onSubmit,
}: PmcsReviewPageProps) {
  const [operatorName, setOperatorName] = useState('')
  const [hasAttested, setHasAttested] = useState(false)
  const vehicleLabel = getVehicleTypeLabel(vehicle.type)
  const completedCount = checklist.steps.filter((step) => answers[step.id]?.outcome === 'complete').length
  const notApplicableCount = checklist.steps.filter(
    (step) => answers[step.id]?.outcome === 'not-applicable',
  ).length
  const faultSteps = checklist.steps.filter((step) => answers[step.id]?.outcome === 'fault')
  const canSubmit = operatorName.trim().length > 0 && hasAttested

  function submitReview(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!canSubmit) {
      return
    }

    onSubmit({
      operatorName: operatorName.trim(),
      attestedAt: new Date().toISOString(),
      status: 'awaiting-supervisor-review',
    })
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-9">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
        <button
          type="button"
          className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-muted transition hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-selected focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
          onClick={onReturnToChecklist}
        >
          <span aria-hidden="true">&larr;</span> Back to checklist
        </button>
        <button
          type="button"
          className="min-h-10 border border-line px-3.5 text-sm font-semibold text-ink transition hover:border-selected hover:bg-panel focus:outline-none focus-visible:ring-2 focus-visible:ring-selected focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
          onClick={onChangeVehicle}
        >
          Change vehicle
        </button>
      </div>

      <header className="border-b border-line py-6 sm:py-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-selected">PMCS record</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <h1 className="text-3xl font-semibold tracking-[-0.035em] text-ink sm:text-4xl">Inspection review</h1>
          <span className="font-mono text-xs text-muted">{checklist.technicalManual.number}</span>
        </div>

        <dl className="mt-6 grid gap-x-8 gap-y-4 border-t border-line pt-5 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted">Vehicle</dt>
            <dd className="mt-1 font-semibold text-ink">{vehicle.bumper}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted">Model</dt>
            <dd className="mt-1 font-semibold text-ink">{vehicleLabel}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted">Unit</dt>
            <dd className="mt-1 font-semibold text-ink">{platoon.name}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted">Interval</dt>
            <dd className="mt-1 font-semibold text-ink">{checklist.intervalLabel}</dd>
          </div>
        </dl>

        <p className="mt-5 border-l-2 border-selected pl-3 text-sm text-muted">
          <span className="text-accent">{completedCount} complete</span> <span aria-hidden="true">&middot;</span>{' '}
          <span className="text-fault">{faultSteps.length} faults</span> <span aria-hidden="true">&middot;</span>{' '}
          {notApplicableCount} N/A
        </p>

        <details className="mt-5 border-t border-line pt-4 text-sm text-muted">
          <summary className="cursor-pointer font-semibold text-ink">Prototype notice</summary>
          <div className="mt-3 space-y-2 leading-relaxed">
            <p>This virtual 5988-style prototype does not create an official DA Form 5988-E or maintenance-system record.</p>
            <p>
              {companyName} <span aria-hidden="true">&middot;</span> {checklist.technicalManual.workPackage}
            </p>
          </div>
        </details>
      </header>

      <section className="py-7 sm:py-9" aria-labelledby="faults-heading">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-fault">Maintenance record</p>
            <h2 id="faults-heading" className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-ink">
              Reported faults
            </h2>
          </div>
          <span className="text-sm text-muted">
            {faultSteps.length === 1 ? '1 entry' : `${faultSteps.length} entries`}
          </span>
        </div>

        {faultSteps.length === 0 ? (
          <p className="mt-5 border-y border-line py-4 text-sm text-muted">No faults reported for this inspection.</p>
        ) : (
          <div className="mt-5 border-y border-line">
            <div className="hidden grid-cols-[minmax(10rem,0.8fr)_minmax(14rem,1.2fr)_minmax(16rem,2fr)] gap-5 border-b border-line bg-panel-raised px-4 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-muted md:grid">
              <span>TM reference</span>
              <span>Item</span>
              <span>Fault description</span>
            </div>
            {faultSteps.map((step) => {
              const answer = answers[step.id]

              return (
                <article
                  key={step.id}
                  className="grid gap-3 border-b border-line px-0 py-5 last:border-b-0 md:grid-cols-[minmax(10rem,0.8fr)_minmax(14rem,1.2fr)_minmax(16rem,2fr)] md:gap-5 md:px-4"
                >
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted md:hidden">TM reference</p>
                    <p className="mt-1 font-mono text-xs leading-relaxed text-fault md:mt-0">
                      {step.sourceTable && <>{step.sourceTable} &middot; </>}Item {step.tmItemNo}
                    </p>
                    <p className="mt-1 text-xs text-muted">{checklist.intervalLabel}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted md:hidden">Item</p>
                    <h3 className="mt-1 text-sm font-semibold leading-relaxed text-ink md:mt-0">{step.item}</h3>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted md:hidden">Fault description</p>
                    <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-ink md:mt-0">
                      {answer?.faultNote || 'No fault detail entered.'}
                    </p>
                    <details className="mt-3 text-sm text-muted">
                      <summary className="cursor-pointer font-semibold text-muted hover:text-ink">Not-ready reference</summary>
                      {step.notReadyIf.length > 0 ? (
                        <ul className="mt-3 list-disc space-y-1.5 pl-5 leading-relaxed">
                          {step.notReadyIf.map((condition) => (
                            <li key={condition}>{condition}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-3 leading-relaxed">No specific not-ready condition is listed in this checklist.</p>
                      )}
                    </details>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>

      <section className="border-t border-line py-7 sm:py-9" aria-labelledby="verify-heading">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-selected">Operator verification</p>
        <h2 id="verify-heading" className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-ink">
          Sign for review
        </h2>

        <form className="mt-5 max-w-2xl border border-line bg-panel p-4 sm:p-5" onSubmit={submitReview}>
          <label className="grid gap-2 text-sm font-semibold text-ink">
            Typed name
            <input
              className="min-h-11 border border-line bg-black px-3 text-ink outline-none transition placeholder:text-muted/70 focus:border-selected focus:ring-2 focus:ring-selected/35"
              value={operatorName}
              onChange={(event) => setOperatorName(event.target.value)}
              autoComplete="name"
              placeholder="First and last name"
            />
          </label>

          <label className="mt-4 flex cursor-pointer items-start gap-3 border-t border-line pt-4 text-sm leading-relaxed text-ink focus-within:outline-none focus-within:ring-2 focus-within:ring-selected focus-within:ring-offset-2 focus-within:ring-offset-panel">
            <input
              type="checkbox"
              className="mt-0.5 size-5 shrink-0 accent-accent"
              checked={hasAttested}
              onChange={(event) => setHasAttested(event.target.checked)}
            />
            <span>I verify these inspection responses and reported faults for this vehicle.</span>
          </label>

          <div className="mt-5 flex flex-col gap-3 border-t border-line pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted">
              Status: <span className="font-semibold text-selected">awaiting supervisor review</span>
            </p>
            <button
              type="submit"
              className="min-h-11 bg-accent px-5 text-sm font-semibold text-black transition hover:bg-[#82bd8f] disabled:cursor-not-allowed disabled:bg-[#313a42] disabled:text-[#88959f] focus:outline-none focus-visible:ring-2 focus-visible:ring-selected focus-visible:ring-offset-2 focus-visible:ring-offset-panel"
              disabled={!canSubmit}
            >
              Sign for review
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

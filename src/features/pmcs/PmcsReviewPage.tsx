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
    <div className="mx-auto w-full max-w-[1040px] px-4 py-7 sm:px-5 sm:py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          className="inline-flex min-h-10 items-center gap-2 text-sm font-extrabold text-[#466034] transition hover:text-[#314922] focus:outline-none focus-visible:ring-3 focus-visible:ring-[#a5c848] focus-visible:ring-offset-3"
          onClick={onReturnToChecklist}
        >
          <span aria-hidden="true">&larr;</span> Return to checklist
        </button>
        <button
          type="button"
          className="min-h-10 rounded-lg border border-[#cfd7c3] bg-white px-3.5 text-sm font-extrabold text-[#4e5d46] transition hover:border-[#9eae89] focus:outline-none focus-visible:ring-3 focus-visible:ring-[#a5c848] focus-visible:ring-offset-3"
          onClick={onChangeVehicle}
        >
          Change vehicle
        </button>
      </div>

      <section className="mt-6 rounded-2xl border border-[#cfd8bf] bg-[#f9fbf2] p-5 sm:p-7">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#68735e]">Inspection review</p>
        <h1 className="font-display mt-2 text-[clamp(31px,5vw,46px)] leading-none font-semibold tracking-[-0.055em] text-ink">
          Virtual 5988-style summary
        </h1>
        <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-[#5e6b56]">
          {vehicle.bumper} &middot; {vehicleLabel} &middot; {checklist.intervalLabel} &middot;{' '}
          {companyName}, {platoon.name}
        </p>
        <div className="mt-5 rounded-xl border border-[#ead59c] bg-[#fff7dc] p-4 text-sm leading-relaxed text-[#72520b]">
          <strong>Prototype record only:</strong> This is not an official DA Form 5988-E and this screen does not
          create a CAC/PKI signature. Verify the current authenticated TM and use the approved maintenance system for
          operational records.
        </div>
      </section>

      <section className="mt-7 grid gap-3 sm:grid-cols-3" aria-label="Inspection result counts">
        <div className="rounded-xl border border-[#cbdab8] bg-[#f4f9eb] p-4">
          <span className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#62794b]">No fault found</span>
          <strong className="mt-1 block text-3xl tracking-[-0.05em] text-[#38542a]">{completedCount}</strong>
        </div>
        <div className="rounded-xl border border-[#e6b9ad] bg-[#fff2ee] p-4">
          <span className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#97503c]">Faults reported</span>
          <strong className="mt-1 block text-3xl tracking-[-0.05em] text-[#8a4030]">{faultSteps.length}</strong>
        </div>
        <div className="rounded-xl border border-[#d3dbca] bg-[#f6f8f2] p-4">
          <span className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#68765f]">Not applicable</span>
          <strong className="mt-1 block text-3xl tracking-[-0.05em] text-[#53604d]">{notApplicableCount}</strong>
        </div>
      </section>

      <section className="mt-7 rounded-2xl border border-[#d8decd] bg-white p-5 sm:p-7" aria-labelledby="faults-heading">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#68735e]">Review details</p>
            <h2 id="faults-heading" className="font-display mt-1 text-[28px] font-semibold tracking-[-0.04em] text-ink">
              Reported faults
            </h2>
          </div>
          <span className="rounded-md bg-[#f0f3ea] px-2.5 py-1 text-xs font-extrabold text-[#617054]">
            {checklist.technicalManual.number} &middot; {checklist.technicalManual.workPackage}
          </span>
        </div>

        {faultSteps.length === 0 ? (
          <p className="mt-5 rounded-xl border border-[#cbdab8] bg-[#f5f9ed] p-4 text-sm leading-relaxed text-[#456038]">
            No faults were reported in this {checklist.intervalLabel.toLowerCase()} checklist.
          </p>
        ) : (
          <div className="mt-5 space-y-4">
            {faultSteps.map((step) => {
              const answer = answers[step.id]

              return (
                <article key={step.id} className="rounded-xl border border-[#e4bbae] bg-[#fff9f7] p-4 sm:p-5">
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#965440]">
                    {step.sourceTable ? `${step.sourceTable} · ` : ''}TM item {step.tmItemNo} &middot;{' '}
                    {checklist.intervalLabel}
                  </p>
                  <h3 className="mt-1 text-lg font-extrabold text-[#552d25]">{step.item}</h3>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-[#64392f]">{answer?.faultNote}</p>

                  <div className="mt-4 border-t border-[#efcec6] pt-4">
                    <p className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#8b513f]">
                      Source not-ready reference
                    </p>
                    {step.notReadyIf.length > 0 ? (
                      <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-[#6d4439]">
                        {step.notReadyIf.map((condition) => (
                          <li key={condition}>{condition}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-2 text-sm leading-relaxed text-[#6d4439]">
                        The supplied checklist lists no specific not-ready condition for this item.
                      </p>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>

      <section className="mt-7 rounded-2xl border border-[#ccd8bc] bg-[#f8fbf2] p-5 sm:p-7" aria-labelledby="verify-heading">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#60784a]">Operator verification</p>
        <h2 id="verify-heading" className="font-display mt-1 text-[28px] font-semibold tracking-[-0.04em] text-ink">
          Verify and sign this prototype record
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[#5b6a53]">
          Your typed name and acknowledgement create a prototype attestation only. A production version can connect
          this step to the approved identity, signature, and maintenance-record workflow.
        </p>

        <form className="mt-5 space-y-4" onSubmit={submitReview}>
          <label className="grid max-w-xl gap-2 text-sm font-extrabold text-[#3f4f37]">
            Type your name
            <input
              className="min-h-11 rounded-lg border border-[#bdcdb0] bg-white px-3 font-normal text-ink outline-none transition placeholder:text-[#98a08f] focus:border-[#75935a] focus:ring-3 focus:ring-[#c5dda8]"
              value={operatorName}
              onChange={(event) => setOperatorName(event.target.value)}
              autoComplete="name"
              placeholder="First and last name"
            />
          </label>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#c9d8b9] bg-white p-4 text-sm leading-relaxed text-[#44533d] focus-within:ring-3 focus-within:ring-[#a5c848] focus-within:ring-offset-2">
            <input
              type="checkbox"
              className="mt-0.5 size-5 shrink-0 accent-[#456331]"
              checked={hasAttested}
              onChange={(event) => setHasAttested(event.target.checked)}
            />
            <span>
              I verify that this summary accurately represents my inspection responses and reported faults for this
              vehicle.
            </span>
          </label>

          <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-semibold text-[#63745a]">
              Status after signing: <span className="text-[#415d30]">awaiting supervisor review</span>
            </p>
            <button
              type="submit"
              className="min-h-11 rounded-lg bg-[#405c2f] px-5 text-sm font-extrabold text-white shadow-[0_4px_10px_rgba(39,59,28,0.2)] transition hover:-translate-y-0.5 hover:bg-[#314922] disabled:cursor-not-allowed disabled:bg-[#dce2d5] disabled:text-[#8b9784] disabled:shadow-none focus:outline-none focus-visible:ring-3 focus-visible:ring-[#a5c848] focus-visible:ring-offset-3"
              disabled={!canSubmit}
            >
              Sign and mark ready for review
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

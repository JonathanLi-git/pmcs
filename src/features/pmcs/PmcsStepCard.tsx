import type { PmcsOutcome, PmcsStep, PmcsStepAnswer } from '../../types/pmcs'

interface PmcsStepCardProps {
  step: PmcsStep
  answer?: PmcsStepAnswer
  onToggleCheck: (checkIndex: number) => void
  onOutcomeChange: (outcome: PmcsOutcome) => void
  onFaultNoteChange: (faultNote: string) => void
  onClearException: () => void
}

function formatConditionKey(condition: string) {
  return condition.replaceAll('_', ' ')
}

export function PmcsStepCard({
  step,
  answer,
  onToggleCheck,
  onOutcomeChange,
  onFaultNoteChange,
  onClearException,
}: PmcsStepCardProps) {
  const checkedCheckIndexes = answer?.checkedCheckIndexes ?? []
  const checkedCount = checkedCheckIndexes.filter((index) => index < step.checkItems.length).length
  const hasSerialConditions = Object.keys(step.serialConditions).length > 0
  const hasFault = answer?.outcome === 'fault'
  const isNotApplicable = answer?.outcome === 'not-applicable'
  const isComplete = answer?.outcome === 'complete'

  return (
    <article className="border border-line bg-panel">
      <header className="border-b-2 border-accent-strong bg-panel-raised px-5 py-4 sm:px-7 sm:py-5">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-bold uppercase tracking-[0.1em]">
          <span className="text-accent">TM item {step.tmItemNo}</span>
          {step.sourceTable && <span className="border-l border-line pl-3 text-muted">{step.sourceTable}</span>}
          {step.isConditionallyApplicable && <span className="border-l border-line pl-3 text-muted">Conditional</span>}
        </div>
        <h3 className="mt-2 text-xl font-bold leading-tight tracking-tight text-ink sm:text-2xl">{step.item}</h3>
      </header>

      {step.isConditionallyApplicable && (
        <aside className="border-b border-line px-5 py-3 text-sm leading-relaxed text-muted sm:px-7">
          <strong className="font-bold text-ink">Conditional item.</strong>{' '}
          {step.applicabilityNote
            ? `Applies when ${step.applicabilityNote}.`
            : 'Applies only when the applicable equipment or configuration is present.'}
        </aside>
      )}

      <div className="px-5 sm:px-7">
        <section className="py-5" aria-labelledby={`${step.id}-checks`}>
          <div className="flex items-baseline justify-between gap-4">
            <h4 id={`${step.id}-checks`} className="text-sm font-bold uppercase tracking-[0.08em] text-ink">
              Inspection checks
            </h4>
            <span className="shrink-0 text-sm tabular-nums text-muted">
              {checkedCount} of {step.checkItems.length}
            </span>
          </div>

          {step.checkItems.length > 0 ? (
            <div className="mt-3 border-y border-line">
              {step.checkItems.map((check, checkIndex) => {
                const isChecked = checkedCheckIndexes.includes(checkIndex)

                return (
                  <label
                    key={`${step.id}-check-${checkIndex}`}
                    className={`grid cursor-pointer grid-cols-[1.35rem_1fr] items-start gap-3 border-b border-line px-1 py-4 text-sm leading-relaxed transition last:border-b-0 focus-within:outline focus-within:outline-2 focus-within:outline-offset-[-2px] focus-within:outline-accent ${
                      isChecked ? 'bg-accent-soft/55 text-ink' : 'text-ink hover:bg-panel-raised/70'
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="mt-0.5 size-5 shrink-0 accent-accent"
                      checked={isChecked}
                      onChange={() => onToggleCheck(checkIndex)}
                    />
                    <span>
                      <span className="mr-2 text-[11px] font-bold tracking-[0.08em] text-muted">{checkIndex + 1}.</span>
                      {check}
                    </span>
                  </label>
                )
              })}
            </div>
          ) : (
            <p className="mt-3 border-y border-dashed border-line py-4 text-sm leading-relaxed text-muted">
              No individual check-off line is supplied for this item. Follow the current TM.
            </p>
          )}
        </section>

        <div className="border-t border-line">
          {hasSerialConditions && (
            <details className="border-b border-line py-3 text-sm text-muted">
              <summary className="cursor-pointer font-bold text-ink">Serial-number guidance</summary>
              <ul className="mt-3 space-y-2 leading-relaxed">
                {Object.entries(step.serialConditions).map(([condition, guidance]) => (
                  <li key={condition}>
                    <strong className="capitalize text-ink">{formatConditionKey(condition)}:</strong> {guidance}
                  </li>
                ))}
              </ul>
            </details>
          )}

          {step.warnings.length > 0 && (
            <section className="border-b border-line py-4" aria-label="Warnings">
              <p className="border-l-2 border-accent-strong pl-3 text-[11px] font-bold uppercase tracking-[0.1em] text-accent">
                Warnings
              </p>
              <ul className="mt-2 list-disc space-y-1.5 pl-8 text-sm leading-relaxed text-ink">
                {step.warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            </section>
          )}

          {step.notes.length > 0 && (
            <details className="border-b border-line py-3 text-sm text-muted">
              <summary className="cursor-pointer font-bold text-ink">Notes</summary>
              <ul className="mt-3 list-disc space-y-1.5 pl-5 leading-relaxed">
                {step.notes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </details>
          )}

          {!hasFault && step.notReadyIf.length > 0 && (
            <details className="border-b border-line py-3 text-sm text-muted">
              <summary className="cursor-pointer font-bold text-ink">Not-ready conditions</summary>
              <ul className="mt-3 list-disc space-y-1.5 pl-5 leading-relaxed">
                {step.notReadyIf.map((condition) => (
                  <li key={condition}>{condition}</li>
                ))}
              </ul>
            </details>
          )}
        </div>
      </div>

      <section className="border-t border-line bg-black/20 px-5 py-5 sm:px-7" aria-labelledby={`${step.id}-result`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h4 id={`${step.id}-result`} className="text-sm font-bold uppercase tracking-[0.08em] text-ink">
            Item status
          </h4>
          {isComplete && <span className="text-sm font-bold text-accent">Complete</span>}
        </div>

        <div className="mt-3 border-y border-line">
          <button
            type="button"
            aria-pressed={hasFault}
            className={`flex w-full items-center justify-between gap-4 border-b border-line px-1 py-4 text-left text-sm transition focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-accent ${
              hasFault ? 'bg-accent-soft/55 text-ink' : 'text-ink hover:bg-panel-raised/70'
            }`}
            onClick={() => {
              if (hasFault) {
                onClearException()
                return
              }

              onOutcomeChange('fault')
            }}
          >
            <span>
              <strong className="font-bold">Report fault</strong>
              {hasFault && <span className="ml-2 text-muted">Selected — tap again to clear.</span>}
            </span>
            <span
              className={`grid size-5 shrink-0 place-items-center border text-xs font-bold ${hasFault ? 'border-accent bg-accent text-black' : 'border-accent text-accent'}`}
              aria-hidden="true"
            >
              !
            </span>
          </button>

          {step.isConditionallyApplicable && (
            <button
              type="button"
              aria-pressed={isNotApplicable}
              className={`flex w-full items-center justify-between gap-4 px-1 py-4 text-left text-sm transition focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-accent ${
                isNotApplicable ? 'bg-accent-soft/55 text-ink' : 'text-ink hover:bg-panel-raised/70'
              }`}
              onClick={() => {
                if (isNotApplicable) {
                  onClearException()
                  return
                }

                onOutcomeChange('not-applicable')
              }}
            >
              <span>
                <strong className="font-bold">Not applicable</strong>
                {isNotApplicable && <span className="ml-2 text-muted">Selected — tap again to clear.</span>}
              </span>
              <span
                className={`grid size-5 shrink-0 place-items-center border text-xs font-bold ${isNotApplicable ? 'border-accent bg-accent text-black' : 'border-accent text-accent'}`}
                aria-hidden="true"
              >
                {isNotApplicable ? <>&check;</> : <>&minus;</>}
              </span>
            </button>
          )}
        </div>

        {hasFault && (
          <div className="mt-4 border-l-4 border-accent-strong bg-panel-raised px-4 py-4">
            <label className="grid gap-2 text-sm font-bold text-ink">
              Fault details <span className="font-normal text-muted">(required)</span>
              <textarea
                className="min-h-28 w-full resize-y border border-line bg-black/30 p-3 font-normal leading-relaxed text-ink outline-none transition placeholder:text-muted/70 focus:border-accent focus:ring-2 focus:ring-accent/35"
                value={answer?.faultNote ?? ''}
                onChange={(event) => onFaultNoteChange(event.target.value)}
                placeholder="Location, condition, and impact."
              />
            </label>

            <details className="mt-4 border-t border-line pt-3 text-sm text-muted" open>
              <summary className="cursor-pointer font-bold text-ink">Not-ready reference</summary>
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
        )}
      </section>
    </article>
  )
}

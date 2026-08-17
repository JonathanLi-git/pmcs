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
  const allChecksCompleted = step.checkItems.every((_, index) =>
    checkedCheckIndexes.includes(index),
  )
  const hasSerialConditions = Object.keys(step.serialConditions).length > 0

  return (
    <article className="overflow-hidden rounded-2xl border border-[#d7ddcd] bg-white shadow-[0_12px_26px_rgba(40,54,31,0.06)]">
      <header className="border-b border-[#e3e8da] bg-[#f7f9f1] px-5 py-5 sm:px-7 sm:py-6">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="rounded-md bg-[#e2ebcd] px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-[0.09em] text-[#4a6234]">
            TM item {step.tmItemNo}
          </span>
          {step.sourceTable && (
            <span className="rounded-md bg-[#edf1e6] px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-[0.09em] text-[#5f7051]">
              {step.sourceTable}
            </span>
          )}
          {step.isConditionallyApplicable && (
            <span className="rounded-md bg-[#fff2c9] px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-[0.09em] text-[#7b5a0d]">
              Configuration dependent
            </span>
          )}
        </div>
        <h3 className="font-display mt-3 text-[clamp(25px,4vw,34px)] leading-[1.08] font-semibold tracking-[-0.04em] text-ink">
          {step.item}
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-[#68735e]">
          Check off each required action below. If you find a fault, select <strong>Report a fault</strong>{' '}
          and record what you observed.
        </p>
      </header>

      <div className="space-y-6 p-5 sm:p-7">
        {step.isConditionallyApplicable && (
          <aside className="rounded-xl border border-[#e4d69e] bg-[#fff9e6] p-4 text-sm leading-relaxed text-[#695512]">
            <strong>Conditional item:</strong>{' '}
            {step.applicabilityNote
              ? `This item applies when ${step.applicabilityNote}.`
              : 'This item may depend on installed equipment, vehicle variant, or serial number.'}{' '}
            Select N/A only when the item truly does not apply.
          </aside>
        )}

        <section aria-labelledby={`${step.id}-checks`}>
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#66725f]">
                Required checks
              </p>
              <h4 id={`${step.id}-checks`} className="mt-1 text-base font-extrabold text-ink">
                Perform each action, then check it off
              </h4>
            </div>
            <span className="text-sm font-bold text-[#64745a]">
              {checkedCheckIndexes.filter((index) => index < step.checkItems.length).length} of{' '}
              {step.checkItems.length}
            </span>
          </div>

          {step.checkItems.length > 0 ? (
            <div className="mt-4 space-y-3">
              {step.checkItems.map((check, checkIndex) => {
                const isChecked = checkedCheckIndexes.includes(checkIndex)

                return (
                  <label
                    key={`${step.id}-check-${checkIndex}`}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 text-sm leading-relaxed transition focus-within:ring-3 focus-within:ring-[#a5c848] focus-within:ring-offset-2 ${
                      isChecked
                        ? 'border-[#a9be8a] bg-[#f4f8eb] text-[#354929]'
                        : 'border-[#dde3d3] bg-[#fdfefb] text-[#374135] hover:border-[#b3c196]'
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="mt-0.5 size-5 shrink-0 accent-[#456331]"
                      checked={isChecked}
                      onChange={() => onToggleCheck(checkIndex)}
                    />
                    <span>
                      <span className="mr-2 inline-block text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#708064]">
                        {checkIndex + 1}
                      </span>
                      {check}
                    </span>
                  </label>
                )
              })}
            </div>
          ) : (
            <p className="mt-4 rounded-xl border border-dashed border-[#ccd7bc] bg-[#f9fbf4] p-4 text-sm text-[#66725f]">
              The supplied checklist has no discrete check-off line for this item. Use the current TM to complete it.
            </p>
          )}
        </section>

        {hasSerialConditions && (
          <section className="rounded-xl border border-[#cbdab8] bg-[#f5f9ed] p-4" aria-label="Serial number guidance">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#59723e]">
              Serial-number guidance
            </p>
            <ul className="mt-2 space-y-2 text-sm leading-relaxed text-[#405538]">
              {Object.entries(step.serialConditions).map(([condition, guidance]) => (
                <li key={condition}>
                  <strong className="capitalize">{formatConditionKey(condition)}:</strong> {guidance}
                </li>
              ))}
            </ul>
          </section>
        )}

        {step.warnings.length > 0 && (
          <section className="rounded-xl border border-[#eac77a] bg-[#fff6d9] p-4" aria-label="Warnings">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#84620e]">Warnings</p>
            <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-[#715610]">
              {step.warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          </section>
        )}

        {step.notes.length > 0 && (
          <section className="rounded-xl border border-[#d6dfca] bg-[#f8faf4] p-4" aria-label="Notes">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#617054]">Notes</p>
            <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-[#52604d]">
              {step.notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </section>
        )}

        {step.notReadyIf.length > 0 && (
          <details className="rounded-xl border border-[#ead5ca] bg-[#fffaf8] px-4 py-3 text-sm text-[#66483f]">
            <summary className="cursor-pointer font-extrabold text-[#754435]">
              When this item can make the vehicle not ready
            </summary>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 leading-relaxed">
              {step.notReadyIf.map((condition) => (
                <li key={condition}>{condition}</li>
              ))}
            </ul>
          </details>
        )}

        <section className="border-t border-[#e5e9dd] pt-6" aria-labelledby={`${step.id}-result`}>
          <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#66725f]">Inspection result</p>
          <h4 id={`${step.id}-result`} className="mt-1 text-base font-extrabold text-ink">
            Report only exceptions
          </h4>

          {answer?.outcome === 'complete' && (
            <div className="mt-4 flex items-start gap-3 rounded-xl border border-[#bbd49a] bg-[#f4f9eb] p-4 text-sm text-[#355127]" role="status">
              <span className="grid size-5 shrink-0 place-items-center rounded-full bg-[#55783a] text-xs font-extrabold text-white" aria-hidden="true">
                &check;
              </span>
              <span>
                <strong className="block">No fault found automatically</strong>
                <span className="mt-0.5 block leading-relaxed">
                  Every required check is complete. Report a fault below only if you observed one.
                </span>
              </span>
            </div>
          )}

          <div className="mt-4 grid gap-3">
            <label
              className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 text-sm transition ${
                answer?.outcome === 'fault'
                  ? 'border-[#d5a697] bg-[#fff3ef] text-[#6c3426]'
                  : 'border-[#e1c7bf] bg-white text-[#673c31] hover:border-[#cb9889]'
              }`}
            >
              <input
                type="radio"
                name={`${step.id}-outcome`}
                className="mt-0.5 size-5 shrink-0 accent-[#a34a35]"
                checked={answer?.outcome === 'fault'}
                onChange={() => onOutcomeChange('fault')}
              />
              <span>
                <strong className="block">Report a fault</strong>
                <span className="mt-0.5 block leading-relaxed">
                  Document the condition so it is included in the virtual 5988-style summary.
                </span>
              </span>
            </label>

            {step.isConditionallyApplicable && (
              <label
                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 text-sm transition ${
                  answer?.outcome === 'not-applicable'
                    ? 'border-[#bac5aa] bg-[#f4f6ef] text-[#43523b]'
                    : 'border-[#d8dfce] bg-white text-[#4c5946] hover:border-[#aebc9c]'
                }`}
              >
                <input
                  type="radio"
                  name={`${step.id}-outcome`}
                  className="mt-0.5 size-5 shrink-0 accent-[#607653]"
                  checked={answer?.outcome === 'not-applicable'}
                  onChange={() => onOutcomeChange('not-applicable')}
                />
                <span>
                  <strong className="block">Not applicable</strong>
                  <span className="mt-0.5 block leading-relaxed">
                    {step.applicabilityNote
                      ? `Use only when this condition does not apply: ${step.applicabilityNote}.`
                      : 'Use only when the required equipment, variant, or serial-number condition is not present.'}
                  </span>
                </span>
              </label>
            )}
          </div>

          {(answer?.outcome === 'fault' || answer?.outcome === 'not-applicable') && (
            <button
              type="button"
              className="mt-3 text-sm font-extrabold text-[#526f38] underline decoration-[#a8bd8c] underline-offset-4 transition hover:text-[#314922] focus:outline-none focus-visible:ring-3 focus-visible:ring-[#a5c848] focus-visible:ring-offset-3"
              onClick={onClearException}
            >
              Clear this exception{allChecksCompleted ? ' and return to the automatic no-fault result' : ''}
            </button>
          )}

          {!allChecksCompleted && answer?.outcome !== 'fault' && answer?.outcome !== 'not-applicable' && (
            <p className="mt-3 text-sm font-semibold text-[#7a6a33]" role="status">
              Check off every required action. The item will be marked no fault automatically when they are complete.
            </p>
          )}

          {answer?.outcome === 'fault' && (
            <div className="mt-5 space-y-4 rounded-xl border border-[#edc9c0] bg-[#fff9f7] p-4">
              <label className="grid gap-2 text-sm font-extrabold text-[#5f352b]">
                Describe the fault <span className="font-normal text-[#8b675e]">(required)</span>
                <textarea
                  className="min-h-28 w-full resize-y rounded-lg border border-[#d8b8b0] bg-white p-3 font-normal leading-relaxed text-[#332a27] outline-none transition placeholder:text-[#9d918d] focus:border-[#aa705f] focus:ring-3 focus:ring-[#e8b5a7]"
                  value={answer.faultNote}
                  onChange={(event) => onFaultNoteChange(event.target.value)}
                  placeholder="State the location, observed condition, and any impact on operation."
                />
              </label>

              <div className="rounded-lg border border-[#ecc9bd] bg-[#fff2ed] p-3">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#8a4e3c]">
                  Source not-ready conditions
                </p>
                {step.notReadyIf.length > 0 ? (
                  <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-[#683e33]">
                    {step.notReadyIf.map((condition) => (
                      <li key={condition}>{condition}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm leading-relaxed text-[#683e33]">
                    No specific not-ready condition is listed for this item in the supplied checklist. Record the
                    fault for supervisor review.
                  </p>
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </article>
  )
}

"use client";

import { useMemo, useState } from "react";
import { DEFAULT_INPUTS, fmtUsd, solveForTarget, type DscrInputs, type LoanType } from "@/lib/dscr";
import { Field, NumberField, Segmented } from "./fields";

const TARGETS = [1.0, 1.1, 1.2, 1.25, 1.3];

export function MaxLoanCalculator() {
  const [i, setI] = useState<DscrInputs>(DEFAULT_INPUTS);
  const [target, setTarget] = useState(1.25);
  const set = <K extends keyof DscrInputs>(k: K) => (v: DscrInputs[K]) => setI((p) => ({ ...p, [k]: v }));

  const r = useMemo(() => solveForTarget(i, target), [i, target]);
  const ladder = useMemo(() => TARGETS.map((t) => ({ t, ...solveForTarget(i, t) })), [i]);
  const downNeeded = Math.max(0, i.purchasePrice - r.maxLoan);
  const pitiaCap = i.monthlyRent / Math.max(0.01, target);

  return (
    <div id="calculator" className="text-ink">
      <div className="grid grid-cols-[1fr_400px] gap-6 max-[960px]:grid-cols-1">
        <div className="flex flex-col gap-5 border border-rule bg-card p-6 max-[600px]:p-4">
          <fieldset className="border-0 p-0">
            <legend className="mb-3 font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-brass">Property</legend>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 max-[480px]:grid-cols-1">
              <NumberField id="rent" label="Monthly rent" prefix="$" value={i.monthlyRent} onChange={set("monthlyRent")} step={50} />
              <NumberField id="price" label="Purchase price" prefix="$" value={i.purchasePrice} onChange={set("purchasePrice")} step={5000} />
              <NumberField id="tax" label="Property taxes / yr" prefix="$" value={i.annualTaxes} onChange={set("annualTaxes")} step={100} />
              <NumberField id="ins" label="Insurance / yr" prefix="$" value={i.annualInsurance} onChange={set("annualInsurance")} step={50} />
              <NumberField id="hoa" label="HOA dues / mo" prefix="$" value={i.monthlyHoa} onChange={set("monthlyHoa")} step={10} />
              <NumberField id="down" label="Your planned down payment" suffix="%" value={i.downPaymentPct} onChange={set("downPaymentPct")} />
            </div>
          </fieldset>
          <fieldset className="border-0 p-0">
            <legend className="mb-3 font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-brass">Loan terms</legend>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 max-[480px]:grid-cols-1">
              <NumberField id="rate" label="Interest rate" suffix="%" value={i.interestRate} onChange={set("interestRate")} step={0.125} />
              <NumberField id="term" label="Term (years)" value={i.termYears} onChange={set("termYears")} step={5} />
              <NumberField id="target" label="Lender's target DSCR" value={target} onChange={setTarget} step={0.05} />
              <Field id="type" label="Payment type">
                <Segmented<LoanType>
                  id="type"
                  value={i.loanType}
                  onChange={set("loanType")}
                  options={[
                    { value: "amortizing", label: "Amortizing" },
                    { value: "interestOnly", label: "Interest-only" },
                  ]}
                />
              </Field>
            </div>
          </fieldset>
        </div>

        <div className="flex flex-col gap-4 max-[960px]:order-first min-[961px]:sticky min-[961px]:top-24 min-[961px]:self-start">
          <div className="border border-brass/40 bg-card p-6">
            <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-slate">Maximum loan at {target.toFixed(2)} DSCR</div>
            <output aria-live="polite" className="block text-[48px] font-extrabold leading-none tracking-[-0.03em] text-ink tabular-nums">
              {fmtUsd(r.maxLoan)}
            </output>
            <p className="mt-2 text-[12px] leading-[1.5] text-slate">
              Rent {fmtUsd(i.monthlyRent)} ÷ {target.toFixed(2)} allows a PITIA of up to {fmtUsd(pitiaCap)} a month.
            </p>
            <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-rule pt-4 text-[13px]">
              <div>
                <dt className="text-[11px] text-slate">Max price at {i.downPaymentPct}% down</dt>
                <dd className="text-[17px] font-bold tabular-nums">{fmtUsd(r.maxPrice)}</dd>
              </div>
              <div>
                <dt className="text-[11px] text-slate">Down needed at {fmtUsd(i.purchasePrice)}</dt>
                <dd className="text-[17px] font-bold tabular-nums">
                  {fmtUsd(downNeeded)}{" "}
                  <span className="text-[12px] font-normal text-slate">
                    ({i.purchasePrice > 0 ? Math.round((downNeeded / i.purchasePrice) * 100) : 0}%)
                  </span>
                </dd>
              </div>
            </dl>
          </div>
          <div className="border border-rule bg-card p-5">
            <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-brass">Max loan by DSCR requirement</div>
            <table className="w-full text-[13px] tabular-nums">
              <tbody>
                {ladder.map((row) => (
                  <tr key={row.t} className={row.t === target ? "font-bold" : ""}>
                    <td className="py-1 text-slate">{row.t.toFixed(2)} DSCR</td>
                    <td className="py-1 text-right text-ink">{fmtUsd(row.maxLoan)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import {
  DEFAULT_INPUTS,
  bandOf,
  calculate,
  dscrOf,
  fmtDscr,
  fmtPct,
  fmtUsd,
  solveForTarget,
  type DscrInputs,
  type DscrMethod,
  type FeeType,
  type LoanPurpose,
  type LoanType,
} from "@/lib/dscr";
import { APP_STORE_URL } from "@/lib/site";
import { Field, NumberField, Segmented } from "./fields";

/** URL keys for shareable results — short so links stay readable. */
const PARAMS: Record<keyof DscrInputs, string> = {
  monthlyRent: "rent",
  vacancyPct: "vac",
  managementPct: "mgmt",
  annualTaxes: "tax",
  annualInsurance: "ins",
  annualFloodInsurance: "flood",
  monthlyHoa: "hoa",
  purchasePrice: "price",
  downPaymentPct: "down",
  interestRate: "rate",
  termYears: "term",
  loanType: "type",
  purpose: "purpose",
  currentLoanBalance: "bal",
  originationFee: "orig",
  originationFeeType: "origtype",
  loanFees: "lfees",
  titleFees: "title",
  escrow: "escrow",
  prepaidInterest: "ppint",
  prepaidInsurance: "ppins",
  paymentReserve: "reserve",
};
/** Non-numeric inputs and how they serialize. */
const ENUMS: Partial<Record<keyof DscrInputs, [string, string, string, string]>> = {
  // key: [short A, value A, short B, value B]
  loanType: ["am", "amortizing", "io", "interestOnly"],
  purpose: ["buy", "purchase", "refi", "refinance"],
  originationFeeType: ["usd", "fixed", "pct", "percent"],
};

const TERMS = [15, 20, 25, 30, 40];
const BAND_STYLE = {
  below: { ring: "border-red-300", bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
  breakeven: { ring: "border-amber-300", bg: "bg-amber-50", text: "text-amber-800", dot: "bg-amber-500" },
  qualifies: { ring: "border-emerald-200", bg: "bg-emerald-50", text: "text-emerald-800", dot: "bg-emerald-500" },
  strong: { ring: "border-emerald-300", bg: "bg-emerald-50", text: "text-emerald-800", dot: "bg-emerald-600" },
} as const;

export function DscrCalculator({ initialMode = "dscr" }: { initialMode?: "dscr" | "maxLoan" }) {
  const [inp, setInp] = useState<DscrInputs>(DEFAULT_INPUTS);
  const [method, setMethod] = useState<DscrMethod>("lender");
  const [target, setTarget] = useState(1.25);
  const [copied, setCopied] = useState(false);
  const [feesOpen, setFeesOpen] = useState(false);

  // Hydrate from a shared link (client only, so the server HTML always shows defaults).
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    if (![...q.keys()].length) return;
    setInp((prev) => {
      const next = { ...prev };
      for (const [key, param] of Object.entries(PARAMS) as [keyof DscrInputs, string][]) {
        const raw = q.get(param);
        if (raw == null) continue;
        const e = ENUMS[key];
        if (e) {
          (next[key] as string) = raw === e[2] ? e[3] : e[1];
        } else {
          const v = Number(raw);
          if (Number.isFinite(v)) (next[key] as number) = v;
        }
      }
      return next;
    });
    if (q.get("method") === "noi") setMethod("noi");
    const t = Number(q.get("target"));
    if (Number.isFinite(t) && t > 0) setTarget(t);
  }, []);

  const set = <K extends keyof DscrInputs>(k: K, v: DscrInputs[K]) => setInp((p) => ({ ...p, [k]: v }));

  const r = useMemo(() => calculate(inp), [inp]);
  const isRefi = inp.purpose === "refinance";
  const dscr = dscrOf(r, method);
  const band = bandOf(dscr);
  const style = BAND_STYLE[band.key];

  const io = useMemo(() => calculate({ ...inp, loanType: "interestOnly" }), [inp]);
  const amort = useMemo(() => calculate({ ...inp, loanType: "amortizing" }), [inp]);
  const reverse = useMemo(() => solveForTarget(inp, target), [inp, target]);

  // Heavier table renders off the deferred value so typing stays responsive.
  const deferred = useDeferredValue(inp);
  const grid = useMemo(() => {
    const rates = [-1, -0.5, 0, 0.5, 1].map((d) => Math.max(0, +(deferred.interestRate + d).toFixed(3)));
    const downs = [15, 20, 25, 30];
    return {
      rates,
      downs,
      cells: downs.map((dp) =>
        rates.map((rate) => calculate({ ...deferred, interestRate: rate, downPaymentPct: dp }).lenderDscr),
      ),
    };
  }, [deferred]);

  function shareUrl() {
    const q = new URLSearchParams();
    for (const [key, param] of Object.entries(PARAMS) as [keyof DscrInputs, string][]) {
      const v = inp[key];
      const e = ENUMS[key];
      q.set(param, e ? (v === e[3] ? e[2] : e[0]) : String(v));
    }
    if (method === "noi") q.set("method", "noi");
    if (target !== 1.25) q.set("target", String(target));
    return `${window.location.origin}${window.location.pathname}?${q.toString()}`;
  }

  async function copyLink() {
    const url = shareUrl();
    window.history.replaceState(null, "", url);
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked — the URL bar already holds the link */
    }
  }

  return (
    <div id="calculator" className="dscr-calc text-ink">
      <div className="grid grid-cols-[1fr_400px] gap-6 max-[960px]:grid-cols-1">
        {/* ─────────────── Inputs ─────────────── */}
        <div className="flex flex-col gap-5 border border-rule bg-card p-6 max-[600px]:p-4">
          <Group title="Rental income">
            <NumberField id="rent" label="Monthly rent" prefix="$" value={inp.monthlyRent} onChange={(v) => set("monthlyRent", v)} step={50} hint="Lease or appraiser's market rent" />
            <NumberField id="vac" label="Vacancy" suffix="%" value={inp.vacancyPct} onChange={(v) => set("vacancyPct", v)} step={1} hint="Used for NOI and cash flow" />
            <NumberField id="mgmt" label="Property management" suffix="%" value={inp.managementPct} onChange={(v) => set("managementPct", v)} step={1} hint="Of collected rent" />
          </Group>

          <Group title="Property expenses">
            <NumberField id="tax" label="Property taxes / yr" prefix="$" value={inp.annualTaxes} onChange={(v) => set("annualTaxes", v)} step={100} />
            <NumberField id="ins" label="Insurance / yr" prefix="$" value={inp.annualInsurance} onChange={(v) => set("annualInsurance", v)} step={50} />
            <NumberField id="flood" label="Flood insurance / yr" prefix="$" value={inp.annualFloodInsurance} onChange={(v) => set("annualFloodInsurance", v)} step={50} />
            <NumberField id="hoa" label="HOA dues / mo" prefix="$" value={inp.monthlyHoa} onChange={(v) => set("monthlyHoa", v)} step={10} />
          </Group>

          <Group title="Loan">
            <Field id="purpose" label="Loan purpose" wide>
              <Segmented<LoanPurpose>
                id="purpose"
                value={inp.purpose}
                onChange={(v) => set("purpose", v)}
                options={[
                  { value: "purchase", label: "Purchase" },
                  { value: "refinance", label: "Refinance" },
                ]}
              />
            </Field>
            <NumberField id="price" label={isRefi ? "Property value" : "Purchase price"} prefix="$" value={inp.purchasePrice} onChange={(v) => set("purchasePrice", v)} step={5000} />
            {isRefi ? (
              <NumberField id="ltv" label="Loan-to-value" suffix="%" value={+(100 - inp.downPaymentPct).toFixed(2)} onChange={(v) => set("downPaymentPct", 100 - v)} step={1} hint={`New loan ${fmtUsd(r.loanAmount)}`} />
            ) : (
              <NumberField id="down" label="Down payment" suffix="%" value={inp.downPaymentPct} onChange={(v) => set("downPaymentPct", v)} step={1} hint={`Loan amount ${fmtUsd(r.loanAmount)} · ${fmtPct(r.ltvPct, 0)} LTV`} />
            )}
            {isRefi && (
              <NumberField id="bal" label="Current loan balance" prefix="$" value={inp.currentLoanBalance} onChange={(v) => set("currentLoanBalance", v)} step={1000} hint="Paid off at closing" />
            )}
            <NumberField id="rate" label="Interest rate" suffix="%" value={inp.interestRate} onChange={(v) => set("interestRate", v)} step={0.125} />
            <Field id="term" label="Term">
              <select
                id="term"
                value={inp.termYears}
                onChange={(e) => set("termYears", Number(e.target.value))}
                className="input"
              >
                {TERMS.map((t) => (
                  <option key={t} value={t}>
                    {t} years
                  </option>
                ))}
              </select>
            </Field>
            <Field id="type" label="Payment type" wide>
              <Segmented<LoanType>
                id="type"
                value={inp.loanType}
                onChange={(v) => set("loanType", v)}
                options={[
                  { value: "amortizing", label: "Amortizing" },
                  { value: "interestOnly", label: "Interest-only" },
                ]}
              />
            </Field>
          </Group>

          <details className="group border-t border-rule pt-4" open={feesOpen} onToggle={(e) => setFeesOpen((e.target as HTMLDetailsElement).open)}>
            <summary className="flex cursor-pointer list-none items-center justify-between font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-brass">
              <span>Closing costs · {fmtUsd(r.totalFees)}</span>
              <span aria-hidden className="text-[14px] transition-transform group-open:rotate-45">+</span>
            </summary>
            <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 max-[480px]:grid-cols-1">
              <NumberField
                id="orig"
                label="Origination fee"
                prefix={inp.originationFeeType === "fixed" ? "$" : undefined}
                suffix={inp.originationFeeType === "percent" ? "% of loan" : undefined}
                value={inp.originationFee}
                onChange={(v) => set("originationFee", v)}
                step={inp.originationFeeType === "percent" ? 0.25 : 100}
                hint={inp.originationFeeType === "percent" ? `= ${fmtUsd(r.originationFeeAmount)}` : undefined}
              />
              <Field id="origtype" label="Origination fee as">
                <Segmented<FeeType>
                  id="origtype"
                  value={inp.originationFeeType}
                  onChange={(v) => set("originationFeeType", v)}
                  options={[
                    { value: "fixed", label: "$ amount" },
                    { value: "percent", label: "% of loan" },
                  ]}
                />
              </Field>
              <NumberField id="lfees" label="Loan fees" prefix="$" value={inp.loanFees} onChange={(v) => set("loanFees", v)} step={100} hint="Underwriting, processing, appraisal" />
              <NumberField id="title" label="Title fees" prefix="$" value={inp.titleFees} onChange={(v) => set("titleFees", v)} step={100} />
              <NumberField id="escrow" label="Escrow" prefix="$" value={inp.escrow} onChange={(v) => set("escrow", v)} step={100} hint="Initial tax/insurance deposit" />
              <NumberField id="ppint" label="Prepaid interest" prefix="$" value={inp.prepaidInterest} onChange={(v) => set("prepaidInterest", v)} step={50} />
              <NumberField id="ppins" label="Prepaid insurance" prefix="$" value={inp.prepaidInsurance} onChange={(v) => set("prepaidInsurance", v)} step={50} />
              <NumberField id="reserve" label="Payment reserve" prefix="$" value={inp.paymentReserve} onChange={(v) => set("paymentReserve", v)} step={100} hint="Reserves the lender holds or requires" />
            </div>
          </details>
        </div>

        {/* ─────────────── Result ─────────────── */}
        <div className="flex flex-col gap-4 max-[960px]:order-first min-[961px]:sticky min-[961px]:top-24 min-[961px]:self-start">
          <div className={`border ${style.ring} bg-card p-6 max-[600px]:p-5`}>
            <Segmented<DscrMethod>
              id="method"
              value={method}
              onChange={setMethod}
              options={[
                { value: "lender", label: "Lender (rent ÷ PITIA)" },
                { value: "noi", label: "NOI ÷ debt service" },
              ]}
            />
            <div className="mt-5 flex items-end justify-between gap-4">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-slate">Your DSCR</div>
                <output
                  htmlFor="rent tax ins hoa price down rate term"
                  aria-live="polite"
                  className="block text-[64px] font-extrabold leading-none tracking-[-0.03em] text-ink tabular-nums max-[600px]:text-[52px]"
                >
                  {fmtDscr(dscr)}
                </output>
              </div>
              <div className="pb-2 text-right">
                <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-slate">Cash flow / mo</div>
                <div className={`text-[22px] font-bold tabular-nums ${r.monthlyCashFlow < 0 ? "text-red-700" : "text-ink"}`}>
                  {fmtUsd(r.monthlyCashFlow)}
                </div>
              </div>
            </div>
            <div className={`mt-4 flex gap-3 ${style.bg} p-3`}>
              <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${style.dot}`} aria-hidden />
              <p className={`text-[13px] leading-[1.55] ${style.text}`}>
                <strong className="font-bold">{band.label}.</strong> {band.meaning}
              </p>
            </div>
            <p className="mt-3 text-[12px] leading-[1.5] text-slate">
              {method === "lender"
                ? `Gross rent ${fmtUsd(inp.monthlyRent)} ÷ PITIA ${fmtUsd(r.pitia)}. This is how most DSCR lenders size 1–4 unit rental loans.`
                : `NOI ${fmtUsd(r.annualNoi)}/yr ÷ debt service ${fmtUsd(r.annualDebtService)}/yr. Subtracts vacancy, management and expenses first, so it runs lower.`}
            </p>
          </div>

          <div className="border border-rule bg-card p-5">
            <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-brass">Monthly payment (PITIA)</div>
            <Rows
              rows={[
                [inp.loanType === "interestOnly" ? "Interest (interest-only)" : "Principal & interest", fmtUsd(r.pi)],
                ["Property taxes", fmtUsd(r.monthlyTaxes)],
                ["Insurance (incl. flood)", fmtUsd(r.monthlyInsurance)],
                ["HOA", fmtUsd(r.monthlyHoa)],
              ]}
              total={["PITIA", fmtUsd(r.pitia)]}
            />
            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-rule pt-4 text-[13px]">
              <Stat label="Amortizing DSCR" value={fmtDscr(amort.lenderDscr)} active={inp.loanType === "amortizing"} />
              <Stat label="Interest-only DSCR" value={fmtDscr(io.lenderDscr)} active={inp.loanType === "interestOnly"} />
              <Stat label="Cap rate" value={fmtPct(r.capRatePct)} />
              <Stat label="Cash-on-cash" value={fmtPct(r.cashOnCashPct)} />
            </div>
          </div>

          <div className="border border-rule bg-card p-5">
            <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-brass">
              {isRefi ? "Refinance proceeds" : "Cash to close"}
            </div>
            <Rows
              rows={
                isRefi
                  ? [
                      ["New loan", fmtUsd(r.loanAmount)],
                      ["Pay off current loan", `−${fmtUsd(inp.currentLoanBalance)}`],
                      ["Closing costs", `−${fmtUsd(r.totalFees)}`],
                    ]
                  : [
                      [`Down payment (${fmtPct(r.downPaymentPct, 0)})`, fmtUsd(r.downPayment)],
                      ["Closing costs", fmtUsd(r.totalFees)],
                    ]
              }
              total={isRefi ? [r.netProceeds >= 0 ? "Cash out to you" : "Cash due at closing", fmtUsd(Math.abs(r.netProceeds))] : ["Cash invested", fmtUsd(r.cashInvested)]}
            />
            <div className="mt-3 flex justify-between gap-3 text-[13px]">
              <span className="text-slate">Liquidity to verify</span>
              <span className="font-semibold tabular-nums text-ink">{fmtUsd(r.liquidityToVerify)}</span>
            </div>
          </div>

          <a
            href={APP_STORE_URL}
            className="no-print flex items-center justify-between gap-3 bg-ink px-5 py-4 text-cream transition-colors hover:bg-ink-mid"
          >
            <span>
              <span className="block text-[14px] font-bold">Run deals on your phone with the free app</span>
              <span className="block text-[12px] text-muted">Same math, plus a lender-ready PDF you can share in a tap.</span>
            </span>
            <span aria-hidden className="text-brass-pale">→</span>
          </a>

          <div className="no-print flex gap-2">
            <button type="button" onClick={copyLink} className="btn-brass flex-1 !px-4">
              {copied ? "Link copied" : "Copy share link"}
            </button>
            <button type="button" onClick={() => window.print()} className="flex-1 border border-rule bg-card px-4 py-3 text-[12px] font-bold uppercase tracking-[0.12em] text-ink transition-colors hover:border-brass">
              Save as PDF
            </button>
          </div>
        </div>
      </div>

      {/* ─────────────── Reverse solver ─────────────── */}
      <div
        id="max-loan"
        className={`mt-6 border bg-card p-6 max-[600px]:p-4 ${initialMode === "maxLoan" ? "border-brass" : "border-rule"}`}
      >
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-[520px]">
            <h2 className="text-[20px] font-extrabold tracking-[-0.01em] text-ink">Work backwards from a target DSCR</h2>
            <p className="mt-1 text-[13px] leading-[1.6] text-slate">
              The largest loan this rent supports, the price that loan buys at your down payment, and the rent
              your current loan needs. Lender method, same rate and term as above.
            </p>
          </div>
          <div className="w-[160px]">
            <NumberField id="target" label="Target DSCR" value={target} onChange={(v) => setTarget(v)} step={0.05} />
          </div>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-3 max-[700px]:grid-cols-1">
          <Big label="Maximum loan" value={fmtUsd(reverse.maxLoan)} note={`vs ${fmtUsd(r.loanAmount)} today`} />
          <Big label="Maximum purchase price" value={fmtUsd(reverse.maxPrice)} note={`at ${fmtPct(inp.downPaymentPct, 0)} down`} />
          <Big label="Minimum rent needed" value={fmtUsd(reverse.minRent)} note={`vs ${fmtUsd(inp.monthlyRent)} today`} />
        </div>
      </div>

      {/* ─────────────── Sensitivity ─────────────── */}
      <div className="mt-6 border border-rule bg-card p-6 max-[600px]:p-4">
        <h2 className="text-[20px] font-extrabold tracking-[-0.01em] text-ink">How rate and down payment move your DSCR</h2>
        <p className="mt-1 text-[13px] leading-[1.6] text-slate">
          Lender-method DSCR for this property at nearby rates and common down payments. Shaded cells reach 1.25.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse text-[13px] tabular-nums">
            <thead>
              <tr>
                <th className="border-b border-rule p-2 text-left font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-slate">Down \ Rate</th>
                {grid.rates.map((rt) => (
                  <th key={rt} className="border-b border-rule p-2 text-right font-semibold text-ink">
                    {rt.toFixed(3).replace(/0+$/, "").replace(/\.$/, "")}%
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {grid.downs.map((dp, ri) => (
                <tr key={dp}>
                  <th scope="row" className="border-b border-rule p-2 text-left font-semibold text-ink">
                    {dp}% down
                  </th>
                  {grid.cells[ri].map((v, ci) => {
                    const current = dp === inp.downPaymentPct && ci === 2;
                    return (
                      <td
                        key={ci}
                        className={`border-b border-rule p-2 text-right ${v >= 1.25 ? "bg-emerald-50 text-emerald-900" : v < 1 ? "text-red-700" : "text-ink"} ${current ? "font-extrabold outline outline-2 -outline-offset-2 outline-brass" : ""}`}
                      >
                        {fmtDscr(v)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile sticky result */}
      <div className="no-print fixed inset-x-0 bottom-0 z-40 flex items-center justify-between border-t border-brass/30 bg-ink px-5 py-3 min-[961px]:hidden">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-brass-pale">DSCR · {method === "lender" ? "Lender" : "NOI"}</span>
        <span className="text-[22px] font-extrabold tabular-nums text-cream">{fmtDscr(dscr)}</span>
        <span className={`text-[13px] font-semibold tabular-nums ${r.monthlyCashFlow < 0 ? "text-red-300" : "text-cream/80"}`}>
          {fmtUsd(r.monthlyCashFlow)}/mo
        </span>
      </div>
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="border-0 p-0">
      <legend className="mb-3 font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-brass">{title}</legend>
      <div className="grid grid-cols-2 gap-x-4 gap-y-3 max-[480px]:grid-cols-1">{children}</div>
    </fieldset>
  );
}

function Rows({ rows, total }: { rows: [string, string][]; total: [string, string] }) {
  return (
    <dl className="flex flex-col gap-1.5 text-[13px]">
      {rows.map(([k, v]) => (
        <div key={k} className="flex justify-between gap-3">
          <dt className="text-slate">{k}</dt>
          <dd className="tabular-nums text-ink">{v}</dd>
        </div>
      ))}
      <div className="mt-1 flex justify-between gap-3 border-t border-rule pt-2 font-bold">
        <dt className="text-ink">{total[0]}</dt>
        <dd className="tabular-nums text-ink">{total[1]}</dd>
      </div>
    </dl>
  );
}

function Stat({ label, value, active }: { label: string; value: string; active?: boolean }) {
  return (
    <div>
      <div className="text-[11px] text-slate">{label}</div>
      <div className={`text-[16px] tabular-nums ${active ? "font-extrabold text-ink" : "font-semibold text-ink/80"}`}>{value}</div>
    </div>
  );
}

function Big({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="border border-rule bg-card-alt p-4">
      <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate">{label}</div>
      <div className="mt-1 text-[26px] font-extrabold tracking-[-0.02em] text-ink tabular-nums">{value}</div>
      <div className="text-[12px] text-slate">{note}</div>
    </div>
  );
}

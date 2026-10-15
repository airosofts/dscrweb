"use client";

import { useMemo, useState } from "react";
import { fmtDscr, fmtPct, fmtUsd, monthlyPI } from "@/lib/dscr";
import { NumberField } from "./fields";

type Focus = "cashflow" | "caprate" | "coc";

type In = {
  price: number;
  downPct: number;
  closingCosts: number;
  rehab: number;
  rate: number;
  term: number;
  rent: number;
  otherIncome: number;
  vacancyPct: number;
  mgmtPct: number;
  taxes: number; // annual
  insurance: number; // annual
  hoa: number; // monthly
  maintenancePct: number;
  capexPct: number;
  utilities: number; // monthly, owner-paid
};

const DEFAULTS: In = {
  price: 300000,
  downPct: 20,
  closingCosts: 9000,
  rehab: 0,
  rate: 7.5,
  term: 30,
  rent: 2500,
  otherIncome: 0,
  vacancyPct: 5,
  mgmtPct: 8,
  taxes: 3600,
  insurance: 1200,
  hoa: 0,
  maintenancePct: 5,
  capexPct: 5,
  utilities: 0,
};

export function analyze(i: In) {
  const loan = i.price * (1 - i.downPct / 100);
  const pi = monthlyPI(loan, i.rate, i.term, "amortizing");
  const gross = i.rent + i.otherIncome;
  const vacancy = gross * (i.vacancyPct / 100);
  const collected = gross - vacancy;
  const mgmt = collected * (i.mgmtPct / 100);
  const maintenance = i.rent * (i.maintenancePct / 100);
  const capex = i.rent * (i.capexPct / 100);
  const opex = mgmt + maintenance + capex + i.taxes / 12 + i.insurance / 12 + i.hoa + i.utilities;
  const noiMonthly = collected - opex;
  const cashFlow = noiMonthly - pi;
  const cashInvested = i.price - loan + i.closingCosts + i.rehab;
  const pitia = pi + i.taxes / 12 + i.insurance / 12 + i.hoa;
  return {
    loan,
    pi,
    gross,
    vacancy,
    collected,
    mgmt,
    maintenance,
    capex,
    opex,
    noiAnnual: noiMonthly * 12,
    cashFlow,
    cashFlowAnnual: cashFlow * 12,
    cashInvested,
    capRate: i.price > 0 ? ((noiMonthly * 12) / i.price) * 100 : 0,
    coc: cashInvested > 0 ? ((cashFlow * 12) / cashInvested) * 100 : 0,
    dscr: pitia > 0 ? i.rent / pitia : 0,
  };
}

export function RentalCalculator({ focus }: { focus: Focus }) {
  const [i, setI] = useState<In>(DEFAULTS);
  const set = (k: keyof In) => (v: number) => setI((p) => ({ ...p, [k]: v }));
  const a = useMemo(() => analyze(i), [i]);

  const headline =
    focus === "caprate"
      ? { label: "Cap rate", value: fmtPct(a.capRate, 2), sub: `NOI ${fmtUsd(a.noiAnnual)}/yr ÷ price ${fmtUsd(i.price)}` }
      : focus === "coc"
        ? { label: "Cash-on-cash return", value: fmtPct(a.coc, 2), sub: `${fmtUsd(a.cashFlowAnnual)}/yr ÷ ${fmtUsd(a.cashInvested)} invested` }
        : { label: "Monthly cash flow", value: fmtUsd(a.cashFlow), sub: `${fmtUsd(a.cashFlowAnnual)} per year after the mortgage` };

  return (
    <div id="calculator" className="text-ink">
      <div className="grid grid-cols-[1fr_380px] gap-6 max-[960px]:grid-cols-1">
        <div className="flex flex-col gap-5 border border-rule bg-card p-6 max-[600px]:p-4">
          <Group title="Purchase & loan">
            <NumberField id="price" label="Purchase price" prefix="$" value={i.price} onChange={set("price")} step={5000} />
            <NumberField id="down" label="Down payment" suffix="%" value={i.downPct} onChange={set("downPct")} />
            <NumberField id="closing" label="Closing costs" prefix="$" value={i.closingCosts} onChange={set("closingCosts")} step={500} />
            <NumberField id="rehab" label="Repairs / rehab" prefix="$" value={i.rehab} onChange={set("rehab")} step={500} />
            <NumberField id="rate" label="Interest rate" suffix="%" value={i.rate} onChange={set("rate")} step={0.125} />
            <NumberField id="term" label="Term (years)" value={i.term} onChange={set("term")} step={5} />
          </Group>
          <Group title="Income">
            <NumberField id="rent" label="Monthly rent" prefix="$" value={i.rent} onChange={set("rent")} step={50} />
            <NumberField id="other" label="Other income / mo" prefix="$" value={i.otherIncome} onChange={set("otherIncome")} step={25} hint="Parking, laundry, pet fees" />
            <NumberField id="vac" label="Vacancy" suffix="%" value={i.vacancyPct} onChange={set("vacancyPct")} />
            <NumberField id="mgmt" label="Management" suffix="%" value={i.mgmtPct} onChange={set("mgmtPct")} />
          </Group>
          <Group title="Operating expenses">
            <NumberField id="tax" label="Property taxes / yr" prefix="$" value={i.taxes} onChange={set("taxes")} step={100} />
            <NumberField id="ins" label="Insurance / yr" prefix="$" value={i.insurance} onChange={set("insurance")} step={50} />
            <NumberField id="hoa" label="HOA / mo" prefix="$" value={i.hoa} onChange={set("hoa")} step={10} />
            <NumberField id="util" label="Owner-paid utilities / mo" prefix="$" value={i.utilities} onChange={set("utilities")} step={10} />
            <NumberField id="maint" label="Maintenance" suffix="% of rent" value={i.maintenancePct} onChange={set("maintenancePct")} />
            <NumberField id="capex" label="CapEx reserve" suffix="% of rent" value={i.capexPct} onChange={set("capexPct")} />
          </Group>
        </div>

        <div className="flex flex-col gap-4 max-[960px]:order-first min-[961px]:sticky min-[961px]:top-24 min-[961px]:self-start">
          <div className="border border-brass/40 bg-card p-6">
            <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-slate">{headline.label}</div>
            <output aria-live="polite" className={`block text-[52px] font-extrabold leading-none tracking-[-0.03em] tabular-nums ${a.cashFlow < 0 && focus === "cashflow" ? "text-red-700" : "text-ink"}`}>
              {headline.value}
            </output>
            <p className="mt-2 text-[12px] text-slate">{headline.sub}</p>
          </div>
          <div className="border border-rule bg-card p-5 text-[13px]">
            <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-brass">Monthly breakdown</div>
            <dl className="flex flex-col gap-1.5">
              <Row k="Gross income" v={fmtUsd(a.gross)} />
              <Row k="− Vacancy" v={fmtUsd(a.vacancy)} />
              <Row k="− Operating expenses" v={fmtUsd(a.opex)} />
              <Row k="= Net operating income" v={fmtUsd(a.noiAnnual / 12)} bold />
              <Row k="− Mortgage (P&I)" v={fmtUsd(a.pi)} />
              <Row k="= Cash flow" v={fmtUsd(a.cashFlow)} bold />
            </dl>
            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-rule pt-4">
              <Mini k="Cap rate" v={fmtPct(a.capRate, 2)} />
              <Mini k="Cash-on-cash" v={fmtPct(a.coc, 2)} />
              <Mini k="DSCR (lender)" v={fmtDscr(a.dscr)} />
              <Mini k="Cash invested" v={fmtUsd(a.cashInvested)} />
            </div>
          </div>
        </div>
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
function Row({ k, v, bold }: { k: string; v: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between gap-3 ${bold ? "border-t border-rule pt-1.5 font-bold text-ink" : ""}`}>
      <dt className={bold ? "" : "text-slate"}>{k}</dt>
      <dd className="tabular-nums text-ink">{v}</dd>
    </div>
  );
}
function Mini({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <div className="text-[11px] text-slate">{k}</div>
      <div className="text-[16px] font-semibold tabular-nums text-ink">{v}</div>
    </div>
  );
}

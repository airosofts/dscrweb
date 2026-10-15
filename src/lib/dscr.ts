/**
 * DSCR math shared by every calculator on the site.
 *
 * Ported from the iOS app (dscr_calculator_app/lib/models/dscr_calculator.dart)
 * so the web and app agree. Two DSCR methods are exposed:
 *
 *   lender  — gross monthly rent ÷ PITIA. How most residential DSCR lenders
 *             size a 1–4 unit rental loan.
 *   noi     — annual net operating income ÷ annual principal + interest.
 *             The classic commercial-real-estate definition.
 *
 * The app's own DSCR subtracts the property-management fee from rent before
 * dividing by PITIA; `appDscr` reproduces that for the methodology page.
 */

export type LoanType = "amortizing" | "interestOnly";
export type DscrMethod = "lender" | "noi";

export type DscrInputs = {
  monthlyRent: number;
  vacancyPct: number; // % of gross rent
  managementPct: number; // % of collected rent
  annualTaxes: number;
  annualInsurance: number;
  annualFloodInsurance: number;
  monthlyHoa: number;
  purchasePrice: number;
  downPaymentPct: number;
  interestRate: number; // annual %, e.g. 7.5
  termYears: number;
  loanType: LoanType;
};

export const DEFAULT_INPUTS: DscrInputs = {
  monthlyRent: 2500,
  vacancyPct: 5,
  managementPct: 8,
  annualTaxes: 3600,
  annualInsurance: 1200,
  annualFloodInsurance: 0,
  monthlyHoa: 0,
  purchasePrice: 300000,
  downPaymentPct: 20,
  interestRate: 7.5,
  termYears: 30,
  loanType: "amortizing",
};

const n = (v: number) => (Number.isFinite(v) ? v : 0);

export function loanAmountOf(i: Pick<DscrInputs, "purchasePrice" | "downPaymentPct">): number {
  return Math.max(0, n(i.purchasePrice) * (1 - n(i.downPaymentPct) / 100));
}

/** Monthly principal + interest (or interest only). */
export function monthlyPI(loan: number, ratePct: number, termYears: number, type: LoanType): number {
  loan = n(loan);
  const r = n(ratePct) / 100 / 12;
  if (loan <= 0) return 0;
  if (type === "interestOnly") return loan * r;
  const months = Math.round(n(termYears) * 12);
  if (months <= 0) return 0;
  if (r === 0) return loan / months;
  const f = Math.pow(1 + r, months);
  return (loan * r * f) / (f - 1);
}

/** Inverse of monthlyPI: the loan a given monthly payment supports. */
export function loanFromPayment(payment: number, ratePct: number, termYears: number, type: LoanType): number {
  payment = n(payment);
  if (payment <= 0) return 0;
  const r = n(ratePct) / 100 / 12;
  if (type === "interestOnly") return r > 0 ? payment / r : 0;
  const months = Math.round(n(termYears) * 12);
  if (months <= 0) return 0;
  if (r === 0) return payment * months;
  const f = Math.pow(1 + r, months);
  return (payment * (f - 1)) / (r * f);
}

export type DscrResult = {
  loanAmount: number;
  ltvPct: number;
  pi: number;
  monthlyTaxes: number;
  monthlyInsurance: number;
  monthlyHoa: number;
  tia: number; // taxes + insurance + HOA
  pitia: number;
  effectiveRent: number; // rent after vacancy
  managementFee: number;
  annualNoi: number;
  annualDebtService: number;
  lenderDscr: number;
  noiDscr: number;
  appDscr: number;
  monthlyCashFlow: number;
  annualCashFlow: number;
  capRatePct: number;
  cashOnCashPct: number;
  downPayment: number;
};

export function calculate(i: DscrInputs): DscrResult {
  const loanAmount = loanAmountOf(i);
  const pi = monthlyPI(loanAmount, i.interestRate, i.termYears, i.loanType);
  const monthlyTaxes = n(i.annualTaxes) / 12;
  const monthlyInsurance = (n(i.annualInsurance) + n(i.annualFloodInsurance)) / 12;
  const monthlyHoa = n(i.monthlyHoa);
  const tia = monthlyTaxes + monthlyInsurance + monthlyHoa;
  const pitia = pi + tia;
  const rent = n(i.monthlyRent);
  const effectiveRent = rent * (1 - n(i.vacancyPct) / 100);
  const managementFee = effectiveRent * (n(i.managementPct) / 100);
  const annualNoi = (effectiveRent - managementFee - tia) * 12;
  const annualDebtService = pi * 12;
  const monthlyCashFlow = effectiveRent - managementFee - pitia;
  const downPayment = n(i.purchasePrice) - loanAmount;
  return {
    loanAmount,
    ltvPct: i.purchasePrice > 0 ? (loanAmount / i.purchasePrice) * 100 : 0,
    pi,
    monthlyTaxes,
    monthlyInsurance,
    monthlyHoa,
    tia,
    pitia,
    effectiveRent,
    managementFee,
    annualNoi,
    annualDebtService,
    lenderDscr: pitia > 0 ? rent / pitia : 0,
    noiDscr: annualDebtService > 0 ? annualNoi / annualDebtService : 0,
    appDscr: pitia > 0 ? (rent * (1 - n(i.managementPct) / 100)) / pitia : 0,
    monthlyCashFlow,
    annualCashFlow: monthlyCashFlow * 12,
    capRatePct: i.purchasePrice > 0 ? (annualNoi / i.purchasePrice) * 100 : 0,
    cashOnCashPct: downPayment > 0 ? ((monthlyCashFlow * 12) / downPayment) * 100 : 0,
    downPayment,
  };
}

export function dscrOf(r: DscrResult, method: DscrMethod): number {
  return method === "lender" ? r.lenderDscr : r.noiDscr;
}

/* ─── Reverse solver ───────────────────────────────────────────────────── */

export type ReverseResult = {
  targetDscr: number;
  maxLoan: number; // largest loan that still hits target at these terms
  maxPrice: number; // purchase price that loan supports at the current down %
  minRent: number; // rent needed for the CURRENT loan to hit target
};

/** Lender method (rent ÷ PITIA) — what DSCR lenders size loans on. */
export function solveForTarget(i: DscrInputs, targetDscr: number): ReverseResult {
  const t = Math.max(0.01, n(targetDscr));
  const r = calculate(i);
  const maxPitia = n(i.monthlyRent) / t;
  const maxPI = Math.max(0, maxPitia - r.tia);
  const maxLoan = loanFromPayment(maxPI, i.interestRate, i.termYears, i.loanType);
  const ltv = 1 - n(i.downPaymentPct) / 100;
  return {
    targetDscr: t,
    maxLoan,
    maxPrice: ltv > 0 ? maxLoan / ltv : 0,
    minRent: t * r.pitia,
  };
}

/* ─── Bands ────────────────────────────────────────────────────────────── */

export type Band = { key: "below" | "breakeven" | "qualifies" | "strong"; label: string; meaning: string };

export function bandOf(dscr: number): Band {
  if (dscr < 1)
    return {
      key: "below",
      label: "Below 1.00",
      meaning:
        "Rent doesn't cover the payment. Most DSCR programs decline this; a few \"no-ratio\" programs may still lend with a larger down payment and a higher rate.",
    };
  if (dscr < 1.2)
    return {
      key: "breakeven",
      label: "1.00 – 1.19",
      meaning:
        "Rent covers the payment with little cushion. Many lenders will approve, often with a higher rate or a lower maximum loan-to-value.",
    };
  if (dscr < 1.25)
    return {
      key: "qualifies",
      label: "1.20 – 1.24",
      meaning: "Solid coverage. This qualifies with most DSCR lenders, though some reserve their best pricing for 1.25+.",
    };
  return {
    key: "strong",
    label: "1.25 or higher",
    meaning: "Strong coverage. This meets the threshold many lenders use for their best rates and highest loan-to-value.",
  };
}

/* ─── Formatting ───────────────────────────────────────────────────────── */

const usd0 = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
export const fmtUsd = (v: number) => usd0.format(Math.round(n(v)));
export const fmtDscr = (v: number) => (n(v) > 0 ? n(v).toFixed(2) : "0.00");
export const fmtPct = (v: number, d = 1) => `${n(v).toFixed(d)}%`;

import Link from "next/link";
import { PageShell } from "@/components/seo/PageShell";
import { pageMeta } from "@/lib/meta";

const PATH = "/methodology";
export const metadata = pageMeta(
  PATH,
  "Methodology: How Our DSCR Calculations Work | DSCR Calculator Pro",
  "Every formula and assumption behind the DSCR Calculator Pro calculators: lender and NOI DSCR, payments, interest-only, max loan, cash flow, cap rate and cash-on-cash.",
);

const TOC = [
  { id: "principles", title: "Principles" },
  { id: "payment", title: "Loan payment" },
  { id: "dscr", title: "DSCR (both methods)" },
  { id: "reverse", title: "Max loan and minimum rent" },
  { id: "returns", title: "Cash flow and returns" },
  { id: "bands", title: "Result bands" },
  { id: "limits", title: "Limitations" },
];

export default function Page() {
  return (
    <PageShell
      path={PATH}
      kicker="Methodology"
      title="How We Calculate"
      lede="Every number on this site comes from the formulas below. They match the DSCR Calculator Pro iPhone app, and we publish them so you can check our work."
      toc={TOC}
      related={["/dscr-formula", "/", "/about", "/advertiser-disclosure"]}
    >
      <h2 id="principles">Principles</h2>
      <ul>
        <li>Calculations run in your browser. We don&apos;t store the deal figures you enter.</li>
        <li>Defaults describe a plausible single-family rental, not a recommendation.</li>
        <li>Market ranges in our guides (credit, down payment, reserves) are typical published ranges, not any single lender&apos;s guidelines.</li>
        <li>No advertiser can change a formula, a default or a guide. See our <Link href="/advertiser-disclosure">advertiser disclosure</Link>.</li>
      </ul>

      <h2 id="payment">Loan payment</h2>
      <p className="formula">
        Amortizing P&amp;I = L × r(1 + r)ⁿ ÷ ((1 + r)ⁿ − 1)
        <br />
        Interest-only = L × annual rate ÷ 12
        <br />
        L = price × (1 − down %) · r = annual rate ÷ 12 · n = years × 12
      </p>
      <p>
        Monthly taxes and insurance are the annual figures divided by 12; flood insurance is added to insurance. HOA is
        entered monthly. PITIA = P&amp;I + taxes + insurance + HOA.
      </p>

      <h2 id="dscr">DSCR</h2>
      <p className="formula">
        Lender method = Gross monthly rent ÷ PITIA
        <br />
        NOI method = Annual NOI ÷ (12 × P&amp;I)
        <br />
        NOI = (Rent × (1 − vacancy) × (1 − management) − taxes − insurance − HOA) × 12
      </p>
      <p>
        The lender method reflects how most residential DSCR lenders size 1–4 unit loans: gross rent, with vacancy and
        management ignored. The NOI method is the commercial definition. The iPhone app uses the lender method from
        version 1.0.4; earlier versions subtracted the management fee from rent first, which produced a lower figure.
      </p>

      <h2 id="reverse">Maximum loan and minimum rent</h2>
      <p className="formula">
        Max PITIA = Rent ÷ target DSCR
        <br />
        Max P&amp;I = Max PITIA − taxes − insurance − HOA
        <br />
        Max loan = the loan whose P&amp;I equals Max P&amp;I (payment formula inverted)
        <br />
        Max price = Max loan ÷ (1 − down %)
        <br />
        Minimum rent = target DSCR × current PITIA
      </p>
      <p>The reverse solver uses the lender method and does not apply any loan-to-value cap.</p>

      <h2 id="returns">Cash flow and returns</h2>
      <p className="formula">
        Cash flow = Rent − vacancy − operating expenses − P&amp;I
        <br />
        Cap rate = Annual NOI ÷ price
        <br />
        Cash-on-cash = Annual cash flow ÷ (down payment + closing costs + repairs)
      </p>
      <p>
        On the main DSCR calculator, cash flow = rent × (1 − vacancy) × (1 − management) − PITIA, matching the iPhone app
        (which has no vacancy input). Closing costs = origination (a dollar amount or a percentage of the loan) + loan
        fees + title + escrow + prepaid interest + prepaid insurance + payment reserve. Cash invested = down payment +
        closing costs. Liquidity to verify = cash invested + payment reserve. For a refinance, net proceeds = new loan −
        current balance − closing costs.
      </p>
      <p>
        On the cash flow, cap rate and cash-on-cash calculators, operating expenses also include maintenance and CapEx
        reserves (as a percentage of rent) and owner-paid utilities.
      </p>

      <h2 id="bands">Result bands</h2>
      <p>
        Below 1.00 · 1.00–1.19 · 1.20–1.24 · 1.25 and above. The descriptions summarize common lender treatment and are
        not approval decisions.
      </p>

      <h2 id="limits">Limitations</h2>
      <ul>
        <li>Your lender decides the qualifying rent, tax and insurance estimates, rate and any fees it includes.</li>
        <li>Interest-only results assume the lender qualifies on the interest-only payment.</li>
        <li>Short-term rental income should be entered after any lender haircut.</li>
        <li>Results are estimates for education, not loan offers or advice.</li>
      </ul>
      <p>
        Found an error? <Link href="/contact">Tell us</Link> and we&apos;ll fix it and note the change here.
      </p>
    </PageShell>
  );
}

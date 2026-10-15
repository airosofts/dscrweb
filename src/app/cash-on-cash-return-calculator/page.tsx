import Link from "next/link";
import { RentalCalculator } from "@/components/calc/RentalCalculator";
import { PageShell, type Faq } from "@/components/seo/PageShell";
import { pageMeta } from "@/lib/meta";

const PATH = "/cash-on-cash-return-calculator";
export const metadata = pageMeta(
  PATH,
  "Cash-on-Cash Return Calculator for Rentals (Free) | DSCR Calculator Pro",
  "Free cash-on-cash return calculator: annual cash flow divided by the cash you invest, including down payment, closing costs and repairs. See how leverage and DSCR affect it.",
);

const TOC = [
  { id: "formula", title: "Cash-on-cash formula" },
  { id: "example", title: "Example" },
  { id: "good", title: "What is a good return?" },
  { id: "leverage", title: "Leverage, DSCR and returns" },
];

const FAQS: Faq[] = [
  {
    q: "What's the difference between cash-on-cash return and cap rate?",
    text: "Cap rate measures NOI against the full price, ignoring financing. Cash-on-cash measures cash flow after the mortgage against the cash you actually invested, so it reflects your loan terms.",
    a: <>Cap rate measures NOI against the full price, ignoring financing. Cash-on-cash measures cash flow after the mortgage against the cash you invested, so it reflects your loan.</>,
  },
  {
    q: "Does cash-on-cash include appreciation or principal paydown?",
    text: "No. It's a cash measure only. Total return adds principal paydown, appreciation and tax effects.",
    a: <>No. It&apos;s a cash measure only. Total return adds principal paydown, appreciation and tax effects.</>,
  },
];

export default function Page() {
  return (
    <PageShell
      path={PATH}
      kicker="Calculator · Returns"
      title="Cash-on-Cash Return Calculator"
      lede="How hard is your cash working? Cash-on-cash return compares a rental's annual cash flow with the money you put in to buy it."
      tool={<RentalCalculator focus="coc" />}
      schemaType="WebApplication"
      toc={TOC}
      faqs={FAQS}
      related={["/rental-property-cash-flow-calculator", "/cap-rate-calculator", "/", "/dscr-loan-down-payment"]}
    >
      <h2 id="formula">Cash-on-cash return formula</h2>
      <p className="formula">
        Cash-on-cash return = Annual pre-tax cash flow ÷ Total cash invested × 100
        <br />
        Cash invested = Down payment + Closing costs + Repairs
      </p>

      <h2 id="example">Example</h2>
      <p>
        The default property needs $60,000 down and $9,000 in closing costs, so $69,000 invested. After vacancy, every
        operating expense and reserve, and the mortgage, it produces about −$1,717 a year: a cash-on-cash return of{" "}
        <strong>−2.5%</strong>. The lender sees a 1.20 DSCR, but the cash return is negative. Try raising rent to $2,800
        or the down payment to 30% in the calculator to see how each changes the result.
      </p>

      <h2 id="good">What is a good cash-on-cash return?</h2>
      <p>
        Investor targets vary, but many aim for roughly 6–10% on long-term rentals, and higher for riskier properties or
        short-term rentals. Lower returns can still make sense in markets where you expect strong appreciation, as long as
        the property doesn&apos;t drain cash every month.
      </p>

      <h2 id="leverage">Leverage, DSCR and returns</h2>
      <p>
        A bigger down payment raises DSCR and usually improves cash flow, but spreads it over more invested cash. When a
        property&apos;s cap rate is above your loan rate, more leverage boosts cash-on-cash return; when it&apos;s below,
        leverage drags it down. Balance the two with the <Link href="/">DSCR calculator</Link> and this one side by side.
      </p>
    </PageShell>
  );
}

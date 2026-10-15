import Link from "next/link";
import { PageShell, type Faq } from "@/components/seo/PageShell";
import { pageMeta } from "@/lib/meta";

const PATH = "/interest-only-dscr-loan";
export const metadata = pageMeta(
  PATH,
  "Interest-Only DSCR Loans: How IO Payments Raise Your DSCR",
  "How interest-only DSCR loans work, how lenders calculate DSCR on an IO payment, the payment jump after the IO period, and when interest-only makes sense.",
);

const TOC = [
  { id: "what", title: "What it is" },
  { id: "dscr", title: "Effect on DSCR" },
  { id: "after", title: "After the IO period" },
  { id: "when", title: "When IO makes sense" },
  { id: "risks", title: "Risks" },
];

const FAQS: Faq[] = [
  {
    q: "Do lenders qualify interest-only DSCR loans on the IO payment?",
    text: "Many DSCR lenders calculate DSCR on the interest-only payment during the IO period, which produces a higher ratio. Some qualify on the fully amortizing payment instead, so ask which one your lender uses.",
    a: <>Many qualify on the interest-only payment, which produces a higher ratio. Some use the fully amortizing payment, so ask your lender which.</>,
  },
  {
    q: "How long is the interest-only period?",
    text: "Commonly 10 years on a 30-year loan, with the remaining 20 years fully amortizing. Some lenders offer 40-year loans with a 10-year interest-only period.",
    a: <>Commonly 10 years on a 30-year loan, with the remaining 20 years amortizing. Some offer 40-year loans with 10 years interest-only.</>,
  },
];

export default function Page() {
  return (
    <PageShell
      path={PATH}
      kicker="Guide · Loan structure"
      title="Interest-Only DSCR Loans"
      lede="An interest-only period lowers your payment and raises your DSCR. Here's how much, what happens when the IO period ends, and when it's worth it."
      toc={TOC}
      faqs={FAQS}
      related={["/", "/how-to-improve-dscr", "/dscr-loan", "/what-is-a-good-dscr"]}
    >
      <h2 id="what">What is an interest-only DSCR loan?</h2>
      <p>
        An interest-only (IO) DSCR loan lets you pay only interest for an initial period, often 10 years, before the
        loan starts amortizing. The monthly payment during the IO period is simply{" "}
        <strong>loan amount × annual rate ÷ 12</strong>.
      </p>

      <h2 id="dscr">How interest-only raises your DSCR</h2>
      <p>
        Because DSCR divides rent by the payment, a smaller payment means a higher ratio. On a $240,000 loan at 7.5%
        with $2,500 rent, $300 monthly taxes and $100 insurance:
      </p>
      <div className="table-wrap">
        <table>
          <thead><tr><th></th><th className="num">Amortizing (30 yr)</th><th className="num">Interest-only</th></tr></thead>
          <tbody>
            <tr><td>Principal & interest</td><td className="num">$1,678</td><td className="num">$1,500</td></tr>
            <tr><td>PITIA</td><td className="num">$2,078</td><td className="num">$1,900</td></tr>
            <tr><td><strong>DSCR</strong></td><td className="num"><strong>1.20</strong></td><td className="num"><strong>1.32</strong></td></tr>
          </tbody>
        </table>
      </div>
      <p>
        That&apos;s enough to move a deal from the 1.20 tier to above 1.25. Compare both on your own numbers: the{" "}
        <Link href="/">DSCR calculator</Link> shows amortizing and interest-only DSCR side by side.
      </p>

      <h2 id="after">What happens after the IO period</h2>
      <p>
        When the interest-only period ends, the full balance amortizes over the remaining term, so the payment jumps.
        On the example, a 30-year loan with 10 years IO would amortize $240,000 over the final 20 years: roughly{" "}
        <strong>$1,933</strong> a month instead of $1,500, assuming the same rate. Most investors plan to refinance or
        sell before then, or expect rents to have risen enough to cover the higher payment.
      </p>

      <h2 id="when">When interest-only makes sense</h2>
      <ul>
        <li>The deal sits just below your lender&apos;s DSCR threshold on an amortizing payment.</li>
        <li>You want maximum monthly cash flow now, for example to fund more acquisitions.</li>
        <li>You expect to refinance, sell or significantly raise rents within the IO period.</li>
        <li>You plan to prepay principal voluntarily when cash flow allows.</li>
      </ul>

      <h2 id="risks">Risks to weigh</h2>
      <ul>
        <li><strong>No equity from paydown:</strong> your balance stays flat during the IO period.</li>
        <li><strong>Payment shock</strong> when amortization starts.</li>
        <li><strong>Refinance risk</strong> if rates are higher or values lower when you need to refinance.</li>
        <li><strong>Pricing:</strong> some lenders add to the rate for interest-only.</li>
      </ul>
    </PageShell>
  );
}

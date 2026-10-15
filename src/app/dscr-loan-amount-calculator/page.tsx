import Link from "next/link";
import { MaxLoanCalculator } from "@/components/calc/MaxLoanCalculator";
import { PageShell, type Faq } from "@/components/seo/PageShell";
import { pageMeta } from "@/lib/meta";

const PATH = "/dscr-loan-amount-calculator";
export const metadata = pageMeta(
  PATH,
  "DSCR Loan Amount Calculator: How Much Can I Borrow? | DSCR Calculator Pro",
  "Find the maximum DSCR loan a rental's income supports at 1.0, 1.2 or 1.25 DSCR, the highest price you can pay, and the down payment you need. Free, no signup.",
);

const TOC = [
  { id: "how", title: "How the max loan is calculated" },
  { id: "example", title: "Example" },
  { id: "ltv", title: "DSCR limit vs LTV limit" },
  { id: "raise", title: "Borrowing more" },
];

const FAQS: Faq[] = [
  {
    q: "How much can I borrow on a DSCR loan?",
    text: "The most a DSCR loan can be is the smaller of two limits: the loan whose payment keeps rent ÷ PITIA at the lender's minimum DSCR, and the lender's maximum loan-to-value, typically 75–80% of the price.",
    a: <>The smaller of two limits: the loan whose payment keeps rent ÷ PITIA at the lender&apos;s minimum DSCR, and the lender&apos;s maximum loan-to-value, typically 75–80% of price.</>,
  },
  {
    q: "Does an interest-only loan let me borrow more?",
    text: "Yes, if the lender qualifies on the interest-only payment. In the example on this page, the maximum loan at 1.25 DSCR rises from about $228,800 amortizing to $256,000 interest-only.",
    a: <>Yes, if the lender qualifies on the IO payment. In the example here, the 1.25 maximum rises from about $228,800 to $256,000.</>,
  },
];

export default function Page() {
  return (
    <PageShell
      path={PATH}
      kicker="Calculator · Max loan"
      title="DSCR Loan Amount Calculator"
      lede="How much can a rental's income borrow? Enter rent, taxes, insurance and loan terms to see the largest loan that meets a lender's DSCR requirement."
      tool={<MaxLoanCalculator />}
      schemaType="WebApplication"
      toc={TOC}
      faqs={FAQS}
      related={["/", "/dscr-loan-down-payment", "/what-is-a-good-dscr", "/dscr-loan-requirements"]}
    >
      <h2 id="how">How the maximum DSCR loan is calculated</h2>
      <p>The calculator works the DSCR formula backwards:</p>
      <ol>
        <li><strong>Maximum PITIA</strong> = monthly rent ÷ target DSCR.</li>
        <li><strong>Maximum principal & interest</strong> = maximum PITIA − monthly taxes − insurance − HOA.</li>
        <li><strong>Maximum loan</strong> = the loan amount whose payment equals that principal & interest at your rate and term.</li>
      </ol>
      <p>
        That gives the DSCR limit. The lender&apos;s loan-to-value limit applies separately, and you can borrow the lower
        of the two.
      </p>

      <h2 id="example">Example</h2>
      <p>A property renting for $2,500 with $3,600 taxes and $1,200 insurance a year, at 7.5% over 30 years:</p>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Lender&apos;s required DSCR</th><th className="num">Maximum loan</th><th className="num">Max price at 20% down</th></tr></thead>
          <tbody>
            <tr><td>1.00</td><td className="num">$300,337</td><td className="num">$375,421</td></tr>
            <tr><td>1.10</td><td className="num">$267,833</td><td className="num">$334,791</td></tr>
            <tr><td>1.20</td><td className="num">$240,746</td><td className="num">$300,933</td></tr>
            <tr><td>1.25</td><td className="num">$228,828</td><td className="num">$286,035</td></tr>
            <tr><td>1.30</td><td className="num">$217,827</td><td className="num">$272,284</td></tr>
          </tbody>
        </table>
      </div>
      <p>
        Each 0.05 step in the lender&apos;s requirement moves the maximum loan by roughly $11,000 here, which is why the
        same property can qualify for noticeably different loans at different lenders.
      </p>

      <h2 id="ltv">The DSCR limit vs the LTV limit</h2>
      <p>
        At a 1.00 requirement the rent above supports a $300,337 loan, but on a $300,000 purchase an 80% LTV cap limits
        you to $240,000. In that case LTV, not DSCR, is the binding constraint. At 1.25 the DSCR limit ($228,828) binds
        first, so you&apos;d need about 24% down. The calculator&apos;s &ldquo;down needed&rdquo; figure shows this for
        your price.
      </p>

      <h2 id="raise">How to borrow more on the same rent</h2>
      <ul>
        <li>Find a lender with a lower minimum DSCR, accepting a slightly higher rate.</li>
        <li>Choose interest-only or a 40-year term if the lender qualifies on that payment.</li>
        <li>Buy down the rate.</li>
        <li>Reduce the insurance or HOA part of PITIA.</li>
      </ul>
      <p>
        Then check the full picture, including cash flow, in the <Link href="/">DSCR calculator</Link>.
      </p>
    </PageShell>
  );
}

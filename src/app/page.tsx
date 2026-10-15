import Link from "next/link";
import { DscrCalculator } from "@/components/calc/DscrCalculator";
import { PageShell, type Faq } from "@/components/seo/PageShell";
import { pageMeta } from "@/lib/meta";

export const metadata = pageMeta(
  "/",
  "DSCR Calculator – Free DSCR Loan & Ratio Calculator | DSCR Calculator Pro",
  "Free DSCR calculator for rental property loans. Enter rent, taxes, insurance and loan terms to get your debt service coverage ratio, max loan and break-even rent. No signup.",
);

const TOC = [
  { id: "what-it-means", title: "What your DSCR means" },
  { id: "formula", title: "The DSCR formula" },
  { id: "example", title: "Worked example" },
  { id: "two-methods", title: "Lender vs NOI method" },
  { id: "requirements", title: "What lenders require" },
  { id: "interest-only", title: "Interest-only and longer terms" },
  { id: "max-loan-guide", title: "Finding your max loan" },
  { id: "improve", title: "Raising a low DSCR" },
];

const FAQS: Faq[] = [
  {
    q: "What is a good DSCR for a rental property loan?",
    text: "Most DSCR lenders want at least 1.0, meaning rent covers the full payment. 1.20 to 1.25 or higher usually unlocks the best rates and highest loan-to-value. Some lenders offer no-ratio programs below 1.0 with a larger down payment.",
    a: (
      <>
        Most DSCR lenders want at least <strong>1.0</strong>, meaning rent covers the full payment. A ratio of{" "}
        <strong>1.20 to 1.25 or higher</strong> usually unlocks the best rates and highest loan-to-value. Some lenders
        offer &ldquo;no-ratio&rdquo; programs below 1.0 with a larger down payment. More in{" "}
        <Link href="/what-is-a-good-dscr">what is a good DSCR</Link>.
      </>
    ),
  },
  {
    q: "Do DSCR lenders use gross rent or net operating income?",
    text: "For 1–4 unit residential DSCR loans, most lenders divide gross monthly rent by PITIA (principal, interest, taxes, insurance and HOA). Commercial lenders and investors use net operating income divided by annual debt service, which subtracts vacancy and operating costs first and produces a lower number.",
    a: (
      <>
        For 1–4 unit residential DSCR loans, most lenders divide <strong>gross monthly rent by PITIA</strong>. Commercial
        lenders use <strong>net operating income ÷ annual debt service</strong>, which subtracts vacancy and operating
        costs first and produces a lower number. The calculator shows both.
      </>
    ),
  },
  {
    q: "What rent does the lender use if the property is vacant?",
    text: "Lenders usually use the lower of the signed lease or the appraiser's market rent estimate from a rent schedule (Fannie Mae Form 1007 for single-family, Form 1025 for 2–4 units). For a vacant purchase, the appraiser's market rent is used.",
    a: (
      <>
        Usually the lower of the signed lease or the appraiser&apos;s market rent from a rent schedule (Fannie Mae Form
        1007 for single-family, Form 1025 for 2–4 units). For a vacant purchase, the appraiser&apos;s market rent is used.
      </>
    ),
  },
  {
    q: "Can I get a DSCR loan with a ratio below 1.0?",
    text: "Some lenders offer no-ratio or sub-1.0 DSCR programs, sometimes down to about 0.75, but they typically require a larger down payment, more reserves and a higher credit score, and charge a higher rate.",
    a: (
      <>
        Some lenders offer no-ratio or sub-1.0 programs, sometimes down to about 0.75. Expect a larger down payment, more
        reserves, a higher credit score requirement and a higher rate.
      </>
    ),
  },
  {
    q: "Does a 40-year or interest-only loan help my DSCR?",
    text: "Yes. Both lower the monthly payment, which raises DSCR. In the default example here, moving from a 30-year amortizing loan to interest-only raises DSCR from 1.20 to 1.32, and a 40-year term raises it to 1.26. You build equity more slowly and pay more interest over time.",
    a: (
      <>
        Yes, both lower the payment and so raise DSCR. In the default example, interest-only lifts DSCR from 1.20 to 1.32
        and a 40-year term lifts it to 1.26. You build equity more slowly. See{" "}
        <Link href="/interest-only-dscr-loan">interest-only DSCR loans</Link>.
      </>
    ),
  },
  {
    q: "How much down payment does a DSCR loan need?",
    text: "Typically 20% to 25% for a purchase, meaning a maximum loan-to-value of 75% to 80%. Lower DSCRs, lower credit scores, short-term rentals and cash-out refinances often require more equity.",
    a: (
      <>
        Typically <strong>20% to 25%</strong> on a purchase (75–80% loan-to-value). Lower DSCR, lower credit, short-term
        rentals and cash-out refinances often need more. See{" "}
        <Link href="/dscr-loan-down-payment">DSCR loan down payment</Link>.
      </>
    ),
  },
  {
    q: "Is this calculator's result what my lender will use?",
    text: "It uses the same formula lenders use, but your lender sets the rent figure, tax and insurance estimates and rate, and some lenders include other costs. Treat the result as a close estimate and confirm with your lender.",
    a: (
      <>
        It uses the same formula, but your lender decides the rent figure, tax and insurance estimates and rate. Treat it
        as a close estimate. Our <Link href="/methodology">methodology</Link> explains every assumption.
      </>
    ),
  },
];

export default function Home() {
  return (
    <PageShell
      path="/"
      kicker="Free · No signup · Updated for 2026"
      title="DSCR Calculator"
      lede={
        <>
          Free debt service coverage ratio calculator for rental property loans. Get your DSCR the way lenders calculate
          it (rent ÷ PITIA) or by NOI, plus your maximum loan and break-even rent.
        </>
      }
      tool={<DscrCalculator />}
      toc={TOC}
      faqs={FAQS}
      schemaType="WebApplication"
      related={["/dscr-formula", "/dscr-loan-requirements", "/dscr-loan-amount-calculator", "/rental-property-cash-flow-calculator"]}
    >
      <h2 id="what-it-means">What your DSCR result means</h2>
      <p>
        DSCR, the <strong>debt service coverage ratio</strong>, tells a lender whether a rental property&apos;s income
        covers its loan payment. A DSCR of 1.00 means rent exactly covers the payment. Above 1.00 the property has a
        cushion; below it, you&apos;d be topping up the payment yourself. DSCR loans qualify you on this ratio instead of
        your personal income, which is why they&apos;re popular with self-employed investors and anyone with several
        rentals.
      </p>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>DSCR</th>
              <th>What a lender typically sees</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Below 1.00</td><td>Rent doesn&apos;t cover the payment. Most programs decline; some no-ratio programs lend with more down.</td></tr>
            <tr><td>1.00 – 1.19</td><td>Break-even coverage. Often approved, sometimes at a higher rate or lower loan-to-value.</td></tr>
            <tr><td>1.20 – 1.24</td><td>Solid. Qualifies with most DSCR lenders.</td></tr>
            <tr><td>1.25 and up</td><td>Strong. The usual threshold for best pricing and maximum leverage.</td></tr>
          </tbody>
        </table>
      </div>

      <h2 id="formula">The DSCR formula</h2>
      <p>For residential rental loans, lenders calculate DSCR like this:</p>
      <p className="formula">DSCR = Gross monthly rent ÷ PITIA</p>
      <p>
        <strong>PITIA</strong> is the full monthly housing payment: principal, interest, property taxes, insurance and
        association (HOA) dues. The commercial version divides annual net operating income by annual debt service. The
        full derivation, with three worked examples, is in our guide to the{" "}
        <Link href="/dscr-formula">DSCR formula and how to calculate DSCR</Link>.
      </p>

      <h2 id="example">Worked example</h2>
      <p>
        The calculator opens with a typical single-family rental: a $300,000 purchase with 20% down, a $240,000 loan at
        7.5% for 30 years, $2,500 monthly rent, $3,600 a year in taxes and $1,200 in insurance.
      </p>
      <div className="table-wrap">
        <table>
          <tbody>
            <tr><td>Principal & interest</td><td className="num">$1,678</td></tr>
            <tr><td>Property taxes ($3,600 ÷ 12)</td><td className="num">$300</td></tr>
            <tr><td>Insurance ($1,200 ÷ 12)</td><td className="num">$100</td></tr>
            <tr><td>HOA</td><td className="num">$0</td></tr>
            <tr><td><strong>PITIA</strong></td><td className="num"><strong>$2,078</strong></td></tr>
            <tr><td>Monthly rent</td><td className="num">$2,500</td></tr>
            <tr><td><strong>DSCR = $2,500 ÷ $2,078</strong></td><td className="num"><strong>1.20</strong></td></tr>
          </tbody>
        </table>
      </div>
      <p>
        At 1.20 this deal qualifies with most DSCR lenders but sits just under the 1.25 mark many use for their best
        pricing. The sensitivity table under the calculator shows the fix: at 25% down, or at a 7.0% rate, the same
        property reaches 1.25 or better.
      </p>

      <h2 id="two-methods">Why the lender and NOI methods give different numbers</h2>
      <p>
        Two definitions of DSCR are in common use, and mixing them up is the most common reason an investor&apos;s
        spreadsheet disagrees with a lender.
      </p>
      <ul>
        <li>
          <strong>Lender method (rent ÷ PITIA).</strong> Used by most residential DSCR lenders for 1–4 unit properties.
          It uses gross rent and counts taxes, insurance and HOA as part of the payment. It ignores vacancy,
          management, maintenance and repairs.
        </li>
        <li>
          <strong>NOI method (net operating income ÷ debt service).</strong> Used for commercial and multifamily loans and
          by investors stress-testing a deal. It subtracts vacancy and operating costs from income first, then divides
          by principal and interest only.
        </li>
      </ul>
      <p>
        On the example property, the lender method gives <strong>1.20</strong>. The NOI method, after 5% vacancy and an
        8% management fee, gives <strong>1.06</strong>. Both are correct; they answer different questions. The lender
        number tells you whether you&apos;ll qualify. The NOI number is closer to how much margin you really have.
      </p>

      <h2 id="requirements">What DSCR lenders typically require</h2>
      <p>Guidelines vary by lender and change with the market. These are common ranges in 2026:</p>
      <div className="table-wrap">
        <table>
          <tbody>
            <tr><td>Minimum DSCR</td><td>1.00 to 1.25; some no-ratio programs below 1.0</td></tr>
            <tr><td>Credit score</td><td>Often 620 to 680 minimum; best pricing around 720+</td></tr>
            <tr><td>Down payment</td><td>Typically 20–25% on a purchase</td></tr>
            <tr><td>Cash reserves</td><td>Commonly 3 to 12 months of PITIA</td></tr>
            <tr><td>Property</td><td>Non-owner-occupied 1–4 units, condos, townhomes; some allow 5–8 units</td></tr>
          </tbody>
        </table>
      </div>
      <p>
        The full breakdown, including seasoning, prepayment penalties and loan sizes, is in{" "}
        <Link href="/dscr-loan-requirements">DSCR loan requirements</Link>.
      </p>

      <h2 id="interest-only">Interest-only payments and longer terms</h2>
      <p>
        Because DSCR divides by the payment, anything that lowers the payment raises the ratio. On the example
        property:
      </p>
      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Loan structure</th><th className="num">Monthly P&I</th><th className="num">DSCR</th></tr>
          </thead>
          <tbody>
            <tr><td>15-year amortizing</td><td className="num">$2,225</td><td className="num">0.95</td></tr>
            <tr><td>30-year amortizing</td><td className="num">$1,678</td><td className="num">1.20</td></tr>
            <tr><td>40-year amortizing</td><td className="num">$1,579</td><td className="num">1.26</td></tr>
            <tr><td>Interest-only</td><td className="num">$1,500</td><td className="num">1.32</td></tr>
          </tbody>
        </table>
      </div>
      <p>
        Interest-only and 40-year options are common in DSCR lending for exactly this reason, but they cost more interest
        over the life of the loan. The calculator shows amortizing and interest-only DSCR side by side so you can see the
        trade.
      </p>

      <h2 id="max-loan-guide">Finding your maximum loan and break-even rent</h2>
      <p>
        The &ldquo;work backwards&rdquo; panel answers the question most investors actually have: how much can this rent
        support? At a 1.25 target, the example property supports a loan of about <strong>$228,800</strong>, which buys a
        property of about <strong>$286,000</strong> at 20% down. To keep the current $240,000 loan at 1.25, rent would
        need to be about <strong>$2,598</strong>. For a dedicated version, use the{" "}
        <Link href="/dscr-loan-amount-calculator">DSCR loan amount calculator</Link>.
      </p>

      <h2 id="improve">If your DSCR comes out low</h2>
      <p>
        You have more levers than it first appears: a larger down payment, a buy-down of the rate, an interest-only or
        40-year option, shopping insurance, appealing a high tax assessment, or documenting higher market rent with a
        rent survey. We cover all eight in <Link href="/how-to-improve-dscr">how to improve your DSCR</Link>.
      </p>
    </PageShell>
  );
}

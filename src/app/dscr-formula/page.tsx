import Link from "next/link";
import { PageShell, type Faq } from "@/components/seo/PageShell";
import { pageMeta } from "@/lib/meta";

const PATH = "/dscr-formula";
export const metadata = pageMeta(
  PATH,
  "DSCR Formula: How to Calculate DSCR (With Examples) | DSCR Calculator Pro",
  "The DSCR formula explained: rent ÷ PITIA for rental loans and NOI ÷ debt service for commercial loans. Step-by-step instructions and three worked examples.",
);

const TOC = [
  { id: "answer", title: "The formula in one line" },
  { id: "rental", title: "Rental (lender) formula" },
  { id: "steps", title: "How to calculate DSCR" },
  { id: "payment", title: "Calculating the payment" },
  { id: "examples", title: "Three worked examples" },
  { id: "commercial", title: "Commercial NOI formula" },
  { id: "mistakes", title: "Common mistakes" },
];

const FAQS: Faq[] = [
  {
    q: "Is DSCR calculated monthly or annually?",
    text: "Either, as long as both sides use the same period. Residential DSCR lenders usually work monthly (monthly rent ÷ monthly PITIA). Commercial lenders usually work annually (annual NOI ÷ annual debt service). Mixing monthly income with annual payments is a common error.",
    a: <>Either, as long as both sides use the same period. Residential lenders usually work monthly; commercial lenders usually work annually. Mixing a monthly figure with an annual one is a common error.</>,
  },
  {
    q: "Does DSCR include property taxes and insurance?",
    text: "In the residential lender formula, yes: taxes, insurance and HOA dues are part of PITIA in the denominator. In the commercial NOI formula they are subtracted from income instead, and the denominator is principal and interest only.",
    a: <>In the residential lender formula, yes: they&apos;re part of PITIA in the denominator. In the commercial NOI formula they&apos;re subtracted from income instead, and the denominator is principal and interest only.</>,
  },
  {
    q: "What is the DSCR formula in Excel?",
    text: "With monthly rent in B1, loan amount in B2, annual rate in B3, term in years in B4, annual taxes in B5, annual insurance in B6 and monthly HOA in B7: =B1/(-PMT(B3/12,B4*12,B2)+B5/12+B6/12+B7).",
    a: (
      <>
        With rent in B1, loan in B2, annual rate in B3, term in years in B4, annual taxes in B5, annual insurance in B6
        and monthly HOA in B7: <code>=B1/(-PMT(B3/12,B4*12,B2)+B5/12+B6/12+B7)</code>
      </>
    ),
  },
  {
    q: "What does a DSCR of 1.25 mean?",
    text: "It means the property's income is 1.25 times its debt payment, a 25% cushion. For every $1.00 of payment there is $1.25 of rent. Many lenders use 1.25 as the threshold for their best pricing.",
    a: <>Income is 1.25 times the payment: a 25% cushion, or $1.25 of rent for every $1.00 of payment. Many lenders use 1.25 for their best pricing.</>,
  },
];

export default function Page() {
  return (
    <PageShell
      path={PATH}
      kicker="Guide · Formula"
      title="DSCR Formula: How to Calculate DSCR"
      lede="The debt service coverage ratio formula for rental property and commercial loans, how to work it out by hand, and three examples with real numbers."
      toc={TOC}
      faqs={FAQS}
      related={["/", "/what-is-a-good-dscr", "/dscr-loan-requirements", "/dscr-glossary"]}
    >
      <h2 id="answer">What is the DSCR formula?</h2>
      <p className="answer">
        DSCR equals the income a property produces divided by the debt payment it must cover. For rental property
        loans, lenders use <strong>DSCR = gross monthly rent ÷ PITIA</strong>. For commercial loans,{" "}
        <strong>DSCR = annual net operating income ÷ annual debt service</strong>. A result above 1.0 means income
        covers the payment.
      </p>

      <h2 id="rental">The rental property (lender) DSCR formula</h2>
      <p className="formula">
        DSCR = Gross monthly rent ÷ (Principal + Interest + Taxes + Insurance + Association dues)
      </p>
      <p>
        The denominator is called <strong>PITIA</strong>. It&apos;s the full monthly payment on the property, including
        the escrowed costs. This is the version used by most DSCR lenders for 1–4 unit rentals, condos and townhomes,
        and it&apos;s the default &ldquo;Lender&rdquo; method in our <Link href="/">DSCR calculator</Link>.
      </p>
      <p>
        &ldquo;Rent&rdquo; here is usually the lower of the signed lease and the appraiser&apos;s market rent estimate.
        Lenders generally do not subtract vacancy, management or maintenance in this formula.
      </p>

      <h2 id="steps">How to calculate DSCR, step by step</h2>
      <ol>
        <li><strong>Find the qualifying rent.</strong> Use the lease, or the market rent from the appraisal&apos;s rent schedule if the property is vacant.</li>
        <li><strong>Calculate monthly principal and interest</strong> on the loan amount (formula below), or interest only if the loan has an interest-only period.</li>
        <li><strong>Add monthly taxes and insurance:</strong> annual property tax ÷ 12 and annual premium ÷ 12, including flood insurance if required.</li>
        <li><strong>Add monthly HOA dues</strong>, if any. The total is PITIA.</li>
        <li><strong>Divide rent by PITIA.</strong> Round to two decimals.</li>
      </ol>

      <h2 id="payment">Calculating the monthly principal and interest</h2>
      <p>The standard amortizing payment formula:</p>
      <p className="formula">
        P&amp;I = L × r(1 + r)ⁿ ÷ ((1 + r)ⁿ − 1)
        <br />
        L = loan amount · r = annual rate ÷ 12 · n = years × 12
      </p>
      <p>
        For an interest-only loan it&apos;s simply <strong>L × annual rate ÷ 12</strong>. A $240,000 loan at 7.5% is
        $1,678.11 a month amortizing over 30 years, or $1,500 a month interest-only.
      </p>

      <h2 id="examples">Three worked examples</h2>
      <h3>Example 1: Single-family rental, 20% down</h3>
      <div className="table-wrap">
        <table>
          <tbody>
            <tr><td>Price / loan</td><td className="num">$300,000 / $240,000 at 7.5%, 30 yr</td></tr>
            <tr><td>Principal & interest</td><td className="num">$1,678</td></tr>
            <tr><td>Taxes + insurance ($3,600 + $1,200 a year)</td><td className="num">$400</td></tr>
            <tr><td>PITIA</td><td className="num">$2,078</td></tr>
            <tr><td>Rent</td><td className="num">$2,500</td></tr>
            <tr><td><strong>DSCR</strong></td><td className="num"><strong>1.20</strong></td></tr>
          </tbody>
        </table>
      </div>

      <h3>Example 2: Higher-priced rental, 25% down</h3>
      <div className="table-wrap">
        <table>
          <tbody>
            <tr><td>Price / loan</td><td className="num">$400,000 / $300,000 at 7.25%, 30 yr</td></tr>
            <tr><td>Principal & interest</td><td className="num">$2,047</td></tr>
            <tr><td>Taxes + insurance ($4,800 + $1,800 a year)</td><td className="num">$550</td></tr>
            <tr><td>PITIA</td><td className="num">$2,597</td></tr>
            <tr><td>Rent</td><td className="num">$3,200</td></tr>
            <tr><td><strong>DSCR</strong></td><td className="num"><strong>1.23</strong></td></tr>
          </tbody>
        </table>
      </div>

      <h3>Example 3: Small apartment building (commercial NOI method)</h3>
      <div className="table-wrap">
        <table>
          <tbody>
            <tr><td>Gross annual rent (8 units)</td><td className="num">$144,000</td></tr>
            <tr><td>Less vacancy and operating expenses</td><td className="num">−$48,000</td></tr>
            <tr><td>Net operating income</td><td className="num">$96,000</td></tr>
            <tr><td>Annual principal & interest</td><td className="num">$76,800</td></tr>
            <tr><td><strong>DSCR = $96,000 ÷ $76,800</strong></td><td className="num"><strong>1.25</strong></td></tr>
          </tbody>
        </table>
      </div>

      <h2 id="commercial">The commercial (NOI) DSCR formula</h2>
      <p className="formula">DSCR = Net operating income ÷ Total debt service</p>
      <p>
        <strong>Net operating income (NOI)</strong> is gross income minus vacancy and all operating expenses: taxes,
        insurance, management, repairs, utilities the owner pays, and reserves. It excludes the mortgage. <strong>Debt
        service</strong> is the annual principal and interest. Because costs come out of the top, NOI-based DSCR runs
        lower than the rent ÷ PITIA version for the same property. Our example rental scores 1.20 on the lender formula
        and 1.06 on NOI.
      </p>

      <h2 id="mistakes">Common DSCR calculation mistakes</h2>
      <ul>
        <li><strong>Mixing periods:</strong> monthly rent over annual debt service, or the reverse.</li>
        <li><strong>Leaving out taxes or insurance</strong> in the lender formula. They belong in PITIA.</li>
        <li><strong>Double-counting:</strong> subtracting taxes from income and adding them to the payment.</li>
        <li><strong>Using asking rent</strong> instead of lease or appraised market rent.</li>
        <li><strong>Forgetting HOA dues or flood insurance</strong>, both of which lenders include.</li>
        <li><strong>Comparing different methods:</strong> your NOI-based spreadsheet will not match a lender&apos;s rent ÷ PITIA figure.</li>
      </ul>
      <p>
        Skip the arithmetic with the <Link href="/">free DSCR calculator</Link>, which shows both methods side by side.
      </p>
    </PageShell>
  );
}

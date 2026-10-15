import Link from "next/link";
import { RentalCalculator } from "@/components/calc/RentalCalculator";
import { PageShell, type Faq } from "@/components/seo/PageShell";
import { pageMeta } from "@/lib/meta";

const PATH = "/rental-property-cash-flow-calculator";
export const metadata = pageMeta(
  PATH,
  "Rental Property Cash Flow Calculator (Free) | DSCR Calculator Pro",
  "Free rental property cash flow calculator. Includes vacancy, management, maintenance, CapEx reserves, taxes, insurance and the mortgage, plus cap rate, cash-on-cash and DSCR.",
);

const TOC = [
  { id: "how", title: "How cash flow is calculated" },
  { id: "example", title: "Example: DSCR 1.20, negative cash flow" },
  { id: "assumptions", title: "Choosing your assumptions" },
  { id: "good", title: "What is good cash flow?" },
];

const FAQS: Faq[] = [
  {
    q: "What percentage should I use for maintenance and CapEx?",
    text: "Many investors budget 5–10% of rent for maintenance and another 5–10% for capital expenditures such as roofs and HVAC, using the higher end for older properties.",
    a: <>Many investors budget 5–10% of rent for maintenance and another 5–10% for capital expenditures, using the higher end for older properties.</>,
  },
  {
    q: "Is cash flow the same as profit?",
    text: "Not exactly. Cash flow ignores principal paydown, appreciation, depreciation and taxes. A property can have modest cash flow but a solid total return.",
    a: <>Not exactly. Cash flow ignores principal paydown, appreciation, depreciation and taxes. Modest cash flow can still mean a solid total return.</>,
  },
];

export default function Page() {
  return (
    <PageShell
      path={PATH}
      kicker="Calculator · Cash flow"
      title="Rental Property Cash Flow Calculator"
      lede="See what a rental really puts in your pocket each month after vacancy, operating costs, reserves and the mortgage."
      tool={<RentalCalculator focus="cashflow" />}
      schemaType="WebApplication"
      toc={TOC}
      faqs={FAQS}
      related={["/", "/cap-rate-calculator", "/cash-on-cash-return-calculator", "/how-to-improve-dscr"]}
    >
      <h2 id="how">How rental cash flow is calculated</h2>
      <p className="formula">
        Cash flow = Rent − Vacancy − Operating expenses − Mortgage payment
        <br />
        Net operating income (NOI) = Rent − Vacancy − Operating expenses
      </p>
      <p>
        Operating expenses include property management, maintenance, a reserve for big-ticket replacements (CapEx),
        property taxes, insurance, HOA dues and any utilities you pay. The mortgage payment here is principal and
        interest.
      </p>

      <h2 id="example">Example: why a 1.20 DSCR can still lose money</h2>
      <p>
        The calculator opens with the same property used across this site: $300,000 price, 20% down, 7.5% over 30 years,
        $2,500 rent. A DSCR lender sees a ratio of <strong>1.20</strong> and approves it. But after realistic costs:
      </p>
      <div className="table-wrap">
        <table>
          <tbody>
            <tr><td>Rent</td><td className="num">$2,500</td></tr>
            <tr><td>Vacancy (5%)</td><td className="num">−$125</td></tr>
            <tr><td>Management (8% of collected)</td><td className="num">−$190</td></tr>
            <tr><td>Maintenance and CapEx (5% each)</td><td className="num">−$250</td></tr>
            <tr><td>Taxes and insurance</td><td className="num">−$400</td></tr>
            <tr><td><strong>Net operating income</strong></td><td className="num"><strong>$1,535</strong></td></tr>
            <tr><td>Principal & interest</td><td className="num">−$1,678</td></tr>
            <tr><td><strong>Monthly cash flow</strong></td><td className="num"><strong>−$143</strong></td></tr>
          </tbody>
        </table>
      </div>
      <p>
        The lender&apos;s formula ignores vacancy, management and reserves; your bank account doesn&apos;t. Check both
        numbers before you buy: the <Link href="/">DSCR calculator</Link> for qualifying, this one for reality.
      </p>

      <h2 id="assumptions">Choosing your assumptions</h2>
      <ul>
        <li><strong>Vacancy:</strong> 5–8% is common for stable long-term rentals; use local data where you have it.</li>
        <li><strong>Management:</strong> 8–10% of collected rent for full-service management; budget it even if you self-manage.</li>
        <li><strong>Maintenance:</strong> 5–10% of rent.</li>
        <li><strong>CapEx:</strong> 5–10% of rent, more for older roofs, HVAC and water heaters.</li>
        <li><strong>Taxes:</strong> use the post-sale estimate; many counties reassess on purchase.</li>
      </ul>

      <h2 id="good">What is good cash flow on a rental?</h2>
      <p>
        There&apos;s no single number. Many investors look for $100–$300 per door per month after all reserves, while
        others accept break-even cash flow in high-appreciation markets. Compare deals with{" "}
        <Link href="/cash-on-cash-return-calculator">cash-on-cash return</Link> and{" "}
        <Link href="/cap-rate-calculator">cap rate</Link>, which scale with price.
      </p>
    </PageShell>
  );
}

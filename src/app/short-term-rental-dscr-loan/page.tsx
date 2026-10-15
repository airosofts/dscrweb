import Link from "next/link";
import { PageShell, type Faq } from "@/components/seo/PageShell";
import { pageMeta } from "@/lib/meta";

const PATH = "/short-term-rental-dscr-loan";
export const metadata = pageMeta(
  PATH,
  "Short-Term Rental DSCR Loans: How Lenders Count Airbnb Income",
  "How DSCR lenders qualify Airbnb and VRBO properties: booking history, revenue projections, haircuts on gross income, higher expenses, and typical STR requirements.",
);

const TOC = [
  { id: "how", title: "How STR DSCR loans work" },
  { id: "income", title: "How lenders count STR income" },
  { id: "example", title: "Example" },
  { id: "requirements", title: "Typical STR requirements" },
  { id: "tips", title: "Tips before applying" },
];

const FAQS: Faq[] = [
  {
    q: "Can I use projected Airbnb income for a purchase?",
    text: "Many lenders allow a third-party revenue projection, often from a market data provider or an appraiser's short-term rental analysis, for a property without booking history. Others require 12 months of history and will use long-term market rent until then.",
    a: <>Many lenders accept a third-party revenue projection for a property without history. Others want 12 months of booking history and use long-term market rent until then.</>,
  },
  {
    q: "Do STR DSCR loans have higher rates?",
    text: "Often slightly higher than long-term rental DSCR loans, with lower maximum loan-to-value, reflecting more volatile income.",
    a: <>Often slightly, with lower maximum LTV, reflecting more volatile income.</>,
  },
];

export default function Page() {
  return (
    <PageShell
      path={PATH}
      kicker="Guide · Short-term rentals"
      title="Short-Term Rental DSCR Loans"
      lede="Financing an Airbnb or VRBO with a DSCR loan: how lenders turn nightly bookings into a qualifying rent, and what they require."
      toc={TOC}
      faqs={FAQS}
      related={["/", "/dscr-loan-requirements", "/rental-property-cash-flow-calculator", "/dscr-loan"]}
    >
      <h2 id="how">How short-term rental DSCR loans work</h2>
      <p>
        The formula is the same, rent divided by PITIA, but the &ldquo;rent&rdquo; is harder to pin down. Nightly rates
        and occupancy change by season, so lenders convert expected annual revenue into a monthly figure and usually
        reduce it to account for the higher costs and volatility of hosting.
      </p>

      <h2 id="income">How lenders count short-term rental income</h2>
      <ul>
        <li><strong>Booking history:</strong> 12 months of platform statements or a property manager&apos;s report, averaged monthly.</li>
        <li><strong>Revenue projection:</strong> a market data report or an appraiser&apos;s short-term rental analysis for properties without history.</li>
        <li><strong>Long-term rent fallback:</strong> some lenders simply use the appraiser&apos;s long-term market rent, which is usually lower.</li>
        <li><strong>Haircut:</strong> lenders commonly apply a reduction or an expense factor to gross STR revenue before calculating DSCR, since cleaning, platform fees, supplies and utilities are much higher than for a long-term rental.</li>
      </ul>

      <h2 id="example">Example</h2>
      <p>
        A cabin projects $54,000 a year in gross bookings, or $4,500 a month. If a lender applies a 20% haircut, the
        qualifying rent is $3,600. With a PITIA of $2,900, DSCR is $3,600 ÷ $2,900 = <strong>1.24</strong>. Without the
        haircut it would have looked like 1.55, which is why STR investors are often surprised by the lender&apos;s
        number. Enter the qualifying (after-haircut) figure as rent in the <Link href="/">DSCR calculator</Link>.
      </p>

      <h2 id="requirements">Typical short-term rental requirements</h2>
      <div className="table-wrap">
        <table>
          <tbody>
            <tr><td>Minimum DSCR</td><td>Often 1.00–1.25 on the adjusted income</td></tr>
            <tr><td>Down payment</td><td>Commonly 20–30%</td></tr>
            <tr><td>Credit score</td><td>Often a higher minimum than long-term rentals</td></tr>
            <tr><td>Local rules</td><td>Must be legal to operate as an STR; permits may be required</td></tr>
            <tr><td>Experience</td><td>Some programs want prior hosting or landlord history</td></tr>
          </tbody>
        </table>
      </div>

      <h2 id="tips">Tips before you apply</h2>
      <ul>
        <li>Confirm local short-term rental zoning and permit rules before you make an offer.</li>
        <li>Ask each lender exactly how they count STR income and what haircut they apply.</li>
        <li>Run a long-term rent scenario too, in case the lender falls back to it.</li>
        <li>Model true hosting costs in the <Link href="/rental-property-cash-flow-calculator">cash flow calculator</Link>.</li>
      </ul>
    </PageShell>
  );
}

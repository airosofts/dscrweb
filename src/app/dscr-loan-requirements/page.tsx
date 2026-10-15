import Link from "next/link";
import { PageShell, type Faq } from "@/components/seo/PageShell";
import { pageMeta } from "@/lib/meta";

const PATH = "/dscr-loan-requirements";
export const metadata = pageMeta(
  PATH,
  "DSCR Loan Requirements 2026: Minimum DSCR, Credit, Down Payment & Reserves",
  "Typical DSCR loan requirements in 2026: minimum DSCR, credit score, down payment, reserves, property types, seasoning, prepayment penalties and loan sizes.",
);

const TOC = [
  { id: "summary", title: "Requirements at a glance" },
  { id: "dscr", title: "Minimum DSCR" },
  { id: "credit", title: "Credit score" },
  { id: "down", title: "Down payment and LTV" },
  { id: "reserves", title: "Cash reserves" },
  { id: "property", title: "Property requirements" },
  { id: "rent", title: "How rent is verified" },
  { id: "borrower", title: "Borrower and entity" },
  { id: "terms", title: "Loan terms and costs" },
  { id: "checklist", title: "Document checklist" },
];

const FAQS: Faq[] = [
  {
    q: "Do DSCR loans require income verification?",
    text: "No personal income verification is required. DSCR lenders do not ask for tax returns, W-2s or pay stubs and do not calculate a debt-to-income ratio. They qualify the loan on the property's rent relative to its payment, plus credit, reserves and down payment.",
    a: <>Not personal income. DSCR lenders don&apos;t ask for tax returns, W-2s or pay stubs and don&apos;t calculate debt-to-income. They qualify on the property&apos;s rent relative to its payment, plus credit, reserves and equity.</>,
  },
  {
    q: "Can first-time investors get a DSCR loan?",
    text: "Many lenders accept first-time investors, sometimes with a higher minimum credit score, a larger down payment or more reserves. A few programs require prior landlord experience, especially for short-term rentals.",
    a: <>Many lenders accept them, sometimes with a higher credit minimum, more down or more reserves. Some short-term rental programs require prior hosting experience.</>,
  },
  {
    q: "Can I live in a property financed with a DSCR loan?",
    text: "No. DSCR loans are business-purpose loans for investment properties. Borrowers typically sign an occupancy or business-purpose certification stating they will not live in the property.",
    a: <>No. DSCR loans are business-purpose loans for investment properties, and you&apos;ll typically sign a certification that you won&apos;t occupy it.</>,
  },
  {
    q: "Is there a limit on how many DSCR loans I can have?",
    text: "Not in the way conventional lending limits you. Fannie Mae caps a borrower at 10 financed properties, but DSCR lenders set their own exposure limits, often allowing many more loans, sometimes with additional reserve requirements.",
    a: <>Not the way conventional loans do. Fannie Mae caps borrowers at 10 financed properties; DSCR lenders set their own limits, often much higher, sometimes with extra reserves per property.</>,
  },
];

export default function Page() {
  return (
    <PageShell
      path={PATH}
      kicker="Guide · Requirements"
      title="DSCR Loan Requirements"
      lede="What DSCR lenders typically look for in 2026: the ratio itself, credit, down payment, reserves, the property and the paperwork. Use these ranges to prepare, then confirm with your lender."
      toc={TOC}
      faqs={FAQS}
      related={["/", "/what-is-a-good-dscr", "/dscr-loan-down-payment", "/dscr-loan"]}
    >
      <h2 id="summary">DSCR loan requirements at a glance</h2>
      <p>
        Every lender publishes its own guidelines and they shift with the market. These are the ranges you&apos;ll see
        most often for 1–4 unit investment properties:
      </p>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Requirement</th><th>Typical range</th></tr></thead>
          <tbody>
            <tr><td>Minimum DSCR</td><td>1.00 to 1.25 (some programs 0.75 or no-ratio)</td></tr>
            <tr><td>Credit score</td><td>620 to 680 minimum; best pricing around 720+</td></tr>
            <tr><td>Down payment (purchase)</td><td>20% to 25% (75–80% max LTV)</td></tr>
            <tr><td>Cash-out refinance</td><td>Up to about 70–75% LTV</td></tr>
            <tr><td>Reserves</td><td>3 to 12 months of PITIA</td></tr>
            <tr><td>Loan size</td><td>From about $75,000–$150,000 up to $2M–$3M+</td></tr>
            <tr><td>Property</td><td>Non-owner-occupied 1–4 units, condos, townhomes; some 5–8 units</td></tr>
            <tr><td>Income documentation</td><td>None from the borrower; rent from lease or appraisal</td></tr>
          </tbody>
        </table>
      </div>
      <p>
        Check your numbers against these with the <Link href="/">DSCR calculator</Link>.
      </p>

      <h2 id="dscr">Minimum DSCR</h2>
      <p>
        The ratio is the heart of the loan. Most programs want <strong>at least 1.00</strong>, meaning rent covers PITIA.
        Many lenders price in tiers: a better rate or higher loan-to-value at 1.20 or 1.25, and tighter terms between
        1.00 and 1.19. Below 1.00, some lenders offer no-ratio programs, typically with 25–35% down, a higher credit
        floor and a higher rate. For what each level means in practice, see{" "}
        <Link href="/what-is-a-good-dscr">what is a good DSCR</Link>.
      </p>

      <h2 id="credit">Credit score</h2>
      <p>
        Minimums commonly sit between <strong>620 and 680</strong>, with the best rates reserved for scores around 720 to
        740 and up. Lenders usually use the middle of three bureau scores. A lower score often means a lower maximum
        loan-to-value, so the same property may need more down. Recent bankruptcies, foreclosures or short sales
        typically require a waiting period, often two to four years depending on the lender and event.
      </p>

      <h2 id="down">Down payment and loan-to-value</h2>
      <p>
        Expect <strong>20% to 25% down</strong> on a purchase. The maximum loan-to-value usually falls as risk rises:
        lower DSCR, lower credit, short-term rentals, condos with limited reviews and cash-out refinances all tend to
        need more equity. A larger down payment also lowers the payment, which raises DSCR. Our{" "}
        <Link href="/dscr-loan-down-payment">DSCR down payment guide</Link> shows how much.
      </p>

      <h2 id="reserves">Cash reserves</h2>
      <p>
        Lenders want proof you can carry the property through a vacancy. Requirements typically run <strong>3 to 12
        months of PITIA</strong> in liquid or retirement accounts, verified with bank statements. Some lenders count
        cash-out proceeds toward reserves; larger loans and lower ratios usually need more.
      </p>

      <h2 id="property">Property requirements</h2>
      <ul>
        <li><strong>Eligible:</strong> single-family homes, 2–4 unit properties, townhomes and warrantable condos. Many lenders also accept non-warrantable condos, and some accept 5–8 unit buildings.</li>
        <li><strong>Usually ineligible:</strong> primary residences, second homes you&apos;ll use, rural acreage, properties needing major repairs, and some unique property types.</li>
        <li><strong>Condition:</strong> the property generally must be rentable as-is. Heavy-rehab projects are usually financed with bridge or fix-and-flip loans first.</li>
        <li><strong>Short-term rentals</strong> are widely allowed, with their own rent rules. See <Link href="/short-term-rental-dscr-loan">short-term rental DSCR loans</Link>.</li>
      </ul>

      <h2 id="rent">How lenders verify rent</h2>
      <p>
        For an occupied property, the lender uses the current lease, often the lower of the lease and market rent. For a
        vacant purchase, the appraiser completes a rent schedule (Fannie Mae Form 1007 for single-family, Form 1025 for
        2–4 units) estimating market rent. Some lenders allow a higher lease amount if you can document a history of
        receiving it. Short-term rentals may use 12 months of booking history or a third-party revenue projection.
      </p>

      <h2 id="borrower">Borrower and entity requirements</h2>
      <p>
        You can usually borrow in your own name or through an LLC, corporation or partnership, with the owners
        personally guaranteeing the loan. US citizens and permanent residents qualify everywhere; many lenders also
        lend to foreign nationals with larger down payments. Because these are business-purpose loans, they&apos;re
        generally exempt from the consumer ability-to-repay rules that apply to home loans.
      </p>

      <h2 id="terms">Loan terms and costs</h2>
      <ul>
        <li><strong>Terms:</strong> 30-year fixed is standard; 40-year and interest-only periods (often 10 years) are common; adjustable options exist.</li>
        <li><strong>Rates:</strong> usually higher than conventional investment-property loans, varying with DSCR, credit, LTV and prepayment choice.</li>
        <li><strong>Prepayment penalties:</strong> common, often a step-down such as 5-4-3-2-1% over five years or 3-2-1% over three. Choosing a shorter or no penalty usually raises the rate.</li>
        <li><strong>Seasoning for cash-out:</strong> many lenders want you to have owned the property 3 to 6 months before a cash-out refinance based on the new value; some have no minimum.</li>
        <li><strong>Closing costs:</strong> origination points, appraisal (often including the rent schedule), title and escrow.</li>
      </ul>

      <h2 id="checklist">Document checklist</h2>
      <ul>
        <li>Photo ID and credit authorization</li>
        <li>Purchase contract, or current mortgage statement for a refinance</li>
        <li>Leases for occupied units, or rely on the appraisal rent schedule</li>
        <li>Two months of bank statements for down payment and reserves</li>
        <li>Insurance quote naming the lender, plus flood insurance if required</li>
        <li>LLC documents if closing in an entity: articles, operating agreement, EIN</li>
        <li>For short-term rentals: booking history or revenue projection</li>
      </ul>
    </PageShell>
  );
}

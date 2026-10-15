import Link from "next/link";
import { PageShell, type Faq } from "@/components/seo/PageShell";
import { pageMeta } from "@/lib/meta";

const PATH = "/dscr-loan";
export const metadata = pageMeta(
  PATH,
  "What Is a DSCR Loan? How It Works, Pros, Cons & Who Qualifies",
  "A DSCR loan qualifies a rental property on its rent instead of your personal income. How DSCR loans work, who they suit, pros and cons, costs, and how to apply.",
);

const TOC = [
  { id: "definition", title: "DSCR loan definition" },
  { id: "how", title: "How a DSCR loan works" },
  { id: "who", title: "Who DSCR loans are for" },
  { id: "pros-cons", title: "Pros and cons" },
  { id: "uses", title: "Purchase, refinance, cash-out" },
  { id: "costs", title: "Rates and costs" },
  { id: "apply", title: "How to apply" },
];

const FAQS: Faq[] = [
  {
    q: "What does DSCR stand for?",
    text: "DSCR stands for debt service coverage ratio: the property's income divided by its debt payment.",
    a: <>Debt service coverage ratio: the property&apos;s income divided by its debt payment.</>,
  },
  {
    q: "Are DSCR loans a good idea?",
    text: "They are a good fit for investors whose tax returns understate their income, who own many properties, or who want to close in an LLC. They cost more than conventional loans, so investors with strong documented income and few properties may do better with a conventional loan.",
    a: <>They fit investors whose tax returns understate income, who own many properties or who want to close in an LLC. They cost more than conventional loans, so W-2 borrowers with few properties may do better conventionally. Compare in <Link href="/dscr-vs-conventional-loan">DSCR vs conventional</Link>.</>,
  },
  {
    q: "How long does a DSCR loan take to close?",
    text: "Commonly two to four weeks. With no income documentation to review, the timeline is usually driven by the appraisal and rent schedule, title and insurance.",
    a: <>Commonly two to four weeks. With no income to underwrite, the appraisal (with rent schedule), title and insurance usually set the pace.</>,
  },
  {
    q: "Are DSCR loans only for experienced investors?",
    text: "No. Many lenders accept first-time investors, sometimes with tighter credit, down payment or reserve requirements.",
    a: <>No. Many lenders accept first-time investors, sometimes with tighter credit, down payment or reserve requirements.</>,
  },
];

export default function Page() {
  return (
    <PageShell
      path={PATH}
      kicker="Guide · DSCR loans"
      title="What Is a DSCR Loan?"
      lede="A DSCR loan is an investment property mortgage that qualifies on the property's rent instead of your personal income. Here's how they work, who they're for, and what they cost."
      toc={TOC}
      faqs={FAQS}
      related={["/dscr-loan-requirements", "/", "/dscr-vs-conventional-loan", "/interest-only-dscr-loan"]}
    >
      <h2 id="definition">DSCR loan definition</h2>
      <p className="answer">
        A DSCR loan is a business-purpose mortgage for rental property in which the lender qualifies you mainly on the
        property&apos;s <strong>debt service coverage ratio</strong>: its rent divided by its monthly payment. There are
        no tax returns, pay stubs or debt-to-income calculations. If the rent covers the payment by the lender&apos;s
        required margin, the property qualifies.
      </p>
      <p>
        DSCR loans are a type of non-QM (non-qualified mortgage) loan. They&apos;re offered by specialist lenders and
        funded largely through private and securitized markets rather than Fannie Mae or Freddie Mac.
      </p>

      <h2 id="how">How a DSCR loan works</h2>
      <ol>
        <li>The lender establishes the property&apos;s rent from the lease or the appraiser&apos;s market rent estimate.</li>
        <li>It calculates the full monthly payment, PITIA: principal, interest, taxes, insurance and HOA dues.</li>
        <li>It divides rent by PITIA. That&apos;s the <Link href="/dscr-formula">DSCR</Link>.</li>
        <li>It checks the ratio against its minimum (usually 1.00 to 1.25), then sets the rate and maximum loan-to-value using DSCR, credit score and down payment.</li>
        <li>It verifies reserves and down payment from bank statements, orders title and closes, often in an LLC.</li>
      </ol>
      <p>
        You can run step 3 yourself in seconds with the <Link href="/">DSCR calculator</Link>, which also works out the
        largest loan a given rent supports.
      </p>

      <h2 id="who">Who DSCR loans are for</h2>
      <ul>
        <li><strong>Self-employed investors</strong> whose tax returns show low income after deductions and depreciation.</li>
        <li><strong>Portfolio builders</strong> who have hit conventional limits; Fannie Mae caps borrowers at 10 financed properties.</li>
        <li><strong>Investors buying in an LLC</strong> for liability separation.</li>
        <li><strong>BRRRR investors</strong> refinancing out of a short-term rehab loan into long-term debt.</li>
        <li><strong>Short-term rental owners</strong>, with programs that count projected or historical booking income.</li>
        <li><strong>Foreign nationals</strong>, with many lenders offering dedicated programs.</li>
      </ul>

      <h2 id="pros-cons">Pros and cons</h2>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Pros</th><th>Cons</th></tr></thead>
          <tbody>
            <tr><td>No personal income or DTI review</td><td>Higher rates than conventional loans</td></tr>
            <tr><td>Close in an LLC</td><td>Usually 20–25% down</td></tr>
            <tr><td>No cap on number of financed properties</td><td>Prepayment penalties are common</td></tr>
            <tr><td>Faster, simpler documentation</td><td>Only for investment properties, not your home</td></tr>
            <tr><td>Interest-only and 40-year options</td><td>Rent must cover the payment, which limits leverage in high-price, low-rent markets</td></tr>
          </tbody>
        </table>
      </div>

      <h2 id="uses">Purchase, rate-and-term refinance, and cash-out</h2>
      <p>
        DSCR loans finance purchases, refinance existing loans to a better rate or term, and pull equity out with a
        cash-out refinance. Cash-out loans generally allow a lower maximum LTV (often around 70–75%) and may require 3 to
        6 months of ownership before using the new appraised value. DSCR refinances are the usual exit for the BRRRR
        strategy: buy, rehab, rent, refinance, repeat.
      </p>

      <h2 id="costs">Rates and costs</h2>
      <p>
        DSCR rates are typically higher than conventional investment-property rates because the loans carry more
        perceived risk and aren&apos;t backed by the government-sponsored enterprises. Your rate moves with:
      </p>
      <ul>
        <li><strong>DSCR</strong>: higher ratios earn better pricing.</li>
        <li><strong>Credit score</strong> and <strong>loan-to-value</strong>.</li>
        <li><strong>Prepayment penalty choice</strong>: a longer penalty usually buys a lower rate.</li>
        <li><strong>Property type</strong>: short-term rentals and condos may price higher.</li>
        <li><strong>Interest-only</strong> features, which can add to the rate.</li>
      </ul>
      <p>
        Closing costs include origination points, the appraisal and rent schedule, title, escrow and lender fees.
      </p>

      <h2 id="apply">How to apply for a DSCR loan</h2>
      <ol>
        <li>Estimate your DSCR with the <Link href="/">calculator</Link> and confirm it clears 1.0, ideally 1.25.</li>
        <li>Check your credit score and gather two months of bank statements for down payment and reserves.</li>
        <li>Form your LLC if you plan to close in one.</li>
        <li>Get quotes from several DSCR lenders or a broker. Compare rate, points, prepayment penalty and maximum LTV.</li>
        <li>Lock, order the appraisal with rent schedule, bind insurance and close.</li>
      </ol>
      <p>
        Read the full checklist in <Link href="/dscr-loan-requirements">DSCR loan requirements</Link>.
      </p>
    </PageShell>
  );
}

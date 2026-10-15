import Link from "next/link";
import { PageShell, type Faq } from "@/components/seo/PageShell";
import { pageMeta } from "@/lib/meta";

const PATH = "/what-is-a-good-dscr";
export const metadata = pageMeta(
  PATH,
  "What Is a Good DSCR? 1.0 vs 1.25 and Below-1.0 Programs Explained",
  "What a good DSCR is for a rental property loan: what 0.75, 1.0, 1.2 and 1.25 mean to lenders, how the ratio affects your rate and loan-to-value, and how to reach 1.25.",
);

const TOC = [
  { id: "answer", title: "The short answer" },
  { id: "levels", title: "DSCR levels explained" },
  { id: "pricing", title: "How DSCR changes your terms" },
  { id: "why-125", title: "Why 1.25 is the benchmark" },
  { id: "commercial", title: "Good DSCR for commercial loans" },
  { id: "reach", title: "Getting to 1.25" },
];

const FAQS: Faq[] = [
  {
    q: "Is a DSCR of 1.1 good?",
    text: "A DSCR of 1.1 means rent exceeds the payment by 10%. Many DSCR lenders approve it, but often at a higher rate or lower maximum loan-to-value than for 1.20 or 1.25.",
    a: <>It means rent exceeds the payment by 10%. Many lenders approve it, often at a higher rate or lower max LTV than 1.20–1.25.</>,
  },
  {
    q: "Is a higher DSCR always better?",
    text: "For qualifying, yes. For returns, not necessarily: a very high DSCR often means you used little leverage, so your cash-on-cash return may be lower. Most investors aim to clear the lender's best-pricing threshold rather than maximize the ratio.",
    a: <>For qualifying, yes. For returns, not always: a very high ratio often means low leverage and a lower cash-on-cash return. Most investors aim to clear the best-pricing threshold, not maximize the ratio.</>,
  },
  {
    q: "What DSCR do banks require?",
    text: "Banks and commercial lenders often require 1.20 to 1.35 on an NOI basis for commercial and multifamily loans. Residential DSCR lenders commonly accept 1.00 and up on a rent ÷ PITIA basis.",
    a: <>Banks and commercial lenders often require 1.20–1.35 on an NOI basis. Residential DSCR lenders commonly accept 1.00 and up on rent ÷ PITIA.</>,
  },
];

export default function Page() {
  return (
    <PageShell
      path={PATH}
      kicker="Guide · Benchmarks"
      title="What Is a Good DSCR Ratio?"
      lede="What lenders read into your debt service coverage ratio, from below 1.0 to 1.25 and above, and how each level changes the loan you can get."
      toc={TOC}
      faqs={FAQS}
      related={["/", "/how-to-improve-dscr", "/dscr-loan-requirements", "/dscr-formula"]}
    >
      <h2 id="answer">What is a good DSCR?</h2>
      <p className="answer">
        For a rental property loan, a DSCR of <strong>1.25 or higher</strong> is considered strong and usually earns a
        lender&apos;s best rates and highest loan-to-value. <strong>1.00 to 1.24</strong> is acceptable to most DSCR
        lenders. Below 1.00, rent doesn&apos;t cover the payment and only specialty no-ratio programs will lend.
      </p>

      <h2 id="levels">DSCR levels explained</h2>
      <div className="table-wrap">
        <table>
          <thead><tr><th>DSCR</th><th>What it means</th><th>Typical lender response</th></tr></thead>
          <tbody>
            <tr><td>Below 0.75</td><td>Rent covers under 75% of the payment</td><td>Generally ineligible</td></tr>
            <tr><td>0.75 – 0.99</td><td>Negative cash flow before other costs</td><td>No-ratio programs only, with 25–35% down and higher rates</td></tr>
            <tr><td>1.00 – 1.19</td><td>Rent covers the payment with little to spare</td><td>Widely accepted; may cap LTV or add to the rate</td></tr>
            <tr><td>1.20 – 1.24</td><td>Comfortable margin</td><td>Qualifies with most lenders</td></tr>
            <tr><td>1.25 and up</td><td>25%+ cushion</td><td>Best pricing and maximum leverage at many lenders</td></tr>
          </tbody>
        </table>
      </div>
      <p>
        See where your deal lands with the <Link href="/">DSCR calculator</Link>; the result panel uses these same bands.
      </p>

      <h2 id="pricing">How your DSCR changes your loan terms</h2>
      <p>
        DSCR lenders price on a grid. The ratio is one axis; credit score and loan-to-value are the others. Moving up a
        DSCR tier can lower your rate, raise the maximum LTV, or both. Falling from 1.25 to 1.10, for example, might mean
        a slightly higher rate or needing 25% down instead of 20%. Exact steps differ by lender, so compare the full
        pricing, not just the minimum ratio.
      </p>

      <h2 id="why-125">Why 1.25 became the benchmark</h2>
      <p>
        A 1.25 ratio means a property earns 25% more than its payment. That margin absorbs a month of vacancy, a repair
        or a tax increase without the owner covering the mortgage. Commercial lenders have long used 1.20 to 1.25 as
        their underwriting floor, and many residential DSCR lenders adopted the same figure as their top pricing tier.
      </p>
      <p>
        Remember that the residential figure uses gross rent. Once you subtract vacancy, management and maintenance, a
        1.25 rent-based DSCR typically works out to roughly 1.05 to 1.15 on a net operating income basis, depending
        on your expenses. Good, but not as
        much cushion as the headline number suggests.
      </p>

      <h2 id="commercial">What is a good DSCR for commercial loans?</h2>
      <p>
        Banks, credit unions and agency multifamily lenders work from net operating income. They commonly require
        <strong> 1.20 to 1.35</strong>, with higher minimums for riskier property types like hospitality. The NOI method
        is explained in the <Link href="/dscr-formula">DSCR formula guide</Link>.
      </p>

      <h2 id="reach">How to get to 1.25</h2>
      <p>
        On our example property (rent $2,500, $300,000 price, 7.5% rate, 30 years), DSCR is 1.20 at 20% down. Moving to
        25% down takes it to 1.27. Holding 20% down, an interest-only payment takes it to 1.32 and a 40-year term to
        1.26. The full list of levers is in <Link href="/how-to-improve-dscr">how to improve your DSCR</Link>, and the
        calculator&apos;s sensitivity table shows exactly which rate and down payment combinations reach 1.25 for your
        property.
      </p>
    </PageShell>
  );
}

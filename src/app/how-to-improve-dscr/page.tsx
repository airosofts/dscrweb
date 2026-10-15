import Link from "next/link";
import { PageShell, type Faq } from "@/components/seo/PageShell";
import { pageMeta } from "@/lib/meta";

const PATH = "/how-to-improve-dscr";
export const metadata = pageMeta(
  PATH,
  "How to Improve Your DSCR: 8 Ways to Qualify for a DSCR Loan",
  "Eight practical ways to raise a rental property's DSCR before you apply: down payment, rate buy-downs, interest-only, longer terms, insurance, taxes, rent and HOA.",
);

const TOC = [
  { id: "levers", title: "The two sides of the ratio" },
  { id: "down", title: "1. Put more down" },
  { id: "rate", title: "2. Buy down the rate" },
  { id: "io", title: "3. Interest-only" },
  { id: "term", title: "4. 40-year term" },
  { id: "insurance", title: "5. Shop insurance" },
  { id: "taxes", title: "6. Check the tax figure" },
  { id: "rent", title: "7. Support higher rent" },
  { id: "price", title: "8. Negotiate the price" },
  { id: "compare", title: "Comparing the levers" },
];

const FAQS: Faq[] = [
  {
    q: "Can I add income from other properties to raise DSCR?",
    text: "No. DSCR is calculated property by property. Income from your other rentals or your job does not count toward a specific property's ratio, although strong reserves and credit can help with overall pricing.",
    a: <>No. DSCR is calculated per property. Other rentals or your job don&apos;t count toward a property&apos;s ratio, though reserves and credit help overall pricing.</>,
  },
  {
    q: "Does property management count against DSCR?",
    text: "Not in the standard lender formula, which divides gross rent by PITIA. Management fees do reduce net operating income, so they lower DSCR calculated on an NOI basis.",
    a: <>Not in the standard lender formula (gross rent ÷ PITIA). They do reduce NOI, so they lower NOI-based DSCR.</>,
  },
];

export default function Page() {
  return (
    <PageShell
      path={PATH}
      kicker="Guide · Strategy"
      title="How to Improve Your DSCR"
      lede="Eight ways to raise a rental property's debt service coverage ratio before you apply, with the effect of each on a real example."
      toc={TOC}
      faqs={FAQS}
      related={["/", "/what-is-a-good-dscr", "/interest-only-dscr-loan", "/dscr-loan-down-payment"]}
    >
      <h2 id="levers">The two sides of the ratio</h2>
      <p>
        DSCR is rent divided by PITIA, so there are only two ways to move it: raise the rent the lender will count, or
        lower the monthly payment. Every tactic below does one of the two. Figures use our{" "}
        <Link href="/">calculator&apos;s</Link> default property: $300,000 price, 20% down, 7.5% for 30 years, $2,500
        rent, $3,600 taxes and $1,200 insurance a year. Starting DSCR: <strong>1.20</strong>.
      </p>

      <h2 id="down">1. Put more money down</h2>
      <p>
        A smaller loan means a smaller payment. Going from 20% to 25% down cuts principal and interest by about $105 a
        month and lifts DSCR to <strong>1.27</strong>. At 30% down it reaches 1.34. This is the most reliable lever, but
        it ties up more cash and lowers your cash-on-cash return.
      </p>

      <h2 id="rate">2. Buy down the interest rate</h2>
      <p>
        Paying points at closing lowers the rate. On the example, 7.0% instead of 7.5% raises DSCR to <strong>1.25</strong>.
        Ask the lender for the cost per 0.125% and compare it to the cash you&apos;d otherwise add as down payment.
        Choosing a longer prepayment penalty can also lower the rate on many DSCR loans.
      </p>

      <h2 id="io">3. Choose an interest-only period</h2>
      <p>
        Interest-only payments skip principal, so the payment drops from $1,678 to $1,500 and DSCR rises to{" "}
        <strong>1.32</strong>. Many lenders qualify interest-only loans on the interest-only payment. You won&apos;t pay
        down the balance during the IO period. More in{" "}
        <Link href="/interest-only-dscr-loan">interest-only DSCR loans</Link>.
      </p>

      <h2 id="term">4. Take a 40-year term</h2>
      <p>
        Stretching amortization from 30 to 40 years lowers principal and interest to about $1,579 and lifts DSCR to{" "}
        <strong>1.26</strong>. You&apos;ll pay considerably more interest over the life of the loan.
      </p>

      <h2 id="insurance">5. Shop the insurance premium</h2>
      <p>
        Insurance sits inside PITIA, and quotes for landlord policies vary widely. Cutting $1,200 a year to $900 saves
        $25 a month. Small on its own, but it can be the difference between 1.24 and 1.25. Check whether flood
        insurance is truly required for the property.
      </p>

      <h2 id="taxes">6. Check the property tax figure</h2>
      <p>
        Lenders often estimate taxes on the purchase price, which may be higher than the current bill. Confirm the
        figure the lender is using, and if the assessment looks high, look into the appeal process in that county.
      </p>

      <h2 id="rent">7. Support a higher rent</h2>
      <p>
        If the appraiser&apos;s market rent looks low, send the lender comparable listings and leases for similar
        nearby properties to pass to the appraiser. On an occupied property, a renewed lease at market rent, or proof
        you&apos;ve been receiving a higher amount, can help. Raising rent by $100 lifts the example DSCR to 1.25.
      </p>

      <h2 id="price">8. Negotiate the price or skip the HOA</h2>
      <p>
        A lower price means a smaller loan at the same down payment. And because HOA dues are part of PITIA, a $250
        monthly HOA costs the same DSCR as a $250 higher mortgage payment. Use the calculator&apos;s reverse solver to
        find the maximum price that still hits your target.
      </p>

      <h2 id="compare">Comparing the levers</h2>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Change from the example</th><th className="num">New DSCR</th><th>Trade-off</th></tr></thead>
          <tbody>
            <tr><td>None (20% down, 7.5%, 30 yr)</td><td className="num">1.20</td><td>—</td></tr>
            <tr><td>25% down</td><td className="num">1.27</td><td>$15,000 more cash</td></tr>
            <tr><td>Rate 7.0%</td><td className="num">1.25</td><td>Points at closing</td></tr>
            <tr><td>Interest-only</td><td className="num">1.32</td><td>No principal paydown</td></tr>
            <tr><td>40-year term</td><td className="num">1.26</td><td>More lifetime interest</td></tr>
            <tr><td>Rent +$100</td><td className="num">1.25</td><td>Must be supported by market</td></tr>
          </tbody>
        </table>
      </div>
    </PageShell>
  );
}

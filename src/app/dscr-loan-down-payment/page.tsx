import Link from "next/link";
import { PageShell, type Faq } from "@/components/seo/PageShell";
import { pageMeta } from "@/lib/meta";

const PATH = "/dscr-loan-down-payment";
export const metadata = pageMeta(
  PATH,
  "DSCR Loan Down Payment: How Much Do You Need in 2026?",
  "Most DSCR loans need 20–25% down. See what drives the requirement, how down payment changes your DSCR, cash-out limits, and the total cash you need to close.",
);

const TOC = [
  { id: "answer", title: "How much down?" },
  { id: "drivers", title: "What sets your down payment" },
  { id: "effect", title: "How down payment moves DSCR" },
  { id: "cash", title: "Total cash to close" },
  { id: "refi", title: "Refinance and cash-out" },
  { id: "less", title: "Putting less down" },
];

const FAQS: Faq[] = [
  {
    q: "Can I get a DSCR loan with 10% down?",
    text: "It's uncommon. A small number of programs go to 85% loan-to-value for strong borrowers, typically requiring high credit scores and a DSCR well above 1.0. Most lenders cap purchases at 75–80% LTV.",
    a: <>It&apos;s uncommon. A few programs reach 85% LTV for strong borrowers with high credit and DSCR well above 1.0. Most cap purchases at 75–80%.</>,
  },
  {
    q: "Can the down payment be gifted?",
    text: "Some DSCR lenders accept gift funds for the down payment, often with limits, while others require the down payment to come from the borrower's own or the business's funds. Reserves usually must be the borrower's own.",
    a: <>Some lenders accept gifts, often with limits; others require your own or your company&apos;s funds. Reserves usually must be your own.</>,
  },
];

export default function Page() {
  return (
    <PageShell
      path={PATH}
      kicker="Guide · Down payment"
      title="DSCR Loan Down Payment"
      lede="How much you need to put down on a DSCR loan, why it varies from deal to deal, and how a bigger down payment raises your DSCR."
      toc={TOC}
      faqs={FAQS}
      related={["/dscr-loan-requirements", "/", "/how-to-improve-dscr", "/cash-on-cash-return-calculator"]}
    >
      <h2 id="answer">How much down payment does a DSCR loan require?</h2>
      <p className="answer">
        Most DSCR loans require <strong>20% to 25% down</strong> on a purchase, meaning a maximum loan-to-value of 75% to
        80%. Expect to need more for a DSCR below 1.0, a credit score under about 680, a short-term rental, some condos,
        or a first-time investor at certain lenders.
      </p>

      <h2 id="drivers">What sets your down payment</h2>
      <p>Lenders lower the maximum loan-to-value as risk rises. The main factors:</p>
      <ul>
        <li><strong>DSCR:</strong> ratios of 1.20–1.25+ usually unlock the highest LTV; ratios near or below 1.0 cap it.</li>
        <li><strong>Credit score:</strong> scores around 720+ often reach 80% LTV; lower scores may be capped at 70–75%.</li>
        <li><strong>Loan size:</strong> very large loans often have lower LTV limits.</li>
        <li><strong>Property type:</strong> short-term rentals, non-warrantable condos and 2–4 units may need more down.</li>
        <li><strong>Transaction:</strong> cash-out refinances carry lower limits than purchases.</li>
      </ul>

      <h2 id="effect">How down payment moves your DSCR</h2>
      <p>
        A bigger down payment means a smaller loan and payment, so DSCR rises. On a $300,000 rental renting for $2,500,
        at 7.5% over 30 years with $3,600 taxes and $1,200 insurance a year:
      </p>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Down payment</th><th className="num">Cash down</th><th className="num">Loan</th><th className="num">DSCR</th></tr></thead>
          <tbody>
            <tr><td>15%</td><td className="num">$45,000</td><td className="num">$255,000</td><td className="num">1.15</td></tr>
            <tr><td>20%</td><td className="num">$60,000</td><td className="num">$240,000</td><td className="num">1.20</td></tr>
            <tr><td>25%</td><td className="num">$75,000</td><td className="num">$225,000</td><td className="num">1.27</td></tr>
            <tr><td>30%</td><td className="num">$90,000</td><td className="num">$210,000</td><td className="num">1.34</td></tr>
          </tbody>
        </table>
      </div>
      <p>
        Run your own property in the <Link href="/">DSCR calculator</Link>; its sensitivity table shows DSCR at 15–30%
        down across nearby rates.
      </p>

      <h2 id="cash">Total cash you need to close</h2>
      <p>The down payment is only part of it. Budget for:</p>
      <ul>
        <li><strong>Down payment:</strong> 20–25% of the price.</li>
        <li><strong>Closing costs:</strong> commonly 2–5% of the loan, including points, appraisal, title and escrow.</li>
        <li><strong>Reserves:</strong> often 3–12 months of PITIA left in the bank after closing.</li>
        <li><strong>Prepaid items:</strong> first-year insurance and an initial tax escrow deposit.</li>
      </ul>
      <p>
        On the $300,000 example at 20% down, that&apos;s roughly $60,000 down, $5,000–$12,000 in closing costs, and
        $6,000–$25,000 in reserves.
      </p>

      <h2 id="refi">Refinances and cash-out</h2>
      <p>
        On a rate-and-term refinance, many lenders allow up to 75–80% LTV. Cash-out refinances are usually capped at
        about 70–75%. If you bought recently, the lender may use the lower of the purchase price plus documented
        improvements and the new appraisal until a seasoning period, often 3 to 6 months, has passed.
      </p>

      <h2 id="less">Ways to put less down</h2>
      <ul>
        <li>Improve your credit score before applying to qualify for a higher LTV tier.</li>
        <li>Choose a property with stronger rent relative to price, which raises DSCR.</li>
        <li>Use a seller credit toward closing costs to preserve cash for the down payment.</li>
        <li>Consider a BRRRR approach: buy and rehab with short-term financing, then refinance into a DSCR loan.</li>
      </ul>
    </PageShell>
  );
}

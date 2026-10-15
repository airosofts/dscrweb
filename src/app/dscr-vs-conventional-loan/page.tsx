import Link from "next/link";
import { PageShell, type Faq } from "@/components/seo/PageShell";
import { pageMeta } from "@/lib/meta";

const PATH = "/dscr-vs-conventional-loan";
export const metadata = pageMeta(
  PATH,
  "DSCR Loan vs Conventional Loan for Investment Property",
  "DSCR vs conventional investment property loans compared: how you qualify, rates, down payment, property limits, LLC ownership and which one fits your situation.",
);

const TOC = [
  { id: "compare", title: "Side-by-side comparison" },
  { id: "qualify", title: "How you qualify" },
  { id: "cost", title: "Cost" },
  { id: "scale", title: "Scaling a portfolio" },
  { id: "choose", title: "Which to choose" },
];

const FAQS: Faq[] = [
  {
    q: "Is a DSCR loan more expensive than a conventional loan?",
    text: "Usually yes. DSCR loans typically carry a higher rate and may include a prepayment penalty, in exchange for no personal income documentation and more flexibility.",
    a: <>Usually. Expect a higher rate and often a prepayment penalty, in exchange for no income documentation and more flexibility.</>,
  },
  {
    q: "Can I refinance from a DSCR loan into a conventional loan later?",
    text: "Yes, if you qualify for conventional financing and the property is in your personal name, but watch for any prepayment penalty on the DSCR loan.",
    a: <>Yes, if you qualify conventionally and hold the property in your own name. Watch for any prepayment penalty on the DSCR loan.</>,
  },
];

export default function Page() {
  return (
    <PageShell
      path={PATH}
      kicker="Guide · Comparison"
      title="DSCR Loan vs Conventional Loan"
      lede="Two very different ways to finance a rental. Here's how they compare on qualification, cost and flexibility, and how to pick."
      toc={TOC}
      faqs={FAQS}
      related={["/dscr-loan", "/dscr-loan-requirements", "/", "/dscr-loan-down-payment"]}
    >
      <h2 id="compare">Side-by-side comparison</h2>
      <div className="table-wrap">
        <table>
          <thead><tr><th></th><th>DSCR loan</th><th>Conventional investment loan</th></tr></thead>
          <tbody>
            <tr><td>Qualifies on</td><td>Property rent vs payment</td><td>Your personal income and debt-to-income</td></tr>
            <tr><td>Income documents</td><td>None from the borrower</td><td>Tax returns, W-2s, pay stubs</td></tr>
            <tr><td>Typical down payment</td><td>20–25%</td><td>15–25% for a single unit</td></tr>
            <tr><td>Rate</td><td>Higher</td><td>Lower</td></tr>
            <tr><td>Prepayment penalty</td><td>Common</td><td>Rare</td></tr>
            <tr><td>LLC ownership</td><td>Usually allowed</td><td>Generally personal name</td></tr>
            <tr><td>Number of properties</td><td>Lender-set, often high</td><td>Up to 10 financed properties (Fannie Mae)</td></tr>
            <tr><td>Interest-only option</td><td>Common</td><td>Rare</td></tr>
            <tr><td>Speed</td><td>Often 2–4 weeks</td><td>Often 30–45 days</td></tr>
          </tbody>
        </table>
      </div>

      <h2 id="qualify">How you qualify</h2>
      <p>
        A conventional loan underwrites <strong>you</strong>: your income, employment and debt-to-income ratio, with
        only part of the rental income counted. A DSCR loan underwrites <strong>the property</strong>: if rent covers
        the payment, measured by the <Link href="/dscr-formula">DSCR formula</Link>, your W-2 or tax return income is
        irrelevant. That&apos;s why self-employed investors, whose returns show income after deductions and
        depreciation, often can&apos;t qualify conventionally but sail through DSCR.
      </p>

      <h2 id="cost">Cost</h2>
      <p>
        Conventional loans are cheaper. DSCR loans typically carry a higher rate, may charge more points, and usually
        include a prepayment penalty unless you pay for a shorter one. If you can comfortably qualify conventionally,
        the lower rate often wins, especially on a property you&apos;ll hold for many years.
      </p>

      <h2 id="scale">Scaling a portfolio</h2>
      <p>
        Conventional financing gets harder with each property: reserve requirements rise and Fannie Mae caps borrowers
        at 10 financed properties. DSCR lenders evaluate each property on its own numbers and generally let you close in
        separate LLCs, which is why growing investors tend to move to DSCR financing after their first few doors.
      </p>

      <h2 id="choose">Which should you choose?</h2>
      <ul>
        <li><strong>Choose conventional</strong> if you have strong documented income, own few properties, and want the lowest rate.</li>
        <li><strong>Choose DSCR</strong> if you&apos;re self-employed, near the conventional property limit, want to close in an LLC, need speed, or want interest-only options.</li>
      </ul>
      <p>
        Either way, check the property&apos;s numbers first with the <Link href="/">DSCR calculator</Link>.
      </p>
    </PageShell>
  );
}

import Link from "next/link";
import { PageShell } from "@/components/seo/PageShell";
import { JsonLd } from "@/components/seo/PageShell";
import { pageMeta } from "@/lib/meta";
import { absUrl } from "@/lib/site";

const PATH = "/dscr-glossary";
export const metadata = pageMeta(
  PATH,
  "DSCR Loan Glossary: PITIA, NOI, LTV, Seasoning & More",
  "Plain-English definitions of every term you'll meet on a DSCR loan: DSCR, PITIA, NOI, LTV, rent schedule, seasoning, reserves, prepayment penalty, non-QM and more.",
);

const TERMS: { term: string; id: string; def: React.ReactNode; text: string }[] = [
  { term: "Amortization", id: "amortization", text: "Paying a loan off through regular payments of principal and interest over its term.", def: <>Paying a loan off through regular payments of principal and interest over its term. A 30-year amortizing loan is fully repaid after 360 payments.</> },
  { term: "Appraisal rent schedule (Form 1007 / 1025)", id: "rent-schedule", text: "The appraiser's estimate of market rent, used by lenders as the qualifying rent on vacant properties.", def: <>The appraiser&apos;s estimate of market rent, on Fannie Mae Form 1007 for single-family or Form 1025 for 2–4 units. Lenders use it as the qualifying rent on vacant properties.</> },
  { term: "BRRRR", id: "brrrr", text: "Buy, rehab, rent, refinance, repeat: a strategy that often ends in a DSCR cash-out refinance.", def: <>Buy, rehab, rent, refinance, repeat. The refinance step is often a DSCR cash-out loan.</> },
  { term: "Cap rate", id: "cap-rate", text: "Net operating income divided by property value.", def: <>Net operating income divided by property value. See the <Link href="/cap-rate-calculator">cap rate calculator</Link>.</> },
  { term: "Cash-on-cash return", id: "cash-on-cash", text: "Annual pre-tax cash flow divided by total cash invested.", def: <>Annual pre-tax cash flow divided by total cash invested. See the <Link href="/cash-on-cash-return-calculator">cash-on-cash calculator</Link>.</> },
  { term: "Cash-out refinance", id: "cash-out", text: "Refinancing for more than you owe and taking the difference in cash.", def: <>Refinancing for more than you owe and taking the difference in cash. DSCR cash-out loans are commonly capped around 70–75% LTV.</> },
  { term: "Debt service", id: "debt-service", text: "The principal and interest payments on a loan over a period.", def: <>The principal and interest payments on a loan over a period, usually a month or a year.</> },
  { term: "DSCR (debt service coverage ratio)", id: "dscr", text: "Income divided by debt payment. For rental loans, gross rent divided by PITIA.", def: <>Income divided by debt payment. For residential DSCR loans, gross rent ÷ PITIA. See the <Link href="/dscr-formula">DSCR formula</Link>.</> },
  { term: "Interest-only (IO)", id: "interest-only", text: "A period in which payments cover only interest, raising DSCR.", def: <>A period in which payments cover only interest. Lowers the payment and raises DSCR. See <Link href="/interest-only-dscr-loan">interest-only DSCR loans</Link>.</> },
  { term: "LTV (loan-to-value)", id: "ltv", text: "Loan amount divided by property value.", def: <>Loan amount divided by property value or price. 80% LTV means 20% down.</> },
  { term: "Market rent", id: "market-rent", text: "The rent a property should command based on comparable rentals.", def: <>The rent a property should command based on comparable rentals, as estimated by the appraiser.</> },
  { term: "No-ratio DSCR loan", id: "no-ratio", text: "A program that lends when DSCR is below 1.0, usually with more down and a higher rate.", def: <>A program that lends when DSCR is below 1.0 or isn&apos;t calculated, usually with more down and a higher rate.</> },
  { term: "Non-QM loan", id: "non-qm", text: "A mortgage outside the Qualified Mortgage rules, such as DSCR loans.", def: <>A mortgage outside the federal Qualified Mortgage rules. DSCR loans are non-QM business-purpose loans.</> },
  { term: "NOI (net operating income)", id: "noi", text: "Income after vacancy and operating expenses, before mortgage payments.", def: <>Income after vacancy and operating expenses, before mortgage payments. The numerator in commercial DSCR.</> },
  { term: "PITIA", id: "pitia", text: "Principal, interest, taxes, insurance and association dues: the full monthly payment.", def: <>Principal, interest, taxes, insurance and association (HOA) dues: the full monthly payment and the denominator in residential DSCR.</> },
  { term: "Prepayment penalty", id: "prepayment-penalty", text: "A fee for paying off the loan early, common on DSCR loans.", def: <>A fee for paying off the loan early, common on DSCR loans. Often a step-down such as 5-4-3-2-1% over five years.</> },
  { term: "Rate buy-down", id: "buy-down", text: "Paying points at closing to lower the interest rate.", def: <>Paying points at closing to lower the interest rate, which also raises DSCR.</> },
  { term: "Reserves", id: "reserves", text: "Cash or investments left after closing, measured in months of PITIA.", def: <>Cash or investments left after closing, measured in months of PITIA. DSCR lenders commonly want 3 to 12 months.</> },
  { term: "Seasoning", id: "seasoning", text: "How long you've owned a property, which affects cash-out refinance eligibility.", def: <>How long you&apos;ve owned a property. Many lenders require 3 to 6 months before using a new appraised value for cash-out.</> },
  { term: "Vacancy rate", id: "vacancy", text: "The share of potential rent lost to empty periods.", def: <>The share of potential rent lost to empty periods. Used in NOI and cash flow, not in the lender DSCR formula.</> },
];

export default function Page() {
  return (
    <PageShell
      path={PATH}
      kicker="Reference"
      title="DSCR Loan Glossary"
      lede="Plain-English definitions of the terms you'll see on DSCR loan quotes, appraisals and closing documents."
      toc={TERMS.map((t) => ({ id: t.id, title: t.term.replace(/ \(.*\)$/, "") }))}
      related={["/dscr-formula", "/dscr-loan", "/dscr-loan-requirements", "/"]}
    >
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "DefinedTermSet",
          name: "DSCR Loan Glossary",
          url: absUrl(PATH),
          hasDefinedTerm: TERMS.map((t) => ({ "@type": "DefinedTerm", name: t.term, description: t.text, url: `${absUrl(PATH)}#${t.id}` })),
        }}
      />
      <dl className="!mt-0 flex flex-col">
        {TERMS.map((t) => (
          <div key={t.id} id={t.id} className="scroll-mt-28 border-b border-rule py-5 first:pt-0">
            <dt className="text-[18px] font-bold text-ink">{t.term}</dt>
            <dd className="mt-1.5">{t.def}</dd>
          </div>
        ))}
      </dl>
    </PageShell>
  );
}

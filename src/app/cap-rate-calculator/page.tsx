import Link from "next/link";
import { RentalCalculator } from "@/components/calc/RentalCalculator";
import { PageShell, type Faq } from "@/components/seo/PageShell";
import { pageMeta } from "@/lib/meta";

const PATH = "/cap-rate-calculator";
export const metadata = pageMeta(
  PATH,
  "Cap Rate Calculator for Rental Property (Free) | DSCR Calculator Pro",
  "Free cap rate calculator: net operating income divided by purchase price, with vacancy, operating expenses and reserves. Learn what a good cap rate is and how it relates to DSCR.",
);

const TOC = [
  { id: "formula", title: "Cap rate formula" },
  { id: "example", title: "Example" },
  { id: "good", title: "What is a good cap rate?" },
  { id: "dscr", title: "Cap rate and DSCR" },
];

const FAQS: Faq[] = [
  {
    q: "Does cap rate include the mortgage?",
    text: "No. Cap rate uses net operating income, which is before debt service, so it measures the property independent of how it's financed.",
    a: <>No. It uses NOI, before debt service, so it measures the property independent of financing.</>,
  },
  {
    q: "Is a higher cap rate better?",
    text: "A higher cap rate means more income per dollar of price, but it often reflects more risk, an older property or a weaker location. Investors weigh cap rate against risk and growth.",
    a: <>It means more income per dollar of price, but often reflects more risk, an older property or a weaker location.</>,
  },
];

export default function Page() {
  return (
    <PageShell
      path={PATH}
      kicker="Calculator · Cap rate"
      title="Cap Rate Calculator"
      lede="Capitalization rate measures a rental's income against its price, before financing. Enter the property's income and costs to calculate it."
      tool={<RentalCalculator focus="caprate" />}
      schemaType="WebApplication"
      toc={TOC}
      faqs={FAQS}
      related={["/rental-property-cash-flow-calculator", "/cash-on-cash-return-calculator", "/", "/dscr-glossary"]}
    >
      <h2 id="formula">Cap rate formula</h2>
      <p className="formula">Cap rate = Annual net operating income ÷ Purchase price × 100</p>
      <p>
        Net operating income is rent minus vacancy and operating expenses (taxes, insurance, management, maintenance,
        reserves, HOA and owner-paid utilities), before any mortgage payment.
      </p>

      <h2 id="example">Example</h2>
      <p>
        The default property earns $2,500 a month. After 5% vacancy and $840 of monthly operating costs including
        reserves, NOI is $1,535 a month or <strong>$18,420 a year</strong>. Divided by a $300,000 price, the cap rate is{" "}
        <strong>6.14%</strong>.
      </p>

      <h2 id="good">What is a good cap rate?</h2>
      <p>
        It depends on the market and property type. Single-family rentals in expensive coastal metros may trade at 4–5%,
        while many Midwest and Southern markets offer 6–9% or more, usually with more tenant and maintenance risk. Compare
        a property&apos;s cap rate to similar properties nearby and to your financing cost: when the cap rate is below
        your mortgage rate, leverage reduces your cash return.
      </p>

      <h2 id="dscr">How cap rate relates to DSCR</h2>
      <p>
        A higher cap rate means more income per dollar of price, which makes a strong DSCR easier to reach at a given
        loan-to-value. If a property&apos;s cap rate is well below current mortgage rates, expect a low DSCR unless you
        put more down. Check the financing side with the <Link href="/">DSCR calculator</Link>.
      </p>
    </PageShell>
  );
}

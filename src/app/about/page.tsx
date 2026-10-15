import Link from "next/link";
import { PageShell } from "@/components/seo/PageShell";
import { pageMeta } from "@/lib/meta";

const PATH = "/about";
export const metadata = pageMeta(
  PATH,
  "About DSCR Calculator Pro",
  "DSCR Calculator Pro builds free debt service coverage ratio tools for real estate investors. Who we are, what we build, and how we keep our calculators accurate.",
);

export default function Page() {
  return (
    <PageShell
      path={PATH}
      kicker="About"
      title="About DSCR Calculator Pro"
      lede="Free tools for the question every rental investor asks before making an offer: will this property qualify, and will it pay for itself?"
      related={["/methodology", "/advertiser-disclosure", "/app", "/contact"]}
    >
      <h2 id="what">What we build</h2>
      <p>
        DSCR Calculator Pro is a free iPhone app and website for analyzing rental properties the way DSCR lenders do. We
        started it because the calculators investors found online were mostly lead forms for a single lender, often with
        inconsistent formulas and no explanation of how the number was produced.
      </p>
      <p>
        Our tools show both the lender (rent ÷ PITIA) and NOI versions of DSCR, work backwards to a maximum loan, and
        explain every assumption on our <Link href="/methodology">methodology</Link> page. No account is required.
      </p>

      <h2 id="who">Who we are</h2>
      <p>
        DSCR Calculator Pro is built and operated by Airosofts LLC, a software company based in Lexington, Kentucky. We
        are <strong>not a lender or mortgage broker</strong>, we don&apos;t take loan applications, and we don&apos;t sell
        your information.
      </p>

      <h2 id="money">How we make money</h2>
      <p>
        The app shows clearly labeled advertising from lenders and other real estate businesses. Advertisers have no say
        over our formulas, defaults or guides. Details are in our{" "}
        <Link href="/advertiser-disclosure">advertiser disclosure</Link>.
      </p>

      <h2 id="contact">Get in touch</h2>
      <p>
        Spot a mistake, or want a calculator we don&apos;t have yet? <Link href="/contact">Contact us</Link>.
      </p>
    </PageShell>
  );
}

import Link from "next/link";
import { PageShell } from "@/components/seo/PageShell";
import { pageMeta } from "@/lib/meta";

const PATH = "/terms";
export const metadata = pageMeta(
  PATH,
  "Terms of Use | DSCR Calculator Pro",
  "Terms of use for the DSCR Calculator Pro website and calculators.",
);

export default function Page() {
  return (
    <PageShell
      path={PATH}
      kicker="Legal"
      title="Terms of Use"
      lede="The rules for using dscrcalculator.pro and its calculators. Plain English, kept short."
      related={["/privacy", "/advertiser-disclosure", "/methodology", "/contact"]}
    >
      <h2 id="use">Using the site</h2>
      <p>
        You may use our calculators and guides for your own personal and business analysis. Please don&apos;t copy the
        site&apos;s content wholesale, scrape it at scale, or attempt to disrupt the service.
      </p>

      <h2 id="no-advice">Not financial, legal or lending advice</h2>
      <p>
        Everything on this site is for educational purposes. Results are estimates based on the inputs you provide and
        the formulas on our <Link href="/methodology">methodology</Link> page. They are not loan offers, approvals,
        rate quotes, or financial, tax or legal advice. Lenders set their own guidelines and calculate your actual DSCR.
        Confirm any decision with a licensed professional.
      </p>

      <h2 id="accuracy">Accuracy</h2>
      <p>
        We work to keep our formulas and typical market ranges accurate and up to date, but we don&apos;t guarantee that
        any figure is complete, current or suitable for your situation.
      </p>

      <h2 id="liability">Limitation of liability</h2>
      <p>
        The site is provided &ldquo;as is&rdquo;. To the extent permitted by law, Airosofts LLC is not liable for losses
        arising from your use of the site or reliance on its results.
      </p>

      <h2 id="ads">Advertisers and third-party links</h2>
      <p>
        We aren&apos;t responsible for third-party websites or for products and services offered by advertisers. See our{" "}
        <Link href="/advertiser-disclosure">advertiser disclosure</Link>.
      </p>

      <h2 id="changes">Changes and contact</h2>
      <p>
        We may update these terms; the version on this page applies. Questions? <Link href="/contact">Contact us</Link>.
      </p>
    </PageShell>
  );
}

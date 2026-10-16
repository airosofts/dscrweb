import Image from "next/image";
import Link from "next/link";
import { JsonLd, PageShell } from "@/components/seo/PageShell";
import { pageMeta } from "@/lib/meta";
import { APP_STORE_URL, SITE_NAME, absUrl } from "@/lib/site";

const PATH = "/app";
export const metadata = pageMeta(
  PATH,
  "DSCR Calculator App for iPhone (Free) | DSCR Calculator Pro",
  "Free DSCR calculator app for iPhone. Calculate DSCR, cash flow, cap rate and cash-on-cash return, closing costs and refinance proceeds, and share a lender-ready PDF. No account needed.",
);

export default function Page() {
  return (
    <PageShell
      path={PATH}
      kicker="iPhone app"
      title="DSCR Calculator for iPhone"
      lede="Underwrite rental deals in seconds, anywhere. The same math as this website, built for the moment you're standing in front of a property."
      related={["/", "/methodology", "/guides", "/rental-property-cash-flow-calculator"]}
    >
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "MobileApplication",
          name: SITE_NAME,
          operatingSystem: "iOS",
          applicationCategory: "FinanceApplication",
          url: absUrl(PATH),
          installUrl: APP_STORE_URL,
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          publisher: { "@id": `${absUrl("/")}#organization` },
        }}
      />
      <div className="!mt-0 grid grid-cols-[1fr_240px] items-start gap-10 max-[700px]:grid-cols-1">
        <div>
          <h2 id="features" className="!mt-0">What the app does</h2>
          <ul>
            <li><strong>DSCR, cash flow, cap rate and cash-on-cash</strong> from one set of inputs.</li>
            <li><strong>Amortizing and interest-only</strong> loans, purchase or refinance.</li>
            <li><strong>Closing costs and cash to close</strong>, including origination, title and reserves.</li>
            <li><strong>Lender-ready PDF export</strong> to send to a lender, partner or broker.</li>
            <li><strong>No account, no signup.</strong> Open it and start calculating.</li>
          </ul>
          <p>
            <a href={APP_STORE_URL} className="btn-brass !text-cream !no-underline">Download free on the App Store →</a>
          </p>
          <h2 id="same-math">The same math as the website</h2>
          <p>
            The app and this site share one formula set, documented on our <Link href="/methodology">methodology</Link> page:
            the same inputs, closing costs and refinance math, and the same lender DSCR (gross rent ÷ PITIA) from app
            version 1.0.4. The website adds a few extras, like vacancy, the NOI method and a max-loan solver; the app is
            built for running numbers on your phone and sharing a PDF summary in a tap.
          </p>
        </div>
        <div className="overflow-hidden border-2 border-brass/20 shadow-[0_20px_50px_rgba(10,22,40,0.25)]" style={{ borderRadius: 28 }}>
          <Image src="/2.png" alt="DSCR Calculator Pro app showing a DSCR result" width={280} height={607} className="block w-full" />
        </div>
      </div>
    </PageShell>
  );
}

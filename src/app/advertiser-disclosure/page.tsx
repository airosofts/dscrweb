import Link from "next/link";
import { PageShell } from "@/components/seo/PageShell";
import { pageMeta } from "@/lib/meta";

const PATH = "/advertiser-disclosure";
export const metadata = pageMeta(
  PATH,
  "Advertiser Disclosure | DSCR Calculator Pro",
  "How DSCR Calculator Pro makes money through labeled advertising from lenders and real estate businesses, and how we keep it separate from our calculators and guides.",
);

export default function Page() {
  return (
    <PageShell
      path={PATH}
      kicker="Disclosure"
      title="Advertiser Disclosure"
      lede="We're free because businesses that serve real estate investors pay to advertise in our app. Here's exactly how that works."
      related={["/about", "/methodology", "/terms", "/privacy"]}
    >
      <h2 id="not-lender">We are not a lender</h2>
      <p>
        DSCR Calculator Pro does not make loans, arrange loans, or take loan applications. Nothing on this site or in the
        app is an offer to lend or a guarantee of approval or terms.
      </p>

      <h2 id="ads">How advertising works</h2>
      <ul>
        <li>DSCR lenders, title companies, insurers and other real estate businesses can buy banner and full-screen ad placements in the iPhone app.</li>
        <li>Paid placements are visually distinct from our tools and content.</li>
        <li>Links to advertisers are marked as sponsored.</li>
        <li>We may receive payment whether or not you click an ad or do business with the advertiser.</li>
      </ul>

      <h2 id="independence">Editorial independence</h2>
      <p>
        Advertisers cannot change our formulas, default values, result descriptions or guides, and buying an ad never
        includes a link, a mention or a review on this website. If a guide ever refers to a specific lender that also
        advertises with us, we will say so next to the reference.
      </p>

      <h2 id="questions">Questions</h2>
      <p>
        <Link href="/contact">Contact us</Link> with any question about this policy.
      </p>
    </PageShell>
  );
}

import Link from "next/link";
import { PageShell } from "@/components/seo/PageShell";
import { pageMeta } from "@/lib/meta";
import { pagesIn } from "@/lib/site";

const PATH = "/guides";
export const metadata = pageMeta(
  PATH,
  "DSCR Guides & Real Estate Calculators | DSCR Calculator Pro",
  "Every free DSCR calculator and guide in one place: DSCR formula, loan requirements, down payment, interest-only and short-term rental loans, cash flow, cap rate and more.",
);

function Cards({ group }: { group: "calculators" | "guides" }) {
  return (
    <ul className="!mt-5 grid grid-cols-2 gap-3 !pl-0 [list-style:none] max-[640px]:grid-cols-1">
      {pagesIn(group).map((p) => (
        <li key={p.path} className="!mt-0">
          <Link href={p.path} className="group flex h-full flex-col border border-rule bg-card p-5 !no-underline transition-colors hover:border-brass/60">
            <span className="text-[16px] font-bold text-ink">{p.label} →</span>
            <span className="mt-1 text-[14px] leading-[1.5] text-slate">{p.blurb}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function Page() {
  return (
    <PageShell
      path={PATH}
      kicker="Library"
      title="DSCR Guides & Calculators"
      lede="Free tools and plain-English guides for qualifying and analyzing rental properties with DSCR loans."
      related={[]}
    >
      <h2 id="calculators">Calculators</h2>
      <Cards group="calculators" />
      <h2 id="guides">Guides</h2>
      <Cards group="guides" />
    </PageShell>
  );
}

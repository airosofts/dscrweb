import Link from "next/link";
import { pagesIn } from "@/lib/site";

const COMPANY = [
  { href: "/about", label: "About" },
  { href: "/methodology", label: "Methodology" },
  { href: "/app", label: "iPhone App" },
  { href: "/contact", label: "Contact" },
  { href: "/advertise", label: "Advertise" },
  { href: "/advertiser-disclosure", label: "Advertiser Disclosure" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

export function Footer() {
  return (
    <footer className="site-chrome relative z-10 border-t border-brass/10 bg-ink px-6 pb-8 pt-14">
      <div className="mx-auto grid max-w-[1120px] grid-cols-[1.2fr_1fr_1fr_1fr] gap-10 max-[900px]:grid-cols-2 max-[480px]:grid-cols-1">
        <div>
          <div className="text-[13px] font-extrabold uppercase tracking-[0.14em] text-cream">DSCR Calculator Pro</div>
          <p className="mt-2 max-w-[280px] text-[13px] leading-[1.6] text-muted">
            Free debt service coverage ratio tools for real estate investors. Not a lender.
          </p>
        </div>
        <FootCol title="Calculators" links={pagesIn("calculators").map((p) => ({ href: p.path, label: p.label }))} />
        <FootCol title="Guides" links={pagesIn("guides").map((p) => ({ href: p.path, label: p.label }))} />
        <FootCol title="Company" links={COMPANY} />
      </div>
      <div className="mx-auto mt-12 max-w-[1120px] border-t border-brass/10 pt-6 font-mono text-[10px] tracking-[0.04em] text-muted/60">
        © {new Date().getFullYear()} DSCR Calculator Pro · Educational tools only, not a loan offer or commitment to lend.
      </div>
    </footer>
  );
}

function FootCol({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <div className="mb-3 font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-brass">{title}</div>
      <ul className="flex flex-col gap-2">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="text-[13px] text-cream/60 transition-colors hover:text-cream">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

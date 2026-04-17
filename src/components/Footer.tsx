import Link from "next/link";

export function Footer() {
  return (
    <footer className="relative z-10 px-6 py-6">
      <div className="mx-auto flex max-w-[960px] items-center justify-between max-md:flex-col max-md:gap-3 max-md:text-center">
        <span className="font-mono text-[10px] tracking-[0.04em] text-muted opacity-40">
          © 2026 DSCR Calculator Pro
        </span>
        <div className="flex flex-wrap justify-center gap-5">
          <FootLink href="/advertise">Advertise</FootLink>
          <FootLink href="/privacy">Privacy</FootLink>
          <FootLink href="/terms">Terms</FootLink>
          <FootLink href="/contact">Contact</FootLink>
        </div>
      </div>
    </footer>
  );
}

function FootLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-[11px] text-muted opacity-40 transition-opacity hover:opacity-80"
    >
      {children}
    </Link>
  );
}

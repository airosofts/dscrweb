import Image from "next/image";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { PhoneMockup } from "@/components/PhoneMockup";

const FEATURES = [
  "DSCR, LTV & cash flow in one tap",
  "No sign-up, no account required",
  "Built for real estate investors",
];

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-2.5 w-2.5 text-brass">
      <path d="M5 12l5 5L20 7" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 shrink-0">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}

export default function Home() {
  return (
    <>
      <Nav />

      {/* ═══════════════ DESKTOP (md+) ═══════════════ */}
      <main className="relative z-10 hidden min-h-screen items-center justify-center px-6 pb-16 pt-28 md:flex">
        <div className="grid w-full max-w-[1040px] grid-cols-[1fr_380px] items-center gap-16">
          <div>
            <div className="mb-6 flex items-center gap-3 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-brass">
              <span className="h-px w-7 bg-brass" />
              Real Estate Investment Tools
            </div>
            <h1 className="mb-5 text-[56px] font-extrabold leading-[1.05] tracking-[-0.03em] text-cream">
              Underwrite Deals<br />in Seconds
            </h1>
            <p className="mb-8 max-w-[460px] text-[17px] leading-[1.7] text-muted">
              Professional DSCR calculator built for real estate investors.
              Free to download, no account required.
            </p>
            {FEATURES.map((f) => (
              <div key={f} className="mb-3 flex items-center gap-3 text-sm text-muted">
                <span className="flex h-4 w-4 shrink-0 items-center justify-center bg-brass/10">
                  <CheckIcon />
                </span>
                {f}
              </div>
            ))}
            <a
              href="https://apps.apple.com/app/dscr-calculator-pro/id0000000000"
              className="mt-8 inline-flex items-center gap-2.5 bg-cream px-6 py-3 text-ink transition-all hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.25)]"
              id="download"
            >
              <AppleIcon />
              <span className="flex flex-col items-start leading-none">
                <span className="text-[9px] font-medium tracking-[0.03em] text-slate">Download on the</span>
                <span className="mt-0.5 text-base font-bold tracking-[-0.01em]">App Store</span>
              </span>
            </a>
            <div className="mt-3 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-brass">
              Free — No Account Required
            </div>
          </div>
          <PhoneMockup />
        </div>
      </main>

      {/* ═══════════════ MOBILE (<md) ═══════════════ */}
      <div className="relative z-10 md:hidden">
        {/* Hero section */}
        <section className="flex flex-col items-center px-6 pb-10 pt-24 text-center">
          {/* Kicker */}
          <div className="mb-5 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-brass">
            Real Estate Investment Tools
          </div>

          {/* Headline */}
          <h1 className="mb-4 text-[28px] font-extrabold leading-[1.12] tracking-[-0.02em] text-cream">
            Underwrite Deals<br />in Seconds
          </h1>

          {/* Description */}
          <p className="mb-7 max-w-[280px] text-[14px] leading-[1.65] text-muted">
            Professional DSCR calculator built for real estate investors.
            Free to download, no account required.
          </p>

          {/* Features — left-aligned block, centered in page */}
          <div className="mb-8 inline-flex flex-col gap-2.5">
            {FEATURES.map((f) => (
              <div key={f} className="flex items-center gap-2.5 text-[13px] text-muted">
                <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center bg-brass/10">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-2 w-2 text-brass">
                    <path d="M5 12l5 5L20 7" />
                  </svg>
                </span>
                {f}
              </div>
            ))}
          </div>

          {/* App screenshot — framed */}
          <div className="mb-8 w-full max-w-[280px]">
            <div
              className="overflow-hidden border-2 border-brass/15 shadow-[0_20px_50px_rgba(0,0,0,0.45)]"
              style={{ borderRadius: 28 }}
            >
              <Image
                src="/2.png"
                alt="DSCR Calculator Pro"
                width={280}
                height={607}
                className="block w-full"
                priority
              />
            </div>
          </div>

          {/* App Store button */}
          <a
            href="https://apps.apple.com/app/dscr-calculator-pro/id0000000000"
            className="inline-flex items-center gap-2.5 bg-cream px-5 py-2.5 text-ink"
            id="download"
          >
            <AppleIcon />
            <span className="flex flex-col items-start leading-none">
              <span className="text-[8px] font-medium tracking-[0.03em] text-slate">Download on the</span>
              <span className="mt-0.5 text-[14px] font-bold tracking-[-0.01em]">App Store</span>
            </span>
          </a>

          {/* Free tag */}
          <div className="mt-3 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-brass">
            Free — No Account Required
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
}

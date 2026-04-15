import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy — DSCR Calculator Pro",
  description:
    "How DSCR Calculator Pro handles data. We don't require accounts, and calculations stay on your device.",
};

const LAST_UPDATED = "April 15, 2026";

export default function PrivacyPage() {
  return (
    <div className="bg-cream">
      <Nav />

      {/* HERO */}
      <section className="relative overflow-hidden bg-ink pb-20 pt-36 max-[900px]:pt-28">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "repeating-linear-gradient(0deg,transparent,transparent 59px,rgba(155,123,78,0.03) 59px,rgba(155,123,78,0.03) 60px),repeating-linear-gradient(90deg,transparent,transparent 59px,rgba(155,123,78,0.03) 59px,rgba(155,123,78,0.03) 60px)",
          }}
        />
        <div className="relative z-[2] mx-auto max-w-[1040px] px-6">
          <Kicker>Privacy</Kicker>
          <h1 className="mb-4 text-[42px] font-extrabold leading-[1.1] tracking-[-0.02em] text-cream max-[900px]:text-[34px] max-[480px]:text-[28px]">
            Privacy Policy
          </h1>
          <p className="max-w-[560px] text-base leading-[1.65] text-muted">
            We built DSCR Calculator Pro to respect your privacy by default. No accounts, no trackers
            on your deal inputs, no selling data. This page explains what we collect, what we don&apos;t,
            and why.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 border border-brass/25 bg-brass/[0.06] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-brass-pale">
            Last updated · {LAST_UPDATED}
          </div>
        </div>
      </section>

      {/* BODY */}
      <section className="bg-cream py-20 max-[600px]:py-14">
        <div className="mx-auto grid max-w-[1040px] grid-cols-[240px_1fr] gap-12 px-6 max-[900px]:grid-cols-1 max-[900px]:gap-6">
          {/* TOC */}
          <aside className="max-[900px]:hidden">
            <div className="sticky top-28 border border-rule border-l-[3px] border-l-brass bg-card p-5">
              <div className="mb-3 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-brass">
                Contents
              </div>
              <ul className="flex flex-col gap-2">
                {SECTIONS.map((s) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className="text-[13px] text-slate transition-colors hover:text-brass"
                    >
                      {s.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Content */}
          <article className="flex flex-col gap-10 text-[15px] leading-[1.75] text-slate">
            {SECTIONS.map((s) => (
              <Section key={s.id} id={s.id} title={s.title}>
                {s.body}
              </Section>
            ))}

            {/* Contact callout */}
            <div className="mt-2 border border-rule border-l-[4px] border-l-brass bg-card p-6">
              <div className="mb-1 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-brass">
                Questions
              </div>
              <h3 className="mb-1.5 text-base font-bold text-ink">
                Reach out any time.
              </h3>
              <p className="mb-4 text-sm text-slate">
                If anything here is unclear, or you want to exercise a privacy right, we&apos;ll respond
                within 3–4 business days.
              </p>
              <Link href="/contact" className="btn-brass inline-flex">
                Contact Us →
              </Link>
            </div>
          </article>
        </div>
      </section>

      <Footer />
    </div>
  );
}

/* ─────────────────────────── SECTIONS ─────────────────────────── */

const SECTIONS = [
  {
    id: "overview",
    title: "Overview",
    body: (
      <>
        <p>
          DSCR Calculator Pro is a financial calculator for real estate investors. You don&apos;t need
          an account to use it. The numbers you enter to calculate a deal never leave your device —
          we have no way to read or store them.
        </p>
        <p className="mt-4">
          This policy covers both the mobile apps (iOS and Android) and this website
          (<span className="font-mono text-ink">dscrcalculator.pro</span>).
        </p>
      </>
    ),
  },
  {
    id: "what-we-collect",
    title: "What We Collect",
    body: (
      <div className="flex flex-col gap-4">
        <Row
          label="On-device deal inputs"
          value="Never transmitted. Stored locally on your device only."
        />
        <Row
          label="Anonymous usage events"
          value="Screen views, button taps, crash reports. No user identity attached."
        />
        <Row
          label="Device metadata"
          value="OS version, device model, app version — used to diagnose bugs."
        />
        <Row
          label="Advertiser contact info"
          value="If you reach out via the Advertise or Contact form, we store your email and message."
        />
      </div>
    ),
  },
  {
    id: "what-we-dont",
    title: "What We Don't Do",
    body: (
      <ul className="flex flex-col gap-2">
        {[
          "Sell or rent your data to anyone.",
          "Require accounts, sign-ups, or social logins.",
          "Track you across other apps or sites for advertising.",
          "Read the property, rent, or loan numbers you type into the calculator.",
        ].map((line) => (
          <li key={line} className="flex items-baseline gap-3">
            <span className="mt-[6px] h-1.5 w-1.5 shrink-0 rounded-full bg-brass" />
            <span>{line}</span>
          </li>
        ))}
      </ul>
    ),
  },
  {
    id: "advertising",
    title: "Advertising",
    body: (
      <>
        <p>
          The app shows ads sold by us directly to real-estate-ecosystem businesses (lenders, title
          companies, PropTech). Placements are served from our own ad server — third-party ad
          networks that profile users are <strong className="text-ink">not</strong> used.
        </p>
        <p className="mt-4">
          Advertisers receive aggregate, anonymized reporting: impressions, taps, and geo bucket.
          They never receive data tied to an individual user.
        </p>
      </>
    ),
  },
  {
    id: "your-rights",
    title: "Your Rights",
    body: (
      <>
        <p>
          You can request deletion of any information we hold that is tied to you (e.g. a support or
          advertising email thread) at any time. Under the GDPR and CCPA, you have the right to
          access, correct, or delete your data.
        </p>
        <p className="mt-4">
          Email <a href="mailto:privacy@dscrcalculator.pro" className="font-semibold text-brass hover:text-brass-light">privacy@dscrcalculator.pro</a> and we&apos;ll confirm receipt within 3–4 business days.
        </p>
      </>
    ),
  },
  {
    id: "changes",
    title: "Changes to This Policy",
    body: (
      <p>
        If we meaningfully change how we handle data, we&apos;ll update this page and bump the
        &quot;Last updated&quot; stamp. Material changes for existing advertisers are also emailed.
      </p>
    ),
  },
];

/* ─────────────────────────── PARTS ─────────────────────────── */

function Kicker({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-5 flex items-center gap-3 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-brass">
      <span className="h-px w-7 bg-brass" aria-hidden />
      {children}
    </div>
  );
}

function Section({
  id, title, children,
}: {
  id: string; title: string; children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-28">
      <h2 className="mb-4 border-b border-rule pb-3 text-[11px] font-bold uppercase tracking-[0.14em] text-ink">
        {title}
      </h2>
      <div>{children}</div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[200px_1fr] gap-4 border border-rule bg-card px-5 py-4 max-[600px]:grid-cols-1 max-[600px]:gap-1">
      <div className="font-mono text-[11px] uppercase tracking-[0.1em] text-brass">{label}</div>
      <div className="text-[14px] text-slate">{value}</div>
    </div>
  );
}

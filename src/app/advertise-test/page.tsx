import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/RevealOnScroll";
import { PhoneMockup } from "@/components/PhoneMockup";
import { AdvertiseForm } from "@/components/AdvertiseForm";
import { DemoShowcase } from "@/components/CalculatorDemo";
import EngagementTracker from "@/components/EngagementTracker";

/**
 * TEST VARIANT of /advertise — reworked from on-site engagement data
 * (32 sessions: median scroll 65%, dead middle sections, 0 form completions).
 *
 * Changes vs. live page:
 *  - Hero leads with the outcome + the number, CTA promises instant pricing
 *  - Stats / Why / Geo sections removed (13-20s combined dwell across all
 *    sessions); best stat folded into the hero, targeting is one badge line
 *  - CTA strip immediately after the demos (half of visitors never reach
 *    the bottom) + slim sticky pricing bar
 *  - Apply section reworded around "get pricing", not "tell us about you"
 *
 * Not linked from anywhere; noindex. Compare tracking via path=/advertise-test.
 */

export const metadata: Metadata = {
  title: "TEST — Advertise on DSCR Calculator Pro",
  description: "Test variant of the advertise page.",
  robots: { index: false, follow: false },
};

export default function AdvertiseTestPage() {
  return (
    <div className="bg-cream">
      <EngagementTracker />
      <Nav />
      <Hero />
      <DemoSection />
      <AudienceSection />
      <HowSection />
      <ApplySection />
      <Footer />
      <StickyPricingBar />
    </div>
  );
}

/* ─────────────────────────── HERO ─────────────────────────── */
function Hero() {
  return (
    <section data-track-section="hero" className="relative overflow-hidden bg-ink pb-24 pt-36 max-[900px]:pt-28">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "repeating-linear-gradient(0deg,transparent,transparent 59px,rgba(155,123,78,0.03) 59px,rgba(155,123,78,0.03) 60px),repeating-linear-gradient(90deg,transparent,transparent 59px,rgba(155,123,78,0.03) 59px,rgba(155,123,78,0.03) 60px)",
        }}
      />
      <div className="relative z-[2] mx-auto grid max-w-[1040px] grid-cols-[1fr_380px] items-center gap-16 px-6 max-[900px]:grid-cols-1 max-[900px]:gap-12 max-[900px]:text-center">
        <Reveal>
          <div className="flex flex-col max-[900px]:items-center">
            <Kicker>Advertising</Kicker>
            <h1 className="mb-5 text-[42px] font-extrabold leading-[1.1] tracking-[-0.02em] text-cream max-[900px]:text-[34px] max-[480px]:text-[28px]">
              Your brand on screen while investors{" "}
              <span className="font-light italic text-brass-pale">underwrite</span> their next deal.
            </h1>
            <p className="mb-4 max-w-[460px] text-base leading-[1.7] text-muted max-[900px]:max-w-full">
              Around a thousand active investors run their numbers on DSCR Calculator Pro every
              day. Your placement is right there — banner on every screen, full-screen the moment
              they calculate.
            </p>
            <p className="mb-9 max-w-[460px] text-[13.5px] leading-[1.6] text-brass-pale max-[900px]:max-w-full">
              Month-to-month · live within 24 hours · nationwide reach
            </p>
            <div className="flex flex-wrap gap-3 max-[900px]:justify-center">
              <a href="#apply" className="btn-brass">Get Placement Pricing →</a>
              <a href="#demo" className="btn-outline-brass">See It Live</a>
            </div>
            <p className="mt-3 text-[12px] text-muted">
              Pricing lands in your inbox in under a minute. No call, no commitment.
            </p>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="relative flex justify-center">
            <PhoneMockup />
            <div className="absolute -right-3 top-4 z-30 border border-rule border-l-[3px] border-l-brass bg-card px-4 py-3 shadow-[0_6px_20px_rgba(10,22,40,0.12)] [animation:badgeBob_4s_ease-in-out_infinite]">
              <div className="text-[14px] font-bold leading-none text-ink">~1,000 Investors</div>
              <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.12em] text-brass">Running Deals Daily</div>
            </div>
            <div className="absolute -left-3 bottom-14 z-30 border border-rule border-l-[3px] border-l-brass bg-card px-4 py-3 shadow-[0_6px_20px_rgba(10,22,40,0.12)] [animation:badgeBob_4s_ease-in-out_infinite_1.5s]">
              <div className="text-[14px] font-bold leading-none text-ink">iOS App</div>
              <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.12em] text-brass">Live on App Store</div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ─────────────────────────── LIVE DEMO + CTA ─────────────────────────── */
function DemoSection() {
  return (
    <section id="demo" className="relative overflow-hidden border-b border-rule bg-ink py-[72px] max-[600px]:py-14">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "repeating-linear-gradient(0deg,transparent,transparent 59px,rgba(155,123,78,0.03) 59px,rgba(155,123,78,0.03) 60px),repeating-linear-gradient(90deg,transparent,transparent 59px,rgba(155,123,78,0.03) 59px,rgba(155,123,78,0.03) 60px)",
        }}
      />
      <div className="relative z-[2] mx-auto max-w-[1040px] px-6">
        <Reveal>
          <div className="mx-auto mb-14 max-w-[600px] text-center">
            <div className="mb-4 flex items-center justify-center gap-3 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-brass">
              <span className="h-px w-7 bg-brass" aria-hidden />
              See It Live
              <span className="h-px w-7 bg-brass" aria-hidden />
            </div>
            <h2 className="mb-4 text-[32px] font-extrabold leading-[1.15] tracking-[-0.01em] text-cream max-[600px]:text-[26px]">
              Exactly what your ad looks like in the app.
            </h2>
            <p className="text-[15px] leading-[1.7] text-muted">
              This is the real DSCR Calculator investors use to run every deal. Your placement rides
              along with it — as a rotating banner, and as a full-screen pop-up the moment they calculate.
            </p>
          </div>
        </Reveal>

        <Reveal>
          <DemoShowcase />
        </Reveal>

        {/* CTA right where the "aha" happens — most visitors never reach the bottom */}
        <Reveal>
          <div data-track-section="cta" className="mx-auto mt-16 max-w-[640px] border border-brass/30 bg-ink-mid/40 px-8 py-8 text-center max-[600px]:px-5">
            <h3 className="text-[20px] font-extrabold text-cream">Want your brand in one of these slots?</h3>
            <p className="mx-auto mt-2 max-w-[440px] text-[13.5px] leading-[1.6] text-muted">
              Tell us who you are and get exact placement pricing in your inbox in under a
              minute. Month-to-month, cancel anytime.
            </p>
            <a href="#apply" className="btn-brass mt-5 inline-flex">Get Placement Pricing →</a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ─────────────────────────── AUDIENCE (merged) ─────────────────────────── */
const AUDIENCES = [
  { title: "DSCR & Bridge Lenders", desc: "Reach investors at the exact moment they're qualifying deals. Your rate sheet, one tap away from the calculation." },
  { title: "Title & Escrow Companies", desc: "Be the name investors see while they close. Nationwide today, metro targeting on the roadmap." },
  { title: "Insurance Providers", desc: "Users input insurance data on every calculation. Position your product adjacent to that exact field." },
  { title: "PropTech & SaaS", desc: "CRMs, deal-flow tools, property management platforms — reach your ideal customer with nationwide coverage." },
];

function AudienceSection() {
  return (
    <section data-track-section="audience" className="bg-card-alt py-[88px] max-[600px]:py-16">
      <div className="mx-auto max-w-[1040px] px-6">
        <Reveal>
          <div className="mx-auto mb-14 max-w-[580px] text-center">
            <Kicker className="justify-center">Ideal Advertisers</Kicker>
            <h2 className="mb-3 text-[34px] font-extrabold leading-[1.15] tracking-[-0.01em] text-ink max-[600px]:text-[26px]">
              Built for the REI ecosystem.
            </h2>
            <p className="text-[15px] leading-[1.7] text-slate">
              Every impression is a decision-maker with capital deployed — not a casual scroller.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 border border-rule bg-card px-4 py-2 font-mono text-[10.5px] uppercase tracking-[0.12em] text-brass">
              <span className="h-1.5 w-1.5 rounded-full bg-brass" />
              Nationwide reach today · state &amp; metro targeting coming
            </div>
          </div>
        </Reveal>
        <div className="grid grid-cols-2 gap-4 max-[600px]:grid-cols-1">
          {AUDIENCES.map((a, i) => (
            <Reveal key={a.title} delay={i * 60}>
              <div className="border border-rule border-l-[4px] border-l-brass bg-card px-6 py-6 transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(10,22,40,0.06)]">
                <h4 className="mb-1.5 text-[12px] font-bold uppercase tracking-[0.12em] text-ink">{a.title}</h4>
                <p className="text-[13px] leading-[1.6] text-slate">{a.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── HOW ─────────────────────────── */
const STEPS = [
  { num: "01", title: "Choose Placement", desc: "Select the ad format and tier that fits your goals and budget." },
  { num: "02", title: "Upload Creative", desc: "Submit your banner or interstitial creative. All plans launch with nationwide reach." },
  { num: "03", title: "Stripe Checkout", desc: "Secure, instant payment. Monthly billing with no long-term contracts." },
  { num: "04", title: "Go Live", desc: "Your ad starts serving within 24 hours. Track performance in your dashboard." },
];

function HowSection() {
  return (
    <section id="how" data-track-section="how" className="bg-cream py-[88px] max-[600px]:py-16">
      <div className="mx-auto max-w-[1040px] px-6">
        <Reveal>
          <div className="mx-auto mb-14 max-w-[580px] text-center">
            <Kicker className="justify-center">How It Works</Kicker>
            <h2 className="text-[34px] font-extrabold leading-[1.15] tracking-[-0.01em] text-ink max-[600px]:text-[26px]">
              Live in minutes, not weeks.
            </h2>
          </div>
        </Reveal>
        <div className="grid grid-cols-4 gap-4 max-[700px]:grid-cols-2 max-[400px]:grid-cols-1">
          {STEPS.map((s, i) => (
            <Reveal key={s.num} delay={i * 80}>
              <div className="border border-rule border-t-[2px] border-t-brass bg-card px-5 py-7 text-center">
                <div className="mb-3.5 text-[28px] font-extrabold leading-none text-brass">{s.num}</div>
                <h4 className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-ink">{s.title}</h4>
                <p className="text-[13px] leading-[1.55] text-slate">{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── APPLY ─────────────────────────── */
function ApplySection() {
  return (
    <section id="apply" data-track-section="apply" className="bg-cream pb-[120px] pt-[88px] max-[600px]:py-16">
      <div className="mx-auto max-w-[900px] px-6">
        <Reveal>
          <div className="mb-12 text-center">
            <Kicker className="justify-center">Get Pricing</Kicker>
            <h2 className="mt-4 text-[34px] font-extrabold leading-[1.15] tracking-[-0.01em] text-ink max-[600px]:text-[26px]">
              Get your placement pricing.
            </h2>
            <p className="mx-auto mt-4 max-w-[520px] text-[15px] leading-[1.7] text-slate">
              Tell us who you are and what you offer — exact pricing lands in your inbox in
              under a minute, and a real person follows up within a few business days.
            </p>
            <div className="mx-auto mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              {[
                "Instant pricing by email",
                "Month-to-month — cancel anytime",
                "No call required",
              ].map((line) => (
                <span key={line} className="flex items-center gap-2 text-[13px] text-slate">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brass" />
                  {line}
                </span>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <div className="border border-rule border-l-[3px] border-l-brass bg-card p-8 max-[600px]:p-5">
            <AdvertiseForm />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ─────────────────────────── STICKY CTA ─────────────────────────── */
function StickyPricingBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-brass/25 bg-ink/95 px-5 py-3 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1040px] items-center justify-between gap-4">
        <p className="text-[13px] text-cream max-[600px]:text-[12px]">
          <span className="font-bold">Month-to-month placements, live in 24h.</span>{" "}
          <span className="text-muted max-[480px]:hidden">Exact pricing in your inbox in under a minute.</span>
        </p>
        <a href="#apply" className="btn-brass shrink-0 !py-2 text-[12.5px]">Get Pricing →</a>
      </div>
    </div>
  );
}

/* ─────────────────────────── SHARED ─────────────────────────── */
function Kicker({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex items-center gap-3 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-brass mb-4 ${className}`}>
      <span className="h-px w-7 bg-brass" aria-hidden />
      {children}
    </div>
  );
}

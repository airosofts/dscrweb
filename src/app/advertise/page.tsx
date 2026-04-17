import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/RevealOnScroll";
import { PhoneMockup } from "@/components/PhoneMockup";
import { AdvertiseForm } from "@/components/AdvertiseForm";

export const metadata: Metadata = {
  title: "Advertise on DSCR Calculator Pro — Reach Real Estate Investors",
  description:
    "Place your brand in front of active real estate investors. Premium in-app ad placements with nationwide reach on DSCR Calculator Pro.",
};

export default function AdvertisePage() {
  return (
    <div className="bg-cream">
      <Nav />
      <Hero />
      <StatsBar />
      <WhySection />
      <GeoSection />
      <HowSection />
      <AudienceSection />
      <ApplySection />
      <Footer />
    </div>
  );
}

/* ─────────────────────────── HERO ─────────────────────────── */
function Hero() {
  return (
    <section className="relative overflow-hidden bg-ink pb-24 pt-36 max-[900px]:pt-28">
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
              Reach{" "}
              <span className="font-light italic text-brass-pale">Active</span>
              <br />Real Estate Investors
            </h1>
            <p className="mb-9 max-w-[440px] text-base leading-[1.7] text-muted max-[900px]:max-w-full">
              Place your brand inside the tool investors use to underwrite every deal. Premium
              in-app placements with nationwide reach — directly to decision-makers.
            </p>
            <div className="flex flex-wrap gap-3 max-[900px]:justify-center">
              <a href="#apply" className="btn-brass">Start Your Request →</a>
              <a href="#how" className="btn-outline-brass">How It Works</a>
            </div>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="relative flex justify-center">
            <PhoneMockup />

            {/* Floating badges */}
            <div className="absolute -right-3 top-4 z-30 border border-rule border-l-[3px] border-l-brass bg-card px-4 py-3 shadow-[0_6px_20px_rgba(10,22,40,0.12)] [animation:badgeBob_4s_ease-in-out_infinite]">
              <div className="text-[14px] font-bold leading-none text-ink">In-App Ads</div>
              <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.12em] text-brass">Premium Placement</div>
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

/* ─────────────────────────── VALUE BAR ─────────────────────────── */
const VALUE_POINTS = [
  { label: "High-Intent Users", desc: "Investors actively running deal numbers" },
  { label: "Premium Placement", desc: "Banner ads & full-screen pop-ups" },
  { label: "Nationwide Reach", desc: "Available across all US states" },
  { label: "Self-Serve Setup", desc: "Stripe checkout, live in 24 hours" },
];

function StatsBar() {
  return (
    <div className="border-b border-rule bg-card">
      <div className="mx-auto grid max-w-[1040px] grid-cols-4 divide-x divide-rule px-6 max-[600px]:grid-cols-2 max-[600px]:divide-x-0">
        {VALUE_POINTS.map((s, i) => (
          <Reveal key={s.label} delay={i * 80}>
            <div className="px-5 py-8 text-center max-[600px]:py-6">
              <div className="text-[14px] font-bold text-ink">{s.label}</div>
              <div className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-muted">{s.desc}</div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────── WHY ─────────────────────────── */
const WHY_CARDS = [
  {
    icon: <TargetIcon />,
    title: "High-Intent Audience",
    desc: "Users aren't browsing — they're running numbers on live deals. Your ad reaches investors at the exact moment of financial decision-making.",
  },
  {
    icon: <MapPinIcon />,
    title: "Nationwide + Geo Coming",
    desc: "Launch nationwide today. State and metro-level targeting is on the roadmap — giving local lenders and service providers even sharper precision.",
  },
  {
    icon: <ChartIcon />,
    title: "Verified Engagement",
    desc: "Full transparency on impressions, taps, and conversion metrics. Real-time dashboard access so you know exactly what your spend delivers.",
  },
];

function WhySection() {
  return (
    <section className="bg-cream py-[88px] max-[600px]:py-16">
      <div className="mx-auto max-w-[1040px] px-6">
        <Reveal>
          <SectionHeader centered kicker="Why DSCR Calculator Pro" heading="Your Brand, Where Deals Get Done">
            Investors open the app when they&apos;re actively analyzing deals — not casually scrolling.
            Every impression reaches a decision-maker with capital ready to deploy.
          </SectionHeader>
        </Reveal>
        <div className="grid grid-cols-3 gap-5 max-[700px]:grid-cols-1">
          {WHY_CARDS.map((c, i) => (
            <Reveal key={c.title} delay={i * 80}>
              <div className="border border-rule border-l-[3px] border-l-brass bg-card px-6 py-7 transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(10,22,40,0.06)]">
                <div className="mb-5 flex h-10 w-10 items-center justify-center border border-rule bg-card-alt text-brass">
                  {c.icon}
                </div>
                <h3 className="mb-2.5 text-[12px] font-bold uppercase tracking-[0.12em] text-ink">{c.title}</h3>
                <p className="text-sm leading-[1.65] text-slate">{c.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── GEO ─────────────────────────── */
const GEO_FEATURES = [
  { title: "Nationwide — Available Now", desc: "All plans run nationally. Reach every investor using DSCR Calculator Pro, coast to coast.", active: true },
  { title: "State-Level — Coming Soon", desc: "Target investors analyzing properties in a specific state. Reduced pricing for narrower reach.", active: false },
  { title: "Metro-Level — Coming Soon", desc: "MSA-level precision for local lenders, title companies, and service providers.", active: false },
];

function GeoSection() {
  return (
    <section id="targeting" className="bg-card-alt py-[88px] max-[600px]:py-16">
      <div className="mx-auto grid max-w-[1040px] grid-cols-2 items-center gap-16 px-6 max-[900px]:grid-cols-1 max-[900px]:gap-10">
        <Reveal>
          <div>
            <Kicker>Geo Targeting</Kicker>
            <h2 className="mb-3 text-[34px] font-extrabold leading-[1.15] tracking-[-0.01em] text-ink max-[600px]:text-[26px]">
              National Reach Today.
              <br />Local Precision Soon.
            </h2>
            <p className="mb-7 text-[15px] leading-[1.7] text-slate">
              Every plan launches with full nationwide coverage — your ad reaches investors across all
              48 active states. State and metro targeting is on the roadmap.
            </p>
            <div className="flex flex-col gap-4">
              {GEO_FEATURES.map((f) => (
                <div key={f.title} className="flex items-start gap-3">
                  <div className={`mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-brass${f.active ? "" : " opacity-35"}`} />
                  <div>
                    <h4 className="mb-0.5 text-sm font-bold text-ink">{f.title}</h4>
                    <p className="text-[13px] leading-[1.55] text-slate">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="border border-rule border-l-[4px] border-l-brass bg-card p-8">
            <div className="relative aspect-[4/3] overflow-hidden border border-rule bg-cream">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "repeating-linear-gradient(0deg,transparent,transparent 29px,rgba(155,123,78,0.06) 29px,rgba(155,123,78,0.06) 30px),repeating-linear-gradient(90deg,transparent,transparent 29px,rgba(155,123,78,0.06) 29px,rgba(155,123,78,0.06) 30px)",
                }}
              />
              <GeoPin top="22%" left="16%" />
              <GeoPin top="28%" left="52%" delay="0.4s" />
              <GeoPin top="52%" left="32%" delay="0.9s" />
              <GeoPin top="38%" left="70%" delay="1.3s" />
              <GeoPin top="62%" left="58%" delay="0.7s" />
            </div>
            <div className="mt-4 flex flex-wrap gap-1.5">
              <span className="border border-ink bg-ink px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-cream">National — Live</span>
              <span className="border border-rule bg-card-alt px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-slate">State — Soon</span>
              <span className="border border-rule bg-card-alt px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-slate">Metro — Soon</span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function GeoPin({ top, left, delay = "0s" }: { top: string; left: string; delay?: string }) {
  return (
    <span className="absolute h-2.5 w-2.5 rounded-full bg-brass" style={{ top, left }}>
      <span
        className="absolute -inset-[5px] rounded-full border border-brass/30 [animation:pinRing_2.5s_ease-out_infinite]"
        style={{ animationDelay: delay }}
      />
    </span>
  );
}

/* ─────────────────────────── HOW IT WORKS ─────────────────────────── */
const STEPS = [
  { num: "01", title: "Choose Placement", desc: "Select the ad format and tier that fits your goals and budget." },
  { num: "02", title: "Upload Creative", desc: "Submit your banner or interstitial creative. All plans launch with nationwide reach." },
  { num: "03", title: "Stripe Checkout", desc: "Secure, instant payment. Monthly billing with no long-term contracts." },
  { num: "04", title: "Go Live", desc: "Your ad starts serving within 24 hours. Track performance in your dashboard." },
];

function HowSection() {
  return (
    <section id="how" className="bg-cream py-[88px] max-[600px]:py-16">
      <div className="mx-auto max-w-[1040px] px-6">
        <Reveal>
          <SectionHeader centered kicker="How It Works" heading="Live in Minutes, Not Weeks" />
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

/* ─────────────────────────── AUDIENCE ─────────────────────────── */
const AUDIENCES = [
  { title: "DSCR & Bridge Lenders", desc: "Reach investors at the exact moment they're qualifying deals. Your rate sheet, one tap away from the calculation." },
  { title: "Title & Escrow Companies", desc: "Reach investors nationwide today. When metro targeting launches, appear to investors closing deals in your specific service area." },
  { title: "Insurance Providers", desc: "Users input insurance data on every calculation. Position your product adjacent to that exact field." },
  { title: "PropTech & SaaS", desc: "CRMs, deal-flow tools, property management platforms — reach your ideal customer with nationwide coverage." },
];

function AudienceSection() {
  return (
    <section className="bg-card-alt py-[88px] max-[600px]:py-16">
      <div className="mx-auto max-w-[1040px] px-6">
        <Reveal>
          <SectionHeader centered kicker="Ideal Advertisers" heading="Built for the REI Ecosystem" />
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

/* ─────────────────────────── APPLY (FORM) ─────────────────────────── */
function ApplySection() {
  return (
    <section id="apply" className="bg-cream py-[88px] max-[600px]:py-16">
      <div className="mx-auto max-w-[900px] px-6">
        {/* Header — centered */}
        <Reveal>
          <div className="mb-12 text-center">
            <Kicker className="justify-center">Apply</Kicker>
            <h2 className="mt-4 text-[34px] font-extrabold leading-[1.15] tracking-[-0.01em] text-ink max-[600px]:text-[26px]">
              Tell us about your campaign.
            </h2>
            <p className="mx-auto mt-4 max-w-[520px] text-[15px] leading-[1.7] text-slate">
              Share a few details about your brand and what you&rsquo;re trying to reach. Our
              team matches the right placement and sends you a tailored plan — usually within a
              minute for pricing, and 3–4 business days for a personal follow-up.
            </p>
            <div className="mx-auto mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              {[
                "Instant pricing email",
                "Review in 3–4 business days",
                "No contracts",
              ].map((line) => (
                <span key={line} className="flex items-center gap-2 text-[13px] text-slate">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brass" />
                  {line}
                </span>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Form — centered card */}
        <Reveal delay={100}>
          <div className="border border-rule border-l-[3px] border-l-brass bg-card p-8 max-[600px]:p-5">
            <AdvertiseForm />
          </div>
        </Reveal>
      </div>
    </section>
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

function SectionHeader({
  kicker, heading, children, centered,
}: {
  kicker: string; heading: string; children?: React.ReactNode; centered?: boolean;
}) {
  return (
    <div className={`mb-14 max-w-[580px] ${centered ? "mx-auto text-center" : ""}`}>
      <Kicker className={centered ? "justify-center" : ""}>{kicker}</Kicker>
      <h2 className="mb-3 text-[34px] font-extrabold leading-[1.15] tracking-[-0.01em] text-ink max-[600px]:text-[26px]">
        {heading}
      </h2>
      {children && <p className="text-[15px] leading-[1.7] text-slate">{children}</p>}
    </div>
  );
}

/* ─────────────────────────── ICONS ─────────────────────────── */
function TargetIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="10" r="7" />
      <circle cx="10" cy="10" r="3.5" />
      <line x1="10" y1="1" x2="10" y2="4" />
      <line x1="10" y1="16" x2="10" y2="19" />
      <line x1="1" y1="10" x2="4" y2="10" />
      <line x1="16" y1="10" x2="19" y2="10" />
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 1C7.239 1 5 3.239 5 6c0 3.75 5 11 5 11s5-7.25 5-11c0-2.761-2.239-5-5-5z" />
      <circle cx="10" cy="6" r="2" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="2,14 7,8 11,11 18,4" />
      <line x1="2" y1="18" x2="18" y2="18" />
    </svg>
  );
}


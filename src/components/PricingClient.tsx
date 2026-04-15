"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { LogoMark } from "./LogoMark";

type Geo = "national" | "state" | "metro";

type Tier = {
  id: string;
  name: string;
  placement: string;
  duration: string;
  badge?: string;
  prices: Record<Geo, number>;
};

const TIERS: Tier[] = [
  {
    id: "starter",
    name: "Starter",
    placement: "Results Page Banner",
    duration: "1 month",
    prices: { national: 349, state: 119, metro: 69 },
  },
  {
    id: "growth",
    name: "Growth",
    placement: "Homepage Banner",
    duration: "3 months",
    prices: { national: 897, state: 299, metro: 179 },
  },
  {
    id: "pro",
    name: "Pro",
    placement: "Homepage + Banner",
    duration: "6 months",
    badge: "Best Value",
    prices: { national: 1497, state: 497, metro: 297 },
  },
  {
    id: "premium",
    name: "Premium",
    placement: "Full-Screen Pop-Up",
    duration: "1 month",
    prices: { national: 597, state: 199, metro: 119 },
  },
  {
    id: "premium-plus",
    name: "Premium Plus",
    placement: "Full-Screen Pop-Up",
    duration: "3 months",
    badge: "Popular",
    prices: { national: 1497, state: 497, metro: 297 },
  },
];

const TIER_DETAILS: { title: string; items: string[] }[] = [
  { title: "Starter", items: ["Results page banner", "1-month flight", "Impression reporting", "320×50 format"] },
  { title: "Growth", items: ["Homepage banner", "3-month flight", "Impression + tap reporting", "320×50 format", "Priority placement"] },
  { title: "Pro", items: ["Homepage + results banner", "6-month flight", "Full analytics dashboard", "A/B creative testing", "Dedicated support"] },
  { title: "Premium", items: ["Full-screen pop-up", "1-month flight", "High-impact interstitial", "Click-through analytics", "Custom creative"] },
  { title: "Premium Plus", items: ["Full-screen pop-up", "3-month flight", "Category exclusivity", "Priority geo targeting", "Monthly reviews", "Dedicated account rep"] },
];

const FAQS = [
  { q: "What is geo targeting?", a: "Your ad is shown to users based on geography. National targeting is available now, with State and Metro-level targeting coming soon for even more precision." },
  { q: "Can I change my creative?", a: "Yes. Upload new creative at any time during your flight. Changes go live within 24 hours." },
  { q: "How does billing work?", a: "One-time payment via Stripe for the full duration of your flight. No recurring charges, no auto-renewal." },
  { q: "When does my ad go live?", a: "Within 24 hours of checkout and creative approval. You'll receive a confirmation email with your dashboard link." },
];

const formatPrice = (cents: number) => "$" + cents.toLocaleString("en-US");
const shortPeriod = (duration: string) =>
  duration === "1 month" ? "mo" : duration.replace(" months", "mo");
const geoLabel = (g: Geo) => g.charAt(0).toUpperCase() + g.slice(1);

export function PricingClient() {
  const [geo, setGeo] = useState<Geo>("national");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const comingSoon = geo !== "national";
  const selected = useMemo(
    () => (selectedId ? TIERS.find((t) => t.id === selectedId) ?? null : null),
    [selectedId],
  );

  const chooseGeo = (g: Geo) => {
    setGeo(g);
    if (g !== "national") setSelectedId(null);
  };

  const chooseTier = (id: string) => {
    if (comingSoon) return;
    setSelectedId(id);
  };

  const handleCheckout = () => {
    if (!selected) return;
    const subject = encodeURIComponent(`DSCR Pro Ad — ${selected.name} (${geoLabel(geo)})`);
    const body = encodeURIComponent(
      `Hi,\n\nI'd like to purchase the ${selected.name} plan with ${geoLabel(geo)} targeting.\n\nPlacement: ${selected.placement}\nDuration: ${selected.duration}\nPrice: ${formatPrice(selected.prices[geo])}\n\nPlease send me a checkout link.\n\nThanks`,
    );
    window.location.href = `mailto:advertise@dscrcalculator.pro?subject=${subject}&body=${body}`;
  };

  return (
    <div className="min-h-screen bg-cream text-ink">
      {/* NAV */}
      <nav className="sticky top-0 z-[100] h-14 bg-ink">
        <div className="mx-auto flex h-full max-w-[1120px] items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-cream">
              <LogoMark className="h-[22px] w-[22px]" />
            </span>
            <span className="text-[12px] font-extrabold uppercase tracking-[0.14em] text-cream">
              DSCR Calculator Pro
            </span>
          </Link>
          <Link
            href="/advertise"
            className="flex items-center gap-1.5 text-xs font-medium tracking-[0.04em] text-muted transition-colors hover:text-brass-pale"
          >
            ← Back to Overview
          </Link>
        </div>
      </nav>

      <div className="mx-auto max-w-[1120px] px-6 pb-20 pt-12">
        {/* HEADER */}
        <div className="mb-10">
          <div className="mb-2.5 flex items-center gap-3 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-brass">
            <span className="h-px w-7 bg-brass" aria-hidden />
            Pricing
          </div>
          <h1 className="mb-2 text-[32px] font-extrabold tracking-[-0.01em] text-ink max-md:text-[26px]">
            Select Your Plan
          </h1>
          <p className="max-w-[520px] text-[15px] leading-[1.6] text-slate">
            Choose your plan below. One-time checkout via Stripe — no contracts, no auto-renewal.
          </p>
        </div>

        {/* GEO SELECTOR */}
        <div className="mb-7 flex flex-wrap items-center gap-4 max-md:flex-col max-md:items-start max-md:gap-2">
          <span className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-muted">
            Targeting:
          </span>
          <div className="flex overflow-hidden border border-rule max-[480px]:w-full">
            {(["national", "state", "metro"] as Geo[]).map((g, i) => (
              <button
                key={g}
                onClick={() => chooseGeo(g)}
                className={
                  "whitespace-nowrap px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.1em] transition-colors max-[480px]:flex-1 max-[480px]:px-2.5 max-[480px]:text-[10px] " +
                  (i < 2 ? "border-r border-rule " : "") +
                  (geo === g
                    ? "bg-ink text-cream"
                    : "bg-card text-slate hover:bg-card-alt")
                }
              >
                {geoLabel(g)}
              </button>
            ))}
          </div>
        </div>

        {/* COMING SOON BANNER */}
        {comingSoon && (
          <div className="mb-7 flex items-start gap-3.5 border border-rule border-l-[4px] border-l-brass bg-card px-5 py-4">
            <div className="mt-0.5 flex h-5 w-5 items-center justify-center text-brass">
              <PinIcon />
            </div>
            <div>
              <div className="mb-0.5 text-[13px] font-bold tracking-[0.02em] text-ink">
                {geoLabel(geo)} Targeting — Coming Soon
              </div>
              <div className="text-[13px] leading-[1.55] text-slate">
                This targeting level is not yet available. All plans are currently offered with
                nationwide reach. Want to be first to know when it launches?{" "}
                <a
                  href="mailto:advertise@dscrcalculator.pro?subject=Geo%20Targeting%20Early%20Access"
                  className="font-semibold text-brass transition-colors hover:text-brass-light"
                >
                  Get notified →
                </a>
              </div>
            </div>
          </div>
        )}

        {/* DESKTOP TABLE */}
        <table className="w-full border-collapse max-md:hidden">
          <thead>
            <tr>
              <th className="w-10 border-b-2 border-rule px-4 py-3" />
              <Th>Tier</Th>
              <Th>Placement</Th>
              <Th>Duration</Th>
              <Th right>Price</Th>
            </tr>
          </thead>
          <tbody>
            {TIERS.map((t) => {
              const isSelected = !comingSoon && selectedId === t.id;
              return (
                <tr
                  key={t.id}
                  onClick={() => chooseTier(t.id)}
                  className={
                    "relative border-b border-rule transition-colors " +
                    (comingSoon
                      ? "cursor-default opacity-65"
                      : "cursor-pointer hover:bg-card ") +
                    (isSelected ? "bg-card shadow-[inset_4px_0_0_var(--color-brass)]" : "")
                  }
                >
                  <td className="px-4 py-5">
                    <div
                      className={
                        "flex h-[18px] w-[18px] items-center justify-center rounded-full border-2 transition-colors " +
                        (isSelected ? "border-brass" : "border-rule") +
                        (comingSoon ? " opacity-30" : "")
                      }
                    >
                      <div
                        className={
                          "h-2 w-2 rounded-full transition-colors " +
                          (isSelected ? "bg-brass" : "bg-transparent")
                        }
                      />
                    </div>
                  </td>
                  <td className="px-4 py-5">
                    <div className="flex items-center gap-2.5">
                      <span className="text-[15px] font-extrabold tracking-[0.02em] text-ink">
                        {t.name}
                      </span>
                      {t.badge && <Badge>{t.badge}</Badge>}
                    </div>
                  </td>
                  <td className="px-4 py-5">
                    <span className="text-[13px] font-medium text-slate">{t.placement}</span>
                  </td>
                  <td className="px-4 py-5">
                    <span className="font-mono text-xs tracking-[0.06em] text-muted">
                      {t.duration}
                    </span>
                  </td>
                  <td className="px-4 py-5 text-right">
                    {comingSoon ? (
                      <ComingSoonPill />
                    ) : (
                      <span
                        className={
                          "text-[22px] font-extrabold tracking-[-0.02em] " +
                          (isSelected ? "text-brass" : "text-ink")
                        }
                      >
                        {formatPrice(t.prices[geo])}
                        <span className="ml-0.5 text-[11px] font-normal tracking-normal text-muted">
                          /{shortPeriod(t.duration)}
                        </span>
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* MOBILE CARDS */}
        <div className="hidden flex-col gap-3 max-md:flex">
          {TIERS.map((t) => {
            const isSelected = !comingSoon && selectedId === t.id;
            return (
              <div
                key={t.id}
                onClick={() => chooseTier(t.id)}
                className={
                  "border border-rule border-l-[4px] bg-card px-5 py-5 transition-all " +
                  (comingSoon ? "cursor-default border-l-transparent opacity-65" : "cursor-pointer ") +
                  (isSelected
                    ? "border-l-brass shadow-[0_2px_12px_rgba(155,123,78,0.12)]"
                    : comingSoon
                      ? ""
                      : "border-l-transparent hover:border-l-brass-pale")
                }
              >
                <div className="mb-1.5 flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-[14px] font-extrabold tracking-[0.02em] text-ink">
                      {t.name}
                    </span>
                    {t.badge && <Badge>{t.badge}</Badge>}
                  </div>
                  {comingSoon ? (
                    <ComingSoonPill />
                  ) : (
                    <div
                      className={
                        "text-[20px] font-extrabold tracking-[-0.02em] " +
                        (isSelected ? "text-brass" : "text-ink")
                      }
                    >
                      {formatPrice(t.prices[geo])}
                    </div>
                  )}
                </div>
                <div className="flex gap-4 text-xs text-muted">
                  <span>{t.placement}</span>
                  <span>{t.duration}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* TIER DETAILS */}
        <div className="mt-8 grid grid-cols-5 gap-3 max-lg:grid-cols-2 max-md:grid-cols-1">
          {TIER_DETAILS.map((d) => (
            <div key={d.title} className="border border-rule border-t-[3px] border-t-brass bg-card px-4 py-5">
              <h4 className="mb-2.5 text-xs font-bold uppercase tracking-[0.1em] text-ink">
                {d.title}
              </h4>
              <ul className="space-y-1">
                {d.items.map((item) => (
                  <li
                    key={item}
                    className="flex items-baseline gap-1.5 py-0.5 text-xs leading-[1.5] text-slate"
                  >
                    <span className="shrink-0 text-[10px] font-bold text-brass">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="mt-14">
          <h3 className="mb-5 border-b border-rule pb-2.5 text-xs font-bold uppercase tracking-[0.14em] text-ink">
            Frequently Asked
          </h3>
          <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
            {FAQS.map((f) => (
              <div
                key={f.q}
                className="border border-rule border-l-[4px] border-l-brass bg-card px-5 py-5"
              >
                <h4 className="mb-1.5 text-[13px] font-bold text-ink">{f.q}</h4>
                <p className="text-[13px] leading-[1.6] text-slate">{f.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FOOTER */}
        <div className="mt-14 flex items-center justify-between border-t border-rule pt-6 max-md:flex-col max-md:gap-2 max-md:text-center">
          <span className="font-mono text-[11px] text-muted">© 2026 DSCR Calculator Pro</span>
          <a
            href="mailto:advertise@dscrcalculator.pro"
            className="text-xs text-brass transition-colors hover:text-brass-light"
          >
            Questions? advertise@dscrcalculator.pro
          </a>
        </div>
      </div>

      {/* STICKY CHECKOUT BAR */}
      <div
        className={
          "sticky bottom-0 left-0 right-0 z-[90] border-t border-brass/10 bg-ink transition-transform duration-[250ms] " +
          (selected && !comingSoon ? "translate-y-0" : "translate-y-full")
        }
      >
        <div className="mx-auto flex max-w-[1120px] items-center justify-between gap-5 px-6 py-4 max-md:flex-col max-md:gap-3 max-md:py-4">
          <div className="flex min-w-0 flex-1 items-center gap-6 max-md:w-full max-md:justify-between">
            <div className="flex min-w-0 flex-col">
              <div className="truncate text-sm font-bold text-cream">
                {selected ? `${selected.name} — ${selected.placement}` : "—"}
              </div>
              <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.08em] text-muted">
                {selected ? `${selected.duration} · ${geoLabel(geo)} targeting` : "—"}
              </div>
            </div>
            <div className="h-8 w-px shrink-0 bg-brass/15" />
            <div>
              <div className="text-2xl font-extrabold leading-none tracking-[-0.02em] text-brass-pale">
                {selected ? formatPrice(selected.prices[geo]) : "—"}
              </div>
              <div className="mt-0.5 font-mono text-[10px] tracking-[0.06em] text-muted">
                {selected ? `One-time · ${selected.duration}` : "One-time"}
              </div>
            </div>
          </div>
          <button
            onClick={handleCheckout}
            className="flex items-center gap-2 whitespace-nowrap bg-brass px-9 py-3.5 text-[13px] font-bold uppercase tracking-[0.12em] text-cream transition-colors hover:bg-brass-light max-md:w-full max-md:justify-center"
          >
            Checkout
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </button>
        </div>
        <div className="flex items-center justify-center gap-1.5 pb-3 font-mono text-[10px] tracking-[0.06em] text-muted">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-60">
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="M3 10h18" />
          </svg>
          Secured by Stripe
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── Subcomponents ─────────────────────────── */

function Th({ children, right }: { children: React.ReactNode; right?: boolean }) {
  return (
    <th
      className={
        "border-b-2 border-rule px-4 py-3 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-muted " +
        (right ? "text-right" : "text-left")
      }
    >
      {children}
    </th>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="bg-brass px-1.5 py-0.5 font-mono text-[8px] font-medium uppercase tracking-[0.14em] text-cream">
      {children}
    </span>
  );
}

function ComingSoonPill() {
  return (
    <span className="inline-block border border-rule bg-card-alt px-3 py-1 font-mono text-xs font-medium uppercase tracking-[0.1em] text-muted">
      Coming Soon
    </span>
  );
}

function PinIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
    >
      <path d="M10 1C7.239 1 5 3.239 5 6c0 3.75 5 11 5 11s5-7.25 5-11c0-2.761-2.239-5-5-5z" />
      <circle cx="10" cy="6" r="2" />
    </svg>
  );
}

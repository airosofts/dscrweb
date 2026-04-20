"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

/* ─────────────────────────── Data ─────────────────────────── */

type Geo = "national" | "state" | "metro";

type Tier = {
  id: string;
  name: string;
  placement: string;
  duration: string;
  badge: string | null;
  recommended: boolean;
  savings: string | null;
  features: string[];
  prices: Record<Geo, number>;
};

const TIERS: Tier[] = [
  {
    id: "starter", name: "Starter", placement: "Results Page Banner", duration: "1 month",
    badge: null, recommended: false, savings: null,
    features: ["Banner ad", "Impression reporting", "320×50 format"],
    prices: { national: 349, state: 119, metro: 69 },
  },
  {
    id: "premium", name: "Premium", placement: "Full-Screen Pop-Up", duration: "1 month",
    badge: null, recommended: false, savings: null,
    features: ["Full-screen interstitial", "Click analytics", "Custom creative"],
    prices: { national: 597, state: 199, metro: 119 },
  },
  {
    id: "growth", name: "Growth", placement: "Homepage Banner", duration: "3 months",
    badge: null, recommended: false, savings: null,
    features: ["Homepage placement", "Tap reporting", "Priority position"],
    prices: { national: 897, state: 299, metro: 179 },
  },
  {
    id: "pro", name: "Pro", placement: "Homepage + Banner", duration: "6 months",
    badge: "Best Value", recommended: true, savings: "Save 58% vs monthly",
    features: ["Dual placement", "Full dashboard", "A/B testing", "Dedicated support"],
    prices: { national: 1497, state: 497, metro: 297 },
  },
  {
    id: "premium-plus", name: "Premium Plus", placement: "Full-Screen Pop-Up", duration: "3 months",
    badge: "Popular", recommended: false, savings: "Save 16% vs monthly",
    features: ["Category exclusivity", "Monthly reviews", "Account rep"],
    prices: { national: 1497, state: 497, metro: 297 },
  },
];

const FEATURES_TABLE: { feature: string; values: boolean[] }[] = [
  { feature: "Impression reporting", values: [true, true, true, true, true] },
  { feature: "Click analytics", values: [false, true, true, true, true] },
  { feature: "A/B testing", values: [false, false, false, true, true] },
  { feature: "Dedicated support", values: [false, false, false, true, true] },
  { feature: "Category exclusivity", values: [false, false, false, false, true] },
];
const FEATURE_COLS = ["Starter", "Premium", "Growth", "Pro", "Premium+"];
const FEATURE_PRICES = ["$349", "$597", "$897", "$1,497", "$1,497"];

const FAQS = [
  { q: "What is geo targeting?", a: "Ads served by geography. National is live now — State and Metro targeting is coming soon at reduced pricing." },
  { q: "Can I change my creative?", a: "Yes. Upload new creative anytime during your flight. Changes go live within 24 hours." },
  { q: "How does billing work?", a: "One-time Stripe payment for the full duration. No recurring charges, no auto-renewal." },
  { q: "When does my ad go live?", a: "Within 24 hours of checkout and creative approval. You'll get a confirmation email with your dashboard." },
];

const COMING_SOON: Geo[] = ["state", "metro"];
const fmt = (v: number) => "$" + v.toLocaleString("en-US");
const geoLabel = (g: Geo) => g.charAt(0).toUpperCase() + g.slice(1);

/* ─────────────────────────── Component ─────────────────────────── */

export function PricingClient() {
  const [geo, setGeo] = useState<Geo>("national");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const comingSoon = COMING_SOON.includes(geo);
  const selected = useMemo(
    () => (selectedId ? TIERS.find((t) => t.id === selectedId) ?? null : null),
    [selectedId],
  );

  // Read URL params on mount
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const g = p.get("geo") as Geo | null;
    const t = p.get("tier");
    if (g && ["national", "state", "metro"].includes(g)) {
      setGeo(g);
      if (COMING_SOON.includes(g)) return;
    }
    if (t) {
      const match = TIERS.find((x) => x.id === t);
      if (match) setSelectedId(match.id);
    }
  }, []);

  const chooseGeo = (g: Geo) => {
    setGeo(g);
    if (COMING_SOON.includes(g)) setSelectedId(null);
  };

  const pick = (id: string) => {
    if (comingSoon) return;
    setSelectedId(selectedId === id ? null : id);
  };

  const router = useRouter();

  const handleCheckout = () => {
    if (!selected) return;
    router.push(`/checkout?plan=${selected.id}&geo=${geo}`);
  };

  return (
    <div className="bg-cream text-ink">
      <div className="relative z-10 mx-auto max-w-[720px] px-6 pb-32 pt-14 max-[600px]:pt-10">
        {/* GEO TOGGLE */}
        <div className="mb-8 flex flex-wrap items-center gap-3 max-[640px]:flex-col max-[640px]:items-start max-[640px]:gap-2">
          <span className="font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-muted">
            Targeting
          </span>
          <div className="inline-flex overflow-hidden border border-rule bg-card max-[420px]:w-full">
            {(["national", "state", "metro"] as Geo[]).map((g) => (
              <button
                key={g}
                onClick={() => chooseGeo(g)}
                className={
                  "relative px-5 py-2 text-xs font-semibold uppercase tracking-[0.06em] transition-all max-[420px]:flex-1 max-[420px]:px-3 max-[420px]:text-[11px] " +
                  (geo === g
                    ? "bg-ink text-cream"
                    : "bg-transparent text-muted hover:text-slate")
                }
              >
                {geoLabel(g)}
              </button>
            ))}
          </div>
        </div>

        {/* COMING SOON */}
        {comingSoon && (
          <div className="mb-7 flex items-center gap-3 border border-rule border-l-[3px] border-l-brass bg-card px-5 py-3.5 animate-[fadeSlide_0.25s_ease]">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brass opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-brass" />
            </span>
            <p className="text-[13px] leading-[1.5] text-slate">
              <strong className="font-bold text-ink">{geoLabel(geo)} Targeting</strong> is coming
              soon. All plans currently run nationwide.{" "}
              <a
                href="mailto:advertise@dscrcalculator.pro?subject=Geo%20Targeting%20Early%20Access"
                className="font-semibold text-brass transition-colors hover:text-brass-light"
              >
                Get notified →
              </a>
            </p>
          </div>
        )}

        {/* PLAN CARDS */}
        <div className="flex flex-col gap-3">
          {TIERS.map((t) => {
            const isSelected = !comingSoon && selectedId === t.id;
            return (
              <div
                key={t.id}
                onClick={() => pick(t.id)}
                className={
                  "relative border border-rule bg-card transition-all " +
                  /* brass left stripe — brand signature card pattern */
                  (isSelected
                    ? "border-l-[3px] border-l-brass shadow-[0_2px_12px_rgba(155,123,78,0.1)] "
                    : t.recommended
                      ? "border-l-[3px] border-l-brass "
                      : "border-l-[3px] border-l-transparent ") +
                  (comingSoon
                    ? "cursor-default opacity-40 "
                    : "cursor-pointer hover:border-l-brass hover:shadow-sm ")
                }
              >
                {/* Recommended badge */}
                {t.recommended && (
                  <div className="border-b border-rule bg-card-alt px-5 py-2">
                    <span className="font-mono text-[9px] font-medium uppercase tracking-[0.14em] text-brass">
                      Recommended
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-5 px-5 py-5 max-[640px]:flex-col max-[640px]:items-start max-[640px]:gap-4">
                  {/* Radio */}
                  <div
                    className={
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors " +
                      (isSelected ? "border-brass" : "border-rule")
                    }
                  >
                    <div
                      className={
                        "h-2.5 w-2.5 rounded-full transition-colors " +
                        (isSelected ? "bg-brass" : "bg-transparent")
                      }
                    />
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2.5">
                      <span className="text-[15px] font-bold text-ink">{t.name}</span>
                      {t.badge && (
                        <span className="bg-ink px-2 py-[2px] font-mono text-[9px] font-medium uppercase tracking-[0.1em] text-cream">
                          {t.badge}
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex items-center gap-1.5 text-[13px] text-muted">
                      <span>{t.placement}</span>
                      <span className="opacity-40">·</span>
                      <span>{t.duration}</span>
                    </div>
                    {/* Features */}
                    <div className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1">
                      {t.features.map((f) => (
                        <span key={f} className="flex items-center gap-1.5 text-xs text-slate">
                          <span className="h-[3px] w-[3px] shrink-0 rounded-full bg-brass" />
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Price */}
                  <div className="shrink-0 text-right max-[640px]:w-full max-[640px]:border-t max-[640px]:border-rule max-[640px]:pt-3 max-[640px]:text-left">
                    {comingSoon ? (
                      <span className="inline-block border border-rule bg-card-alt px-3.5 py-1.5 font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-muted">
                        Coming Soon
                      </span>
                    ) : (
                      <>
                        <div
                          className={
                            "text-[26px] font-extrabold leading-none tracking-[-0.02em] " +
                            (isSelected ? "text-brass" : "text-ink")
                          }
                        >
                          {fmt(t.prices[geo])}
                        </div>
                        <div className="mt-1 font-mono text-[10px] tracking-[0.04em] text-muted">
                          {t.duration}
                        </div>
                        {t.savings && (
                          <div className="mt-1.5 font-mono text-[9px] font-semibold tracking-[0.06em] text-green-700">
                            {t.savings}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* FEATURES TABLE */}
        <div className="mt-14">
          <div className="mb-5 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-muted">
            Compare Plans
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-[640px] w-full border-collapse border border-rule border-l-[3px] border-l-brass bg-card">
              <thead>
                <tr className="border-b border-rule bg-card-alt">
                  <th className="px-5 py-4 text-left font-mono text-[10px] font-medium uppercase tracking-[0.1em] text-muted">
                    Feature
                  </th>
                  {FEATURE_COLS.map((col, i) => (
                    <th
                      key={col}
                      className={
                        "px-5 py-4 text-left text-[13px] font-bold text-ink " +
                        (col === "Pro" ? "!text-brass" : "")
                      }
                    >
                      {col}
                      {col === "Pro" && <span className="ml-1">★</span>}
                      <br />
                      <span className="font-normal text-muted opacity-60">{FEATURE_PRICES[i]}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {FEATURES_TABLE.map((row, ri) => (
                  <tr key={row.feature} className={ri < FEATURES_TABLE.length - 1 ? "border-b border-rule" : ""}>
                    <td className="px-5 py-3 text-[13px] font-medium text-ink">{row.feature}</td>
                    {row.values.map((v, ci) => (
                      <td key={ci} className="px-5 py-3">
                        {v ? (
                          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-brass/[0.08]">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-3 w-3 text-brass">
                              <path d="M5 12l5 5L20 7" />
                            </svg>
                          </span>
                        ) : (
                          <span className="inline-flex h-5 w-5 items-center justify-center">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3 w-3 text-muted/35">
                              <path d="M5 12h14" />
                            </svg>
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-12">
          <div className="mb-4 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-muted">
            FAQ
          </div>
          <div className="grid grid-cols-2 gap-2 max-[640px]:grid-cols-1">
            {FAQS.map((f) => (
              <div key={f.q} className="border border-rule border-l-[3px] border-l-brass bg-card px-5 py-5">
                <h4 className="mb-1.5 text-sm font-bold text-ink">{f.q}</h4>
                <p className="text-[13px] leading-[1.6] text-slate">{f.a}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* STICKY CHECKOUT */}
      <div
        className={
          "fixed inset-x-0 bottom-0 z-40 border-t border-rule/60 bg-cream/92 backdrop-blur-2xl transition-transform duration-300 " +
          (selected && !comingSoon ? "translate-y-0" : "translate-y-full")
        }
      >
        <div className="mx-auto flex max-w-[720px] items-center justify-between gap-5 px-6 py-4 max-[640px]:flex-col max-[640px]:gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-4 max-[640px]:w-full max-[640px]:justify-between">
            <div className="flex min-w-0 flex-col">
              <div className="truncate text-sm font-bold text-ink">
                {selected ? `${selected.name} · ${selected.placement}` : "—"}
              </div>
              <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.06em] text-muted">
                {selected ? `${selected.duration} · ${geoLabel(geo)}` : "—"}
              </div>
            </div>
            <div className="h-7 w-px shrink-0 bg-rule max-[640px]:hidden" />
            <div>
              <div className="text-[22px] font-extrabold leading-none tracking-[-0.02em] text-brass">
                {selected ? fmt(selected.prices[geo]) : "—"}
              </div>
              <div className="mt-0.5 font-mono text-[9px] tracking-[0.06em] text-muted">
                {selected ? `One-time · ${selected.duration}` : "—"}
              </div>
            </div>
          </div>
          <button
            onClick={handleCheckout}
            className="flex items-center gap-2 whitespace-nowrap bg-ink px-9 py-3.5 text-[13px] font-bold uppercase tracking-[0.08em] text-cream transition-all hover:bg-ink-mid hover:-translate-y-px max-[640px]:w-full max-[640px]:justify-center"
          >
            Checkout
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
            </svg>
          </button>
        </div>
        <div className="flex items-center justify-center gap-1.5 pb-3 font-mono text-[9px] tracking-[0.06em] text-muted opacity-50">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 10h18" />
          </svg>
          Secured by Stripe
        </div>
      </div>
    </div>
  );
}

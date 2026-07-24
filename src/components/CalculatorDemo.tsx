'use client';

import { useEffect, useRef, useState } from 'react';
import { Inter } from 'next/font/google';

// The Flutter app renders 100% in Inter (google_fonts).
const inter = Inter({ subsets: ['latin'] });

/**
 * Looping animated demo of the REAL DSCR Calculator app screen.
 *
 * Every metric below (heights, paddings, font sizes, letterspacing, radii,
 * colors) is transcribed 1:1 from calculator_screen.dart / banner_ad_widget /
 * popup_ad_widget and verified against a live iPhone 16 Pro simulator
 * screenshot. The screen is laid out in the app's native 402pt coordinate
 * space and scaled to fit the phone frame with a CSS transform, so ratios
 * are exact by construction.
 *
 * mode="popup":  fills every field while auto-scrolling, taps CALCULATE DSCR,
 *                shows the dark results card, then the popup ad (5s counter).
 * mode="banner": form pre-filled; idles up and down while the banner rotates.
 */

// App design tokens (constants in calculator_screen.dart)
const INK = '#0A1628';
const SLATE = '#3D5166';
const BRASS = '#9B7B4E';
const BRASS_LIGHT = '#B8976A';
const BRASS_PALE = '#D4B896';
const PARCH = '#F7F5F1';
const LINEN = '#E4DED5';
const MIST = '#7B90A4';
const FOG = '#A8B8C6';
const GREEN = '#6FCF97';

// iPhone 16 Pro logical size (what the simulator runs at)
const SCREEN_W = 402;
const SCREEN_H = 874;
const FRAME_W = 302; // inner screen width inside the bezel at 320px phone
const S = FRAME_W / SCREEN_W;

type Mode = 'banner' | 'popup';

interface FieldDef {
  id: string; label: string; prefix?: string; suffix?: string;
  target: number; decimals?: number;
}
interface SectionDef { title: string; fields: FieldDef[] }

// Exact sections/fields/order of the app (Purchase mode).
const SECTIONS: SectionDef[] = [
  {
    title: 'Property Details',
    fields: [
      { id: 'rent',   label: 'Monthly Rent',            prefix: '$', target: 3500 },
      { id: 'taxes',  label: 'Annual Property Taxes',   prefix: '$', target: 4200 },
      { id: 'ins',    label: 'Annual Insurance',        prefix: '$', target: 1800 },
      { id: 'mgmt',   label: 'Property Mgmt Fee',       suffix: '%', target: 8 },
      { id: 'hoa',    label: 'Annual HOA',              prefix: '$', target: 1200 },
    ],
  },
  {
    title: 'Loan Details',
    fields: [
      { id: 'price',  label: 'Purchase Price / ARV',    prefix: '$', target: 375000 },
      { id: 'amount', label: 'Loan Amount',             prefix: '$', target: 300000 },
      { id: 'ltv',    label: 'Loan-to-Value (LTV)',     suffix: '%', target: 80 },
      { id: 'rate',   label: 'Interest Rate',           suffix: '%', target: 7.5, decimals: 1 },
      { id: 'term',   label: 'Loan Term (Years)',                    target: 30 },
    ],
  },
  {
    title: 'Closing Costs',
    fields: [
      { id: 'orig',    label: 'Origination Fee (Fixed)', prefix: '$', target: 3000 },
      { id: 'lfees',   label: 'Loan Fees',              prefix: '$', target: 1500 },
      { id: 'tfees',   label: 'Title Fees',             prefix: '$', target: 1200 },
      { id: 'escrow',  label: 'Escrow',                 prefix: '$', target: 800 },
      { id: 'ppint',   label: 'Prepaid Interest',       prefix: '$', target: 600 },
      { id: 'ppins',   label: 'Prepaid Insurance',      prefix: '$', target: 800 },
      { id: 'reserve', label: 'Payment Reserve',        prefix: '$', target: 3600 },
    ],
  },
];
const ALL_FIELDS = SECTIONS.flatMap((s) => s.fields);

const fullValues = () => Object.fromEntries(ALL_FIELDS.map((f) => [f.id, f.target]));
const zeroValues = () => Object.fromEntries(ALL_FIELDS.map((f) => [f.id, 0]));

/* Small inline icons (the app uses Material icons) */
const RefreshIcon = ({ size, color }: { size: number; color: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12a9 9 0 1 1-2.64-6.36" /><polyline points="21 3 21 9 15 9" />
  </svg>
);
const MegaphoneIcon = ({ size, color }: { size: number; color: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 11 18-5v12L3 13" /><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
  </svg>
);
const ArrowIcon = ({ size, color }: { size: number; color: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
);
const PdfIcon = ({ size, color }: { size: number; color: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
  </svg>
);

export function CalculatorDemo({ mode }: { mode: Mode }) {
  const [values, setValues] = useState<Record<string, number>>(
    mode === 'banner' ? fullValues() : zeroValues());
  const [activeId, setActiveId] = useState<string | null>(null);
  const [pressed, setPressed] = useState(false);
  const [showResult, setShowResult] = useState(mode === 'banner');
  const [popup, setPopup] = useState(false);
  const [count, setCount] = useState(5);
  const [banner, setBanner] = useState(0);

  const viewportRef = useRef<HTMLDivElement>(null);
  const fieldRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const buttonRef = useRef<HTMLButtonElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const alive = useRef(true);

  // Banner rotation (banner mode only)
  useEffect(() => {
    if (mode !== 'banner') return;
    const t = setInterval(() => setBanner((b) => (b + 1) % 3), 2600);
    return () => clearInterval(t);
  }, [mode]);

  useEffect(() => {
    alive.current = true;
    const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
    const scrollTo = (el: HTMLElement | null, offset = 90) => {
      const vp = viewportRef.current;
      if (vp && el) vp.scrollTo({ top: Math.max(0, el.offsetTop - offset), behavior: 'smooth' });
    };
    const setVal = (id: string, v: number) => setValues((prev) => ({ ...prev, [id]: v }));
    const animate = (id: string, target: number, dur: number) =>
      new Promise<void>((resolve) => {
        const start = performance.now();
        const tick = (now: number) => {
          if (!alive.current) return resolve();
          const t = Math.min(1, Math.max(0, (now - start) / dur));
          setVal(id, target * (1 - Math.pow(1 - t, 3)));
          if (t < 1) requestAnimationFrame(tick);
          else resolve();
        };
        requestAnimationFrame(tick);
      });

    if (mode === 'popup') {
      (async () => {
        while (alive.current) {
          setValues(zeroValues());
          setActiveId(null); setPressed(false); setShowResult(false); setPopup(false); setCount(5);
          viewportRef.current?.scrollTo({ top: 0 });
          await sleep(800); if (!alive.current) break;

          for (const f of ALL_FIELDS) {
            if (!alive.current) break;
            setActiveId(f.id);
            scrollTo(fieldRefs.current[f.id]);
            await animate(f.id, f.target, 230);
            await sleep(110);
          }
          setActiveId(null);
          if (!alive.current) break;

          scrollTo(buttonRef.current, 190);
          await sleep(500);
          setPressed(true); await sleep(350); setPressed(false);
          setShowResult(true);
          await sleep(120);
          scrollTo(resultRef.current, 110);
          await sleep(1600);

          setPopup(true);
          for (let n = 5; n >= 1; n--) { setCount(n); await sleep(1000); if (!alive.current) break; }
          setCount(0);
          await sleep(700);
          setPopup(false);
          await sleep(600);
        }
      })();
    } else {
      (async () => {
        await sleep(600);
        while (alive.current) {
          scrollTo(resultRef.current, 110);
          await sleep(3200); if (!alive.current) break;
          viewportRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
          await sleep(3200);
        }
      })();
    }
    return () => { alive.current = false; };
  }, [mode]);

  // Inputs show raw digits exactly as typed in the app — no thousands commas.
  const fmt = (f: FieldDef, v: number) =>
    f.decimals ? v.toFixed(f.decimals) : String(Math.round(v));

  return (
    <div className={`relative ${inter.className}`} style={{ width: 320, filter: 'drop-shadow(0 30px 46px rgba(0,0,0,0.5))' }}>
      <div className="relative rounded-[46px] p-[3px]" style={{ background: 'linear-gradient(145deg,#3a3a3f,#1a1a1d 25%,#2a2a2e 50%,#121214 75%,#2e2e32)' }}>
        <div className="relative rounded-[43px] p-[6px]" style={{ background: 'linear-gradient(145deg,#0a0a0b,#1c1c1f 50%,#0a0a0b)' }}>
          {/* screen: native 402x874pt canvas scaled to the frame */}
          <div className="relative overflow-hidden rounded-[37px]" style={{ width: FRAME_W, height: Math.round(SCREEN_H * S), background: PARCH }}>
            <div style={{ width: SCREEN_W, height: SCREEN_H, transform: `scale(${S})`, transformOrigin: 'top left', display: 'flex', flexDirection: 'column', background: PARCH, position: 'relative', textAlign: 'left' }}>

              {/* ── Status bar (62pt incl. island row) ── */}
              <div style={{ height: 62, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 40px 0' }}>
                <span style={{ fontSize: 17, fontWeight: 600, color: '#000' }}>9:41</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {/* cellular / wifi / battery */}
                  <svg width="18" height="12" viewBox="0 0 18 12"><g fill="#000"><rect x="0" y="7" width="3" height="4" rx="1"/><rect x="5" y="5" width="3" height="6" rx="1"/><rect x="10" y="2.5" width="3" height="8.5" rx="1"/><rect x="15" y="0" width="3" height="11" rx="1"/></g></svg>
                  <svg width="17" height="12" viewBox="0 0 17 12" fill="#000"><path d="M8.5 9.5a2 2 0 0 1 2 2l-2 .5-2-.5a2 2 0 0 1 2-2zM8.5 5.6c1.9 0 3.6.7 4.9 1.9l-1.4 1.5a4.9 4.9 0 0 0-7 0L3.6 7.5a7 7 0 0 1 4.9-1.9zM8.5 1.5c3 0 5.8 1.2 7.9 3.1L15 6.1a9 9 0 0 0-13 0L.6 4.6A11.2 11.2 0 0 1 8.5 1.5z"/></svg>
                  <svg width="25" height="12" viewBox="0 0 25 12"><rect x="0.5" y="0.5" width="21" height="11" rx="3.5" fill="none" stroke="#000" strokeOpacity="0.35"/><rect x="2" y="2" width="18" height="8" rx="2" fill="#000"/><path d="M23 4v4a2.2 2.2 0 0 0 0-4z" fill="#000" fillOpacity="0.4"/></svg>
                </span>
              </div>

              {/* ── Header — ink, padding 20/14, title 13/600/ls1 ── */}
              <div style={{ background: INK, padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: 1, color: '#fff' }}>DSCR CALCULATOR PRO</span>
                <span style={{ padding: '7px 10px', border: '1px solid rgba(155,123,78,0.35)', borderRadius: 3, display: 'flex' }}>
                  <RefreshIcon size={18} color={BRASS_LIGHT} />
                </span>
              </div>
              {/* brass accent hairline under header */}
              <div style={{ height: 1, background: 'rgba(155,123,78,0.3)' }} />

              {/* ── Banner ad slot — full-width, flush (50pt creative / 56pt house) ── */}
              <BannerSlot variant={mode === 'banner' ? banner : 2} />

              {/* ── Scrollable content — padding 16/16/40 ── */}
              <div ref={viewportRef} style={{ flex: 1, overflow: 'hidden', padding: '16px 16px 40px', position: 'relative' }}>
                <div style={{ height: 4 }} />
                <SectionLabel>Loan Purpose</SectionLabel>
                <div style={{ height: 7 }} />
                <InkToggle options={['Purchase', 'Refinance']} />
                <div style={{ height: 18 }} />
                <SectionLabel>Loan Type</SectionLabel>
                <div style={{ height: 7 }} />
                <InkToggle options={['Amortizing', 'Interest Only']} />
                <div style={{ padding: '18px 0' }}><div style={{ height: 1, background: LINEN }} /></div>

                {SECTIONS.map((s, si) => (
                  <div key={s.title}>
                    <BrassCard title={s.title}>
                      {s.title === 'Closing Costs' && (
                        <div style={{ paddingBottom: 8 }}>
                          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1, color: MIST }}>ORIGINATION FEE</div>
                          <div style={{ height: 5 }} />
                          <SubToggle options={['Fixed $', 'Percent %']} />
                        </div>
                      )}
                      {s.fields.map((f, fi) => (
                        <div key={f.id} ref={(el) => { fieldRefs.current[f.id] = el; }}>
                          <AppField
                            label={f.label}
                            prefix={f.prefix}
                            suffix={f.suffix}
                            value={fmt(f, values[f.id] ?? 0)}
                            activeNow={activeId === f.id}
                            isLast={fi === s.fields.length - 1}
                          />
                        </div>
                      ))}
                    </BrassCard>
                    {si < SECTIONS.length - 1 && <div style={{ height: 14 }} />}
                  </div>
                ))}

                <div style={{ height: 20 }} />
                {/* CALCULATE DSCR — 48pt, ink, radius 4, 13/600/ls1 */}
                <button
                  ref={buttonRef}
                  style={{
                    width: '100%', height: 48, background: INK, color: '#fff', border: 'none',
                    borderRadius: 4, fontSize: 13, fontWeight: 600, letterSpacing: 1,
                    fontFamily: 'inherit', transition: 'transform 150ms',
                    transform: pressed ? 'scale(0.97)' : 'none', cursor: 'default',
                  }}
                >
                  CALCULATE DSCR
                </button>

                {/* ── Results — DARK ink card with brass grid texture ── */}
                <div ref={resultRef} style={{ overflow: 'hidden', transition: 'all 500ms', maxHeight: showResult ? 900 : 0, opacity: showResult ? 1 : 0 }}>
                  <div style={{ height: 18 }} />
                  <div style={{
                    background: INK, border: '1px solid rgba(155,123,78,0.2)', borderRadius: 4, padding: 18,
                    backgroundImage:
                      'repeating-linear-gradient(0deg, rgba(212,184,150,0.045) 0 1px, transparent 1px 24px),' +
                      'repeating-linear-gradient(90deg, rgba(212,184,150,0.045) 0 1px, transparent 1px 24px)',
                  }}>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.2, color: BRASS_PALE }}>RESULTS</div>
                    <div style={{ height: 10 }} />
                    <div style={{ height: 1, background: 'rgba(212,184,150,0.15)' }} />

                    <ResRow label="DSCR">
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 26, fontWeight: 300, color: BRASS_PALE, lineHeight: 1.1 }}>1.25</div>
                        <div style={{ height: 4 }} />
                        <span style={{
                          display: 'inline-block', padding: '3px 8px', borderRadius: 2,
                          background: 'rgba(111,207,151,0.1)', border: '1px solid rgba(111,207,151,0.35)',
                          fontSize: 10, fontWeight: 600, letterSpacing: 0.8, color: GREEN,
                        }}>✓ STRONG COVERAGE</span>
                      </div>
                    </ResRow>
                    <ResDivider />
                    <ResRow label="Monthly Payment (PITIA)">
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 15, fontWeight: 600, color: '#fff' }}>$2,698</div>
                        <div style={{ fontSize: 11, fontWeight: 400, color: FOG }}>P&I: $2,098</div>
                      </div>
                    </ResRow>
                    <ResDivider />
                    <ResRow label="Monthly Cashflow">
                      <span style={{ fontSize: 15, fontWeight: 600, color: GREEN }}>$522</span>
                    </ResRow>
                    <ResDivider />
                    <ResRow label="Annual Cash Flow">
                      <span style={{ fontSize: 15, fontWeight: 600, color: GREEN }}>$6,268</span>
                    </ResRow>
                    <ResDivider />
                    <ResRow label="Net Operating Income">
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 15, fontWeight: 600, color: '#fff' }}>$31,440</div>
                        <div style={{ fontSize: 11, fontWeight: 400, color: FOG }}>Annual</div>
                      </div>
                    </ResRow>
                    <ResDivider />
                    <ResRow label="Cap Rate">
                      <span style={{ fontSize: 15, fontWeight: 600, color: '#fff' }}>8.38%</span>
                    </ResRow>
                  </div>

                  <div style={{ height: 12 }} />
                  {/* EXPORT PDF — outlined, 44pt */}
                  <div style={{
                    height: 44, border: `1.5px solid ${LINEN}`, borderRadius: 4,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'transparent',
                  }}>
                    <PdfIcon size={16} color={INK} />
                    <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: 0.8, color: INK }}>EXPORT PDF</span>
                  </div>
                </div>

                <div style={{ height: 12 }} />
                {/* ADVERTISE WITH US — always visible, brass outline, 44pt */}
                <div style={{
                  height: 44, border: '1.5px solid rgba(155,123,78,0.4)', borderRadius: 4,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}>
                  <MegaphoneIcon size={16} color={BRASS} />
                  <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: 0.8, color: BRASS }}>ADVERTISE WITH US</span>
                </div>
              </div>

              {/* ── POPUP AD — width-32, 50% height, radius 16 (popup_ad_widget) ── */}
              <div style={{
                position: 'absolute', inset: 0, zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'opacity 300ms', opacity: popup ? 1 : 0, pointerEvents: 'none',
              }}>
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)' }} />
                <div style={{
                  position: 'relative', width: SCREEN_W - 32, height: SCREEN_H * 0.5,
                  background: '#fff', borderRadius: 16, overflow: 'hidden',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
                  transition: 'transform 300ms cubic-bezier(0.33,1,0.68,1)',
                  transform: popup ? 'translateY(0)' : 'translateY(40px)',
                }}>
                  {/* the ad creative */}
                  <div style={{
                    position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', gap: 10, textAlign: 'center',
                    background: `linear-gradient(160deg,#132540,${INK})`, padding: 24,
                  }}>
                    <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 3, color: BRASS_PALE }}>YOUR AD HERE</div>
                    <div style={{ fontSize: 24, fontWeight: 800, lineHeight: 1.15, color: '#fff' }}>Generic Lender<br />Funnel LLC</div>
                    <div style={{ fontSize: 13, lineHeight: 1.4, color: MIST }}>DSCR loans up to 80% LTV.<br />Close in 21 days.</div>
                    <div style={{ marginTop: 6, padding: '10px 18px', borderRadius: 5, background: BRASS, color: '#fff', fontSize: 12, fontWeight: 700, letterSpacing: 0.8 }}>
                      GET PRE-QUALIFIED →
                    </div>
                  </div>
                  {/* AD chip — top-left 8,8 */}
                  <span style={{
                    position: 'absolute', top: 8, left: 8, padding: '3px 8px', borderRadius: 4,
                    background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: 9, fontWeight: 700, letterSpacing: 1,
                  }}>AD</span>
                  {/* countdown circle — top-right 8,8, 32pt */}
                  <span style={{
                    position: 'absolute', top: 8, right: 8, width: 32, height: 32, borderRadius: '50%',
                    background: count === 0 ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontSize: count === 0 ? 16 : 12, fontWeight: 600,
                  }}>{count === 0 ? '×' : count}</span>
                </div>
              </div>

              {/* Dynamic Island */}
              <div style={{ position: 'absolute', top: 11, left: '50%', transform: 'translateX(-50%)', width: 125, height: 37, borderRadius: 20, background: '#000', zIndex: 30 }} />
              {/* home indicator */}
              <div style={{ position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)', width: 140, height: 5, borderRadius: 3, background: 'rgba(0,0,0,0.85)', zIndex: 30 }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Banner slot — exact banner_ad_widget metrics ── */

function BannerSlot({ variant }: { variant: number }) {
  // variant 0/1: paid creatives (50pt, cover on ink) — variant 2: house ad (56pt dashed)
  if (variant === 0) {
    return (
      <div style={{ height: 50, background: INK, display: 'flex', alignItems: 'center', gap: 12, padding: '0 16px' }}>
        <div style={{ width: 34, height: 34, borderRadius: 4, background: BRASS, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>G</span>
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>GENERIC LENDER FUNNEL</div>
          <div style={{ fontSize: 10, color: BRASS_PALE }}>DSCR loans · up to 80% LTV</div>
        </div>
        <div style={{ padding: '6px 12px', borderRadius: 4, background: BRASS, color: '#fff', fontSize: 10, fontWeight: 700, letterSpacing: 0.5, flexShrink: 0 }}>APPLY</div>
      </div>
    );
  }
  if (variant === 1) {
    return (
      <div style={{ height: 50, background: '#fff', display: 'flex', alignItems: 'center', gap: 12, padding: '0 16px', borderBottom: `1px solid ${LINEN}` }}>
        <div style={{ width: 34, height: 34, borderRadius: 17, background: '#C0392B', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>B</span>
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Bridge Capital Partners</div>
          <div style={{ fontSize: 10, color: '#777' }}>Close your next deal in 21 days</div>
        </div>
        <div style={{ padding: '7px 12px', borderRadius: 4, background: '#C0392B', color: '#fff', fontSize: 11, fontWeight: 700, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
          Get Rates <ArrowIcon size={10} color="#fff" />
        </div>
      </div>
    );
  }
  // house fallback: 56pt, parchment, dashed brass box (padding 16/6)
  return (
    <div style={{ height: 56, background: PARCH, padding: '6px 16px' }}>
      <div style={{
        height: '100%', border: '1px dashed rgba(155,123,78,0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
      }}>
        <MegaphoneIcon size={14} color="rgba(155,123,78,0.7)" />
        <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1, color: BRASS }}>YOUR AD HERE — ADVERTISE WITH US</span>
        <ArrowIcon size={12} color="rgba(155,123,78,0.6)" />
      </div>
    </div>
  );
}

/* ── Exact widget transcriptions ── */

// _SectionLabel: 10/600/brass/ls1.2, padding-left 2
function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div style={{ paddingLeft: 2, fontSize: 10, fontWeight: 600, letterSpacing: 1.2, color: BRASS, textTransform: 'uppercase' }}>{children}</div>;
}

// _InkToggle: h42, ink border 1.5, radius 4, halves split by 1px ink,
// text 12/600/ls0.5 — selected ink/white, unselected white/SLATE
function InkToggle({ options }: { options: string[] }) {
  return (
    <div style={{ height: 42, border: `1.5px solid ${INK}`, borderRadius: 4, overflow: 'hidden', display: 'flex', background: '#fff' }}>
      {options.map((o, i) => (
        <div key={o} style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: i === 0 ? INK : '#fff',
          borderRight: i < options.length - 1 ? `1px solid ${INK}` : 'none',
          fontSize: 12, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase',
          color: i === 0 ? '#fff' : SLATE,
        }}>{o}</div>
      ))}
    </div>
  );
}

// _SubToggle: h32, linen border, radius 3, text ls0.6
function SubToggle({ options }: { options: string[] }) {
  return (
    <div style={{ height: 32, border: `1px solid ${LINEN}`, borderRadius: 3, overflow: 'hidden', display: 'flex', background: '#fff' }}>
      {options.map((o, i) => (
        <div key={o} style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: i === 0 ? INK : '#fff',
          borderRight: i < options.length - 1 ? `1px solid ${LINEN}` : 'none',
          fontSize: 11, fontWeight: 600, letterSpacing: 0.6,
          color: i === 0 ? '#fff' : SLATE,
        }}>{o}</div>
      ))}
    </div>
  );
}

// _BrassCard: white, 1px linen border, radius 4, 3px brass left border,
// padding LTRB(16,18,18,18), title 10/700/mist/ls1.2, divider, gap 14
function BrassCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: '#fff', border: `1px solid ${LINEN}`, borderLeft: `3px solid ${BRASS}`,
      borderRadius: 4, padding: '18px 18px 18px 16px',
    }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.2, color: MIST, textTransform: 'uppercase' }}>{title}</div>
      <div style={{ height: 10 }} />
      <div style={{ height: 1, background: LINEN }} />
      <div style={{ height: 14 }} />
      {children}
    </div>
  );
}

// _Field: label 10/600/mist/ls1 → 5pt gap → box: parchment bg, 1px linen
// border (brass on focus), radius 3, 12pt h-padding, 37pt tall;
// prefix/suffix 14/400/mist; value 15/500/ink. 12pt below (except last).
function AppField({ label, value, prefix, suffix, activeNow, isLast }: {
  label: string; value: string; prefix?: string; suffix?: string; activeNow: boolean; isLast: boolean;
}) {
  return (
    <div style={{ paddingBottom: isLast ? 0 : 12 }}>
      <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1, color: MIST, textTransform: 'uppercase' }}>{label}</div>
      <div style={{ height: 5 }} />
      <div style={{
        height: 37, display: 'flex', alignItems: 'center', padding: '0 12px',
        background: PARCH, borderRadius: 3,
        border: `1px solid ${activeNow ? BRASS : LINEN}`,
        transition: 'border-color 120ms',
      }}>
        {prefix && <span style={{ fontSize: 14, fontWeight: 400, color: MIST, marginRight: 4 }}>{prefix}</span>}
        <span style={{ fontSize: 15, fontWeight: 500, color: INK }}>{value}</span>
        {activeNow && <span className="animate-pulse" style={{ display: 'inline-block', width: 1.5, height: 17, background: BRASS, marginLeft: 1 }} />}
        {suffix && <span style={{ fontSize: 14, fontWeight: 400, color: MIST, marginLeft: 'auto' }}>{suffix}</span>}
      </div>
    </div>
  );
}

// _ResRow: vertical padding 9, label 10/500/FOG/ls0.8 uppercase
function ResRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ padding: '9px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
      <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: 0.8, color: FOG, textTransform: 'uppercase', lineHeight: 1.3, maxWidth: '55%' }}>{label}</span>
      {children}
    </div>
  );
}

function ResDivider() {
  return <div style={{ height: 1, background: 'rgba(212,184,150,0.15)' }} />;
}

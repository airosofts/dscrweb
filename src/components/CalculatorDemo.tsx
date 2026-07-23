'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Looping animated demo of the REAL DSCR Calculator app screen — same
 * sections, same fields, same order as the Flutter app (Property Details,
 * Loan Details, Closing Costs → CALCULATE DSCR → results).
 *
 * mode="popup":  fills every field quickly while auto-scrolling, taps
 *                CALCULATE DSCR, shows the result, then the full-screen
 *                pop-up ad appears with the 5-second dismiss counter.
 * mode="banner": form already filled; idles up and down the screen while
 *                the banner slot rotates ad creatives.
 *
 * Pure React/CSS — no video.
 */

// App design tokens (from calculator_screen.dart)
const INK = '#0A1628';
const SLATE = '#3D5166';
const BRASS = '#9B7B4E';
const BRASS_LIGHT = '#B8976A';
const BRASS_PALE = '#D4B896';
const PARCH = '#F7F5F1';
const LINEN = '#E4DED5';
const MIST = '#7B90A4';

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
      { id: 'price',  label: 'Purchase Price',          prefix: '$', target: 375000 },
      { id: 'amount', label: 'Loan Amount',             prefix: '$', target: 300000 },
      { id: 'ltv',    label: 'Loan-to-Value (LTV)',     suffix: '%', target: 80 },
      { id: 'rate',   label: 'Interest Rate',           suffix: '%', target: 7.5, decimals: 1 },
      { id: 'term',   label: 'Loan Term (Years)',                   target: 30 },
    ],
  },
  {
    title: 'Closing Costs',
    fields: [
      { id: 'orig',    label: 'Origination Fee',        prefix: '$', target: 3000 },
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

const BANNER_ADS = [
  { name: 'GENERIC LENDER FUNNEL', tag: 'DSCR loans · up to 80% LTV' },
  { name: 'BRIDGE CAPITAL PARTNERS', tag: 'Close your deal in 21 days' },
  { house: true as const },
];

const fullValues = () => Object.fromEntries(ALL_FIELDS.map((f) => [f.id, f.target]));
const zeroValues = () => Object.fromEntries(ALL_FIELDS.map((f) => [f.id, 0]));

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
    const t = setInterval(() => setBanner((b) => (b + 1) % BANNER_ADS.length), 2500);
    return () => clearInterval(t);
  }, [mode]);

  useEffect(() => {
    alive.current = true;
    const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
    const scrollTo = (el: HTMLElement | null, offset = 64) => {
      const vp = viewportRef.current;
      if (vp && el) vp.scrollTo({ top: Math.max(0, el.offsetTop - offset), behavior: 'smooth' });
    };
    const setVal = (id: string, v: number) => setValues((prev) => ({ ...prev, [id]: v }));
    const animate = (id: string, target: number, dur: number) =>
      new Promise<void>((resolve) => {
        const start = performance.now();
        const tick = (now: number) => {
          if (!alive.current) return resolve();
          const t = Math.min(1, (now - start) / dur);
          setVal(id, target * (1 - Math.pow(1 - t, 3)));
          if (t < 1) requestAnimationFrame(tick);
          else resolve();
        };
        requestAnimationFrame(tick);
      });

    if (mode === 'popup') {
      (async () => {
        while (alive.current) {
          // reset
          setValues(zeroValues());
          setActiveId(null); setPressed(false); setShowResult(false); setPopup(false); setCount(5);
          viewportRef.current?.scrollTo({ top: 0 });
          await sleep(800); if (!alive.current) break;

          // fill EVERY field quickly, auto-scrolling as we go
          for (const f of ALL_FIELDS) {
            if (!alive.current) break;
            setActiveId(f.id);
            scrollTo(fieldRefs.current[f.id]);
            await animate(f.id, f.target, 230);
            await sleep(110);
          }
          setActiveId(null);
          if (!alive.current) break;

          // calculate
          scrollTo(buttonRef.current, 140);
          await sleep(500);
          setPressed(true); await sleep(350); setPressed(false);
          setShowResult(true);
          await sleep(120);
          scrollTo(resultRef.current, 90);
          await sleep(1600);

          // the pop-up ad
          setPopup(true);
          for (let n = 5; n >= 1; n--) { setCount(n); await sleep(1000); if (!alive.current) break; }
          await sleep(400);
          setPopup(false);
          await sleep(600);
        }
      })();
    } else {
      // banner mode: gentle idle scroll down to results and back, forever
      (async () => {
        await sleep(600);
        while (alive.current) {
          scrollTo(resultRef.current, 90);
          await sleep(3200); if (!alive.current) break;
          viewportRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
          await sleep(3200);
        }
      })();
    }
    return () => { alive.current = false; };
  }, [mode]);

  // The app shows raw digits — "$ 3500", no thousands separators.
  const fmt = (f: FieldDef, v: number) => {
    if (f.suffix === '%') return `${(f.decimals ? v.toFixed(f.decimals) : Math.round(v))}%`;
    if (f.prefix === '$') return '$' + Math.round(v);
    return String(Math.round(v));
  };
  const bannerAd = mode === 'banner' ? BANNER_ADS[banner] : BANNER_ADS[0];

  return (
    <div className="relative" style={{ width: 320, filter: 'drop-shadow(0 30px 46px rgba(0,0,0,0.5))' }}>
      <div className="relative rounded-[46px] p-[3px]" style={{ background: 'linear-gradient(145deg,#3a3a3f,#1a1a1d 25%,#2a2a2e 50%,#121214 75%,#2e2e32)' }}>
        <div className="relative rounded-[43px] p-[6px]" style={{ background: 'linear-gradient(145deg,#0a0a0b,#1c1c1f 50%,#0a0a0b)' }}>
          <div className="relative flex flex-col overflow-hidden rounded-[37px]" style={{ aspectRatio: '9 / 19.5', background: PARCH }}>

            {/* ── Status bar (cream, like the app) ── */}
            <div className="flex shrink-0 items-end justify-between px-5 pb-1 pt-4" style={{ background: PARCH }}>
              <span className="text-[10px] font-bold" style={{ color: '#000' }}>2:18</span>
              <span className="text-[8px]" style={{ color: '#000' }}>▮▮ ⚡</span>
            </div>

            {/* ── App header (ink band) ── */}
            <div className="flex shrink-0 items-center justify-between px-4 py-2.5" style={{ background: INK }}>
              <span className="text-[10.5px] font-semibold tracking-[0.12em] text-white">DSCR CALCULATOR PRO</span>
              <span className="flex h-6 w-6 items-center justify-center rounded-sm border text-[12px]" style={{ borderColor: 'rgba(155,123,78,0.35)', color: BRASS_LIGHT }}>⟳</span>
            </div>

            {/* ── Banner ad slot (on cream, like the app) ── */}
            <div className="shrink-0 px-3 pb-1 pt-2.5" style={{ background: PARCH }}>
              <BannerSlot ad={bannerAd} pulse={mode === 'banner'} />
            </div>

            {/* ── Scrollable content ── */}
            <div ref={viewportRef} className="relative flex-1 overflow-hidden px-3 pb-5 pt-3" style={{ background: PARCH }}>
              <SectionLabel>Loan Purpose</SectionLabel>
              <InkToggle options={['Purchase', 'Refinance']} />
              <div className="h-3" />
              <SectionLabel>Loan Type</SectionLabel>
              <InkToggle options={['Amortizing', 'Interest Only']} />
              <div className="my-3.5" style={{ height: 1, background: LINEN }} />

              {SECTIONS.map((s) => (
                <SectionCard key={s.title} title={s.title}>
                  {s.fields.map((f) => (
                    <div key={f.id} ref={(el) => { fieldRefs.current[f.id] = el; }}>
                      <AppField label={f.label} value={fmt(f, values[f.id] ?? 0)} activeNow={activeId === f.id} />
                    </div>
                  ))}
                </SectionCard>
              ))}

              <button
                ref={buttonRef}
                className="mt-1 w-full rounded py-2.5 text-center text-[11px] font-semibold tracking-[0.09em] text-white transition-transform"
                style={{ background: INK, transform: pressed ? 'scale(0.97)' : 'none' }}
              >
                CALCULATE DSCR
              </button>

              {/* results (matches the app's result rows) */}
              <div ref={resultRef} className={`overflow-hidden transition-all duration-500 ${showResult ? 'mt-3 max-h-64 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="rounded-lg border bg-white p-3" style={{ borderColor: LINEN }}>
                  <div className="text-center">
                    <div className="text-[8px] font-semibold uppercase tracking-[0.16em]" style={{ color: MIST }}>DSCR</div>
                    <div className="mt-0.5 text-[28px] font-extrabold leading-none" style={{ color: INK }}>1.28</div>
                    <div className="mt-1.5 inline-block rounded-full px-2.5 py-0.5 text-[9px] font-bold" style={{ background: 'rgba(111,207,151,0.18)', color: '#2D6A4F' }}>
                      ● Strong Coverage
                    </div>
                  </div>
                  <div className="mt-2.5 border-t pt-2" style={{ borderColor: LINEN }}>
                    <ResultRow label="Monthly Payment (PITIA)" value="$1,875" />
                    <ResultRow label="Monthly Cashflow" value="+$525" green />
                    <ResultRow label="Cap Rate" value="6.2%" />
                  </div>
                </div>
              </div>
              <div className="h-4" />
            </div>

            {/* Dynamic Island */}
            <div className="absolute left-1/2 top-[7px] z-30 h-[20px] w-[76px] -translate-x-1/2 rounded-full bg-black" />

            {/* ── POP-UP AD (half screen, like the app) ── */}
            <div className={`absolute inset-0 z-20 flex items-center justify-center px-3 transition-opacity duration-300 ${popup ? 'opacity-100' : 'pointer-events-none opacity-0'}`}>
              <div className="absolute inset-0 bg-black/60" />
              <div
                className={`relative w-full overflow-hidden rounded-2xl bg-white shadow-2xl transition-all duration-300 ${popup ? 'translate-y-0' : 'translate-y-6'}`}
                style={{ height: '50%' }}
              >
                <div className="absolute left-2 top-2 z-10 rounded bg-black/50 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-[0.14em] text-white">Ad</div>
                <div className="absolute right-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-[11px] font-bold text-white">{count}</div>
                <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center" style={{ background: `linear-gradient(160deg,#12233b,${INK})` }}>
                  <div className="text-[8px] font-semibold uppercase tracking-[0.22em]" style={{ color: BRASS_PALE }}>Your Ad Here</div>
                  <div className="text-[15px] font-extrabold leading-tight text-white">Generic Lender<br/>Funnel LLC</div>
                  <div className="text-[9px] leading-snug" style={{ color: MIST }}>DSCR loans up to 80% LTV — close in 21 days.</div>
                  <div className="mt-1 rounded-md px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.1em] text-white" style={{ background: BRASS }}>Get Pre-Qualified →</div>
                </div>
              </div>
            </div>

            {/* home indicator */}
            <div className="absolute bottom-1.5 left-1/2 z-30 h-1 w-[84px] -translate-x-1/2 rounded-full" style={{ background: 'rgba(10,22,40,0.22)' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── App-matching pieces ── */

function BannerSlot({ ad, pulse }: { ad: (typeof BANNER_ADS)[number]; pulse: boolean }) {
  if ('house' in ad) {
    return (
      <div className="flex h-[40px] items-center justify-center gap-1.5 rounded-sm"
        style={{ background: PARCH, border: `1.5px dashed rgba(155,123,78,0.55)`, outline: pulse ? '2px solid rgba(155,123,78,0.2)' : 'none' }}>
        <span className="text-[10px]" style={{ color: BRASS }}>📣</span>
        <span className="text-[8px] font-semibold uppercase tracking-[0.12em]" style={{ color: BRASS }}>Your Ad Here — Advertise With Us</span>
        <span className="text-[10px]" style={{ color: BRASS }}>→</span>
      </div>
    );
  }
  return (
    <div className="flex h-[40px] items-center gap-2.5 px-3"
      style={{ background: 'linear-gradient(120deg,#12233b,#0a1628)', outline: pulse ? '2px solid rgba(155,123,78,0.3)' : 'none' }}>
      <div className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded" style={{ background: BRASS }}>
        <span className="text-[10px] font-extrabold text-white">L</span>
      </div>
      <div className="min-w-0">
        <div className="truncate text-[9px] font-bold uppercase tracking-[0.06em] text-white">{ad.name}</div>
        <div className="truncate text-[7.5px]" style={{ color: BRASS_PALE }}>{ad.tag}</div>
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="mb-1.5 text-[9px] font-semibold uppercase tracking-[0.18em]" style={{ color: BRASS }}>{children}</div>;
}

function InkToggle({ options }: { options: string[] }) {
  return (
    <div className="flex overflow-hidden rounded-lg" style={{ border: `1.5px solid ${INK}`, background: '#fff' }}>
      {options.map((o, i) => (
        <div key={o} className="flex-1 py-2.5 text-center text-[10px] font-bold uppercase tracking-[0.06em]"
          style={i === 0 ? { background: INK, color: '#fff' } : { color: INK }}>
          {o}
        </div>
      ))}
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-3.5 overflow-hidden rounded-xl bg-white" style={{ borderLeft: `5px solid ${BRASS}`, boxShadow: '0 1px 3px rgba(10,22,40,0.06)' }}>
      <div className="px-4 pb-2 pt-3 text-[9px] font-semibold uppercase tracking-[0.16em]" style={{ color: MIST }}>{title}</div>
      <div className="mx-4" style={{ height: 1, background: LINEN }} />
      <div className="px-4 pb-3.5 pt-3">{children}</div>
    </div>
  );
}

function AppField({ label, value, activeNow }: { label: string; value: string; activeNow: boolean }) {
  // Split "$3,500" / "8%" into prefix, number, suffix — the app renders the
  // $ in mist before the value and the % right-aligned in mist.
  const prefix = value.startsWith('$') ? '$' : null;
  const suffix = value.endsWith('%') ? '%' : null;
  const num = value.replace(/^\$/, '').replace(/%$/, '');
  return (
    <div className="mb-3">
      <div className="mb-1.5 text-[8px] font-semibold uppercase tracking-[0.14em]" style={{ color: MIST }}>{label}</div>
      <div className="flex items-center rounded-[10px] px-3.5 py-2.5 text-[14px] font-semibold"
        style={{
          background: '#F1EDE6', color: INK,
          border: `1.5px solid ${activeNow ? BRASS : 'transparent'}`,
          boxShadow: activeNow ? '0 0 0 2px rgba(155,123,78,0.15)' : 'none',
        }}>
        {prefix && <span className="mr-1.5 text-[13px] font-normal" style={{ color: MIST }}>{prefix}</span>}
        <span>{num}</span>
        {activeNow && <span className="ml-0.5 inline-block h-3.5 w-[2px] animate-pulse" style={{ background: BRASS }} />}
        {suffix && <span className="ml-auto text-[13px] font-normal" style={{ color: MIST }}>{suffix}</span>}
      </div>
    </div>
  );
}

function ResultRow({ label, value, green }: { label: string; value: string; green?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-[9px]" style={{ color: SLATE }}>{label}</span>
      <span className="text-[10.5px] font-bold" style={{ color: green ? '#2D6A4F' : INK }}>{value}</span>
    </div>
  );
}

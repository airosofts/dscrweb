'use client';

import { useEffect } from 'react';

/**
 * Measures on-site engagement for the current visit and attributes it to the
 * email a recipient clicked (?et=) and/or the pipeline lead (?rid=). Tracks:
 *   - active time (paused when the tab is hidden)
 *   - deepest scroll %
 *   - per-section dwell seconds (elements with [data-track-section])
 *   - whether they started the form and the last field they touched
 * The client holds the full cumulative state and beacons a snapshot on a
 * heartbeat and on exit, so nothing is lost when the tab closes.
 *
 * Only runs when we can attribute the visit (et or rid present, or a stored
 * rid from a prior form submit) — no anonymous tracking here.
 */
export default function EngagementTracker() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    let et = params.get('et');
    let rid = params.get('rid');
    // fall back to the browser's stored request id (from AdvertiseForm submit)
    if (!rid) { try { rid = localStorage.getItem('dscr_rid'); } catch { /* private */ } }
    if (et) { try { sessionStorage.setItem('dscr_et', et); } catch { /* */ } }
    else { try { et = sessionStorage.getItem('dscr_et'); } catch { /* */ } }
    if (!et && !rid) return; // nothing to attribute to

    const UUID = /^[a-f0-9-]{20,}$/i;
    if (et && !UUID.test(et)) et = null;
    if (rid && !UUID.test(rid)) rid = null;
    if (!et && !rid) return;

    // one stable key per visit
    let sessionKey = '';
    try {
      sessionKey = sessionStorage.getItem('dscr_eng_key') ?? '';
      if (!sessionKey) {
        sessionKey = (crypto.randomUUID?.() ?? String(Date.now()) + Math.random());
        sessionStorage.setItem('dscr_eng_key', sessionKey);
      }
    } catch {
      sessionKey = String(Date.now()) + Math.random();
    }

    // ── cumulative state ──
    let activeSeconds = 0;
    let scrollPct = 0;
    const sections: Record<string, number> = {};
    let formStarted = false;
    let formLastField: string | null = null;

    let lastTick = Date.now();
    let visible = document.visibilityState === 'visible';
    const currentlyIn = new Set<string>();

    // section visibility
    const observed = Array.from(document.querySelectorAll<HTMLElement>('[data-track-section]'));
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const name = (e.target as HTMLElement).dataset.trackSection!;
          if (e.isIntersecting && e.intersectionRatio > 0.3) currentlyIn.add(name);
          else currentlyIn.delete(name);
        }
      },
      { threshold: [0, 0.3, 0.6] },
    );
    observed.forEach((el) => io.observe(el));

    // accumulate time each second while visible
    const tick = () => {
      const now = Date.now();
      const dt = (now - lastTick) / 1000;
      lastTick = now;
      if (visible && dt > 0 && dt < 5) {
        activeSeconds += dt;
        for (const name of currentlyIn) sections[name] = (sections[name] ?? 0) + dt;
      }
    };

    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      const pct = h > 0 ? Math.round((window.scrollY / h) * 100) : 100;
      if (pct > scrollPct) scrollPct = Math.min(100, pct);
    };

    const onVisibility = () => {
      tick();
      visible = document.visibilityState === 'visible';
      lastTick = Date.now();
    };

    // form engagement (advertise form lives under [data-track-section="apply"])
    const onFocusIn = (ev: FocusEvent) => {
      const t = ev.target as HTMLElement;
      if (!t || !(t instanceof HTMLElement)) return;
      if (t.closest('form')) {
        formStarted = true;
        const label =
          t.getAttribute('name') ||
          t.getAttribute('placeholder') ||
          t.getAttribute('aria-label') ||
          t.tagName.toLowerCase();
        if (label) formLastField = label.slice(0, 60);
      }
    };
    const onSubmit = () => { snapshot(true); };

    const buildBody = () => JSON.stringify({
      session_key: sessionKey,
      et, rid,
      path: window.location.pathname,
      active_seconds: Math.round(activeSeconds),
      scroll_pct: scrollPct,
      sections: Object.fromEntries(Object.entries(sections).map(([k, v]) => [k, Math.round(v)])),
      form_started: formStarted,
      form_last_field: formLastField,
      submitted: submittedFlag,
    });

    let submittedFlag = false;
    const snapshot = (isSubmit = false) => {
      tick();
      if (isSubmit) submittedFlag = true;
      try {
        const body = buildBody();
        if (navigator.sendBeacon) {
          navigator.sendBeacon('/api/track/engagement', new Blob([body], { type: 'application/json' }));
        } else {
          fetch('/api/track/engagement', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true }).catch(() => {});
        }
      } catch { /* never break the page */ }
    };

    const secondTimer = window.setInterval(tick, 1000);
    const heartbeat = window.setInterval(() => snapshot(), 15_000);

    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
    document.addEventListener('focusin', onFocusIn);
    document.addEventListener('submit', onSubmit, true);
    window.addEventListener('pagehide', () => snapshot());

    onScroll();
    snapshot(); // initial row so a bounce still registers a visit

    return () => {
      snapshot();
      window.clearInterval(secondTimer);
      window.clearInterval(heartbeat);
      io.disconnect();
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('visibilitychange', onVisibility);
      document.removeEventListener('focusin', onFocusIn);
      document.removeEventListener('submit', onSubmit, true);
    };
  }, []);

  return null;
}

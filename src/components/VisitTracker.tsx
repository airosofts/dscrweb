'use client';

import { useEffect } from 'react';

/** Records one site visit per browser session. Invisible; never blocks the page. */
export default function VisitTracker() {
  useEffect(() => {
    if (sessionStorage.getItem('dscr_visit_tracked')) return;
    sessionStorage.setItem('dscr_visit_tracked', '1');
    fetch('/api/track/visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: window.location.pathname,
        referrer: document.referrer || null,
      }),
      keepalive: true,
    }).catch(() => {});
  }, []);
  return null;
}

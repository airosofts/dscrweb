'use client';

import { useState } from 'react';

/**
 * Short-form pricing request for the /advertise-test variant.
 *
 * Data showed 3 form starts, 0 completions on the full 12-field form — this
 * asks only who you are (4 fields + format toggle) and submits to the same
 * /api/advertise pipeline with sensible defaults for the rest. Placement
 * details get sorted out post-pricing, exactly like the paid flow already
 * does for creative/states.
 */

type Status = 'idle' | 'sending' | 'sent';

export function CompactAdvertiseForm() {
  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [adType, setAdType] = useState<'banner' | 'popup'>('banner');
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setStatus('sending');
    try {
      const res = await fetch('/api/advertise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_name: companyName,
          contact_person: contactPerson,
          email,
          phone,
          ad_type: adType,
          // Compact form: placement/description are decided after pricing.
          preferred_placement: 'other',
          ad_description: 'Quick pricing request (short form) — placement details to follow.',
        }),
      });
      const data: { error?: string; id?: string } = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Could not submit request');
      if (data.id) {
        try { localStorage.setItem('dscr_rid', data.id); } catch { /* private mode */ }
      }
      setStatus('sent');
    } catch (err) {
      setStatus('idle');
      setError(err instanceof Error ? err.message : 'Could not submit request');
    }
  }

  if (status === 'sent') {
    return (
      <div className="p-2 text-center">
        <div className="mb-2 flex items-center justify-center gap-3 font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-brass">
          <span className="h-px w-7 bg-brass" aria-hidden />
          Request Received
          <span className="h-px w-7 bg-brass" aria-hidden />
        </div>
        <h3 className="mb-3 text-[24px] font-extrabold tracking-[-0.01em] text-ink">
          Pricing is on its way.
        </h3>
        <p className="mx-auto max-w-[400px] text-[14.5px] leading-[1.65] text-slate">
          Check your inbox — your placement pricing arrives within a minute. A team member
          follows up personally within a few business days.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4 max-[600px]:grid-cols-1">
        <label className="block">
          <span className="mb-1.5 block font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-slate">Company *</span>
          <input className="input" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required placeholder="Acme Capital" />
        </label>
        <label className="block">
          <span className="mb-1.5 block font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-slate">Your Name *</span>
          <input className="input" value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} required placeholder="Jane Investor" />
        </label>
        <label className="block">
          <span className="mb-1.5 block font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-slate">Email *</span>
          <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="jane@acmecapital.com" />
        </label>
        <label className="block">
          <span className="mb-1.5 block font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-slate">Phone *</span>
          <input className="input" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="(555) 123-4567" />
        </label>
      </div>

      <div>
        <span className="mb-1.5 block font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-slate">Placement Format</span>
        <div className="grid grid-cols-2 gap-2">
          {([
            ['banner', 'Banner', 'On every screen'],
            ['popup', 'Full-Screen Pop-Up', 'After each calculation'],
          ] as const).map(([value, label, sub]) => (
            <button
              key={value}
              type="button"
              onClick={() => setAdType(value)}
              className={`border px-4 py-3 text-left transition-colors ${
                adType === value ? 'border-brass bg-brass/10' : 'border-rule bg-card-alt hover:border-brass/50'
              }`}
            >
              <span className="block text-[13px] font-bold text-ink">{label}</span>
              <span className="block text-[11px] text-slate">{sub}</span>
            </button>
          ))}
        </div>
      </div>

      {error && <div className="border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">{error}</div>}

      <button type="submit" disabled={status === 'sending'} className="btn-brass w-full justify-center">
        {status === 'sending' ? 'Sending…' : 'Email Me the Pricing →'}
      </button>
      <p className="text-center text-[12px] text-slate">
        No call, no commitment — pricing in your inbox in under a minute.
      </p>
    </form>
  );
}

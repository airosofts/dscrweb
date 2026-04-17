"use client";

import { useState } from "react";

const AD_TYPES = [
  { value: "banner", label: "Banner Ad" },
  { value: "popup", label: "Popup Ad" },
];

const PLACEMENTS = [
  { value: "homepage", label: "Homepage" },
  { value: "calculator_page", label: "Calculator Page" },
  { value: "results_section", label: "Results Section" },
  { value: "other", label: "Other" },
];

const BUDGET_RANGES = [
  { value: "under_500", label: "Under $500" },
  { value: "500_1000", label: "$500 – $1,000" },
  { value: "1000_5000", label: "$1,000 – $5,000" },
  { value: "5000_plus", label: "$5,000+" },
  { value: "custom", label: "Custom" },
];

const DURATIONS = [
  { value: "1", label: "1 Month" },
  { value: "3", label: "3 Months" },
  { value: "6", label: "6 Months" },
  { value: "12", label: "12 Months" },
];

type Status = "idle" | "sending" | "sent";

export function AdvertiseForm() {
  // Company
  const [companyName, setCompanyName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  // Ad
  const [adType, setAdType] = useState("banner");
  const [adDescription, setAdDescription] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [preferredPlacement, setPreferredPlacement] = useState("homepage");
  // Budget
  const [budgetRange, setBudgetRange] = useState("1000_5000");
  const [budgetCustom, setBudgetCustom] = useState("");
  const [startDate, setStartDate] = useState("");
  const [durationMonths, setDurationMonths] = useState("3");
  // Notes
  const [additionalNotes, setAdditionalNotes] = useState("");

  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setStatus("sending");

    try {
      const res = await fetch("/api/advertise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_name: companyName,
          contact_person: contactPerson,
          email,
          phone,
          website,
          ad_type: adType,
          ad_description: adDescription,
          target_audience: targetAudience,
          preferred_placement: preferredPlacement,
          budget_range: budgetRange,
          budget_custom: budgetRange === "custom" ? budgetCustom : null,
          start_date: startDate || null,
          duration_months: durationMonths,
          additional_notes: additionalNotes,
        }),
      });
      const data: { error?: string } = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Could not submit request");
      setStatus("sent");
    } catch (err) {
      setStatus("idle");
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  if (status === "sent") {
    return (
      <div className="border border-rule border-l-[4px] border-l-brass bg-card p-8">
        <div className="mb-2 flex items-center gap-3 font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-brass">
          <span className="h-px w-7 bg-brass" aria-hidden />
          Request Received
        </div>
        <h3 className="mb-3 text-[24px] font-extrabold tracking-[-0.01em] text-ink">
          Thanks — we&rsquo;re on it.
        </h3>
        <p className="mb-5 max-w-[440px] text-[15px] leading-[1.65] text-slate">
          Your advertising request was submitted successfully. A tailored plan summary with
          pricing is on its way to{" "}
          <span className="font-mono text-ink">{email}</span> — it will arrive in a minute. For
          anything urgent, reply to that email directly.
        </p>
        <div className="flex items-center gap-2 border border-rule bg-card-alt px-3 py-2 font-mono text-[11px] tracking-[0.06em] text-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-brass" aria-hidden />
          Next step: watch your inbox for &ldquo;Your advertising plans · DSCR Calculator Pro&rdquo;
        </div>
      </div>
    );
  }

  const sending = status === "sending";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      {/* SECTION — Company */}
      <Section title="Company & Contact">
        <div className="grid grid-cols-2 gap-5 max-[600px]:grid-cols-1">
          <Field label="Company Name" required>
            <input
              className="input"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
              disabled={sending}
              placeholder="Acme Capital"
            />
          </Field>
          <Field label="Contact Person" required>
            <input
              className="input"
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
              required
              disabled={sending}
              placeholder="Jane Investor"
            />
          </Field>
          <Field label="Email" required>
            <input
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={sending}
              placeholder="jane@acme.com"
            />
          </Field>
          <Field label="Phone" required>
            <input
              className="input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              disabled={sending}
              placeholder="(555) 123-4567"
            />
          </Field>
          <Field label="Website" optional className="col-span-2 max-[600px]:col-span-1">
            <input
              type="url"
              className="input"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              disabled={sending}
              placeholder="https://acme.com"
            />
          </Field>
        </div>
      </Section>

      {/* SECTION — Ad */}
      <Section title="Ad Details">
        <div className="grid grid-cols-2 gap-5 max-[600px]:grid-cols-1">
          <Field label="Ad Type" required>
            <PillGroup
              options={AD_TYPES}
              value={adType}
              onChange={setAdType}
              disabled={sending}
            />
          </Field>
          <Field label="Preferred Placement" required>
            <PillGroup
              options={PLACEMENTS}
              value={preferredPlacement}
              onChange={setPreferredPlacement}
              disabled={sending}
            />
          </Field>
          <Field label="Ad Description" required className="col-span-2 max-[600px]:col-span-1">
            <textarea
              className="input resize-y"
              rows={3}
              value={adDescription}
              onChange={(e) => setAdDescription(e.target.value)}
              required
              disabled={sending}
              placeholder="What is the ad promoting? Who is it for?"
            />
          </Field>
          <Field label="Target Audience" optional className="col-span-2 max-[600px]:col-span-1">
            <input
              className="input"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              disabled={sending}
              placeholder="e.g. DSCR lenders, buy-and-hold investors in the Southeast"
            />
          </Field>
        </div>
      </Section>

      {/* SECTION — Budget & Timeline */}
      <Section title="Budget & Timeline">
        <div className="grid grid-cols-2 gap-5 max-[600px]:grid-cols-1">
          <Field label="Budget Range" required className="col-span-2 max-[600px]:col-span-1">
            <PillGroup
              options={BUDGET_RANGES}
              value={budgetRange}
              onChange={setBudgetRange}
              disabled={sending}
            />
          </Field>
          {budgetRange === "custom" && (
            <Field label="Custom Budget (USD)" required>
              <input
                type="number"
                min="0"
                step="1"
                className="input"
                value={budgetCustom}
                onChange={(e) => setBudgetCustom(e.target.value)}
                required
                disabled={sending}
                placeholder="e.g. 7500"
              />
            </Field>
          )}
          <Field label="Preferred Start Date" optional>
            <input
              type="date"
              className="input"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              disabled={sending}
            />
          </Field>
          <Field label="Duration" required>
            <PillGroup
              options={DURATIONS}
              value={durationMonths}
              onChange={setDurationMonths}
              disabled={sending}
            />
          </Field>
        </div>
      </Section>

      {/* SECTION — Notes */}
      <Section title="Anything Else">
        <Field label="Additional Notes" optional>
          <textarea
            className="input resize-y"
            rows={3}
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            disabled={sending}
            placeholder="Anything else we should know?"
          />
        </Field>
      </Section>

      {error && (
        <div className="border border-red-200 border-l-[3px] border-l-red-500 bg-red-50 px-4 py-3 text-[13px] text-red-700">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between gap-4 border-t border-rule pt-6 max-[600px]:flex-col max-[600px]:items-stretch">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
          We review within 3–4 business days. You&rsquo;ll get pricing by email in a minute.
        </p>
        <button type="submit" disabled={sending} className="btn-brass inline-flex">
          {sending ? "Submitting…" : "Submit Request →"}
        </button>
      </div>
    </form>
  );
}

/* ─────────────────────────── Parts ─────────────────────────── */

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="mb-5 flex items-center gap-3 border-b border-rule pb-3 text-[11px] font-bold uppercase tracking-[0.14em] text-ink">
        <span className="h-px w-7 bg-brass" aria-hidden />
        {title}
      </h3>
      {children}
    </div>
  );
}

function Field({
  label,
  required,
  optional,
  children,
  className = "",
}: {
  label: string;
  required?: boolean;
  optional?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={"flex flex-col gap-2 " + className}>
      <label className="flex items-center gap-2 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-brass">
        {label}
        {required && <span className="text-brass-pale">•</span>}
        {optional && <span className="text-muted">(optional)</span>}
      </label>
      {children}
    </div>
  );
}

function PillGroup({
  options,
  value,
  onChange,
  disabled,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          disabled={disabled}
          onClick={() => onChange(o.value)}
          className={
            "border px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.1em] transition-colors disabled:opacity-60 " +
            (value === o.value
              ? "border-ink bg-ink text-cream"
              : "border-rule bg-card text-slate hover:border-brass hover:text-ink")
          }
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

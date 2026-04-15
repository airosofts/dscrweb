"use client";

import { useState } from "react";

const TOPICS = ["Support", "Advertising", "Press", "Partnership", "Other"] as const;
type Topic = (typeof TOPICS)[number];

export function ContactForm() {
  const [topic, setTopic] = useState<Topic>("Support");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStatus("sending");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, company, topic, message }),
      });
      const data: { error?: string } = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || "Could not send message");
      }
      setStatus("sent");
    } catch (err) {
      setStatus("idle");
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  if (status === "sent") {
    return (
      <div className="border border-rule border-l-[4px] border-l-brass bg-card p-6">
        <div className="mb-1 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-brass">
          Message Received
        </div>
        <h3 className="mb-1.5 text-base font-bold text-ink">Thanks — we&apos;ll be in touch.</h3>
        <p className="mb-5 text-sm text-slate">
          A human on our team will reply to{" "}
          <span className="font-mono text-ink">{email}</span> within 3–4 business days.
        </p>
        <button
          type="button"
          onClick={() => {
            setName("");
            setEmail("");
            setCompany("");
            setMessage("");
            setTopic("Support");
            setStatus("idle");
          }}
          className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate transition-colors hover:text-ink"
        >
          ← Send another
        </button>
      </div>
    );
  }

  const sending = status === "sending";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <Field label="Topic">
        <div className="flex flex-wrap gap-2">
          {TOPICS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTopic(t)}
              disabled={sending}
              className={
                "border px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.1em] transition-colors disabled:opacity-60 " +
                (topic === t
                  ? "border-ink bg-ink text-cream"
                  : "border-rule bg-card text-slate hover:border-brass hover:text-ink")
              }
            >
              {t}
            </button>
          ))}
        </div>
      </Field>

      <div className="grid grid-cols-2 gap-5 max-[600px]:grid-cols-1">
        <Field label="Your Name" htmlFor="name" required>
          <input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={sending}
            className="input"
            placeholder="Jane Investor"
          />
        </Field>
        <Field label="Email" htmlFor="email" required>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={sending}
            className="input"
            placeholder="jane@example.com"
          />
        </Field>
      </div>

      <Field label="Company" htmlFor="company" optional>
        <input
          id="company"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          disabled={sending}
          className="input"
          placeholder="Acme Capital"
        />
      </Field>

      <Field label="Message" htmlFor="message" required>
        <textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          rows={6}
          disabled={sending}
          className="input resize-y"
          placeholder="Tell us what you need. If it's a bug, include your device and app version."
        />
      </Field>

      {error && (
        <div className="border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between gap-4 pt-1 max-[600px]:flex-col max-[600px]:items-stretch">
        <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted">
          Routed to the <span className="text-brass">{topic}</span> team.
        </p>
        <button type="submit" disabled={sending} className="btn-brass inline-flex disabled:opacity-70">
          {sending ? "Sending…" : "Send Message →"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  required,
  optional,
  children,
}: {
  label: string;
  htmlFor?: string;
  required?: boolean;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={htmlFor}
        className="flex items-center gap-2 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-brass"
      >
        {label}
        {required && <span className="text-brass-pale">•</span>}
        {optional && <span className="text-muted">(optional)</span>}
      </label>
      {children}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "",
);

const PLAN_LABELS: Record<string, string> = {
  starter: "Starter",
  premium: "Premium",
  growth: "Growth",
  pro: "Pro",
  "premium-plus": "Premium Plus",
};

const GEO_LABELS: Record<string, string> = {
  national: "National",
  state: "State",
  metro: "Metro",
};

const PRICES: Record<string, Record<string, number>> = {
  starter: { national: 349, state: 119, metro: 69 },
  premium: { national: 597, state: 199, metro: 119 },
  growth: { national: 897, state: 299, metro: 179 },
  pro: { national: 1497, state: 497, metro: 297 },
  "premium-plus": { national: 1497, state: 497, metro: 297 },
};

export function CheckoutClient() {
  const params = useSearchParams();
  const router = useRouter();
  const planId = params.get("plan") ?? "";
  const geo = params.get("geo") ?? "national";

  const planName = PLAN_LABELS[planId] ?? planId;
  const geoLabel = GEO_LABELS[geo] ?? geo;
  const price = PRICES[planId]?.[geo] ?? 0;

  const [step, setStep] = useState<"details" | "payment" | "success">("details");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
  const [submissionToken, setSubmissionToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!planId || !price) {
    return (
      <div className="border border-rule border-l-[3px] border-l-brass bg-card p-8 text-center">
        <h2 className="mb-2 text-lg font-bold text-ink">No plan selected</h2>
        <p className="mb-4 text-sm text-slate">
          Go back to the pricing page and select a plan first.
        </p>
        <a href="/pricing" className="btn-brass inline-flex">
          View Plans →
        </a>
      </div>
    );
  }

  async function handleDetailsSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan_id: planId,
          geo,
          email: email.trim(),
          contact_name: name.trim() || null,
          company_name: company.trim() || null,
          phone: phone.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Failed to create payment");

      setClientSecret(data.clientSecret);
      setSubscriptionId(data.subscriptionId);
      setSubmissionToken(data.submissionToken);
      setStep("payment");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {/* Order summary */}
      <div className="mb-8 border border-rule border-l-[3px] border-l-brass bg-card p-6">
        <div className="mb-4 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-brass">
          Order Summary
        </div>
        <div className="flex items-center justify-between border-b border-rule pb-4">
          <div>
            <div className="text-[15px] font-bold text-ink">{planName}</div>
            <div className="mt-0.5 font-mono text-[11px] text-muted">
              {geoLabel} targeting
            </div>
          </div>
          <div className="text-right">
            <div className="text-[24px] font-extrabold tracking-[-0.02em] text-ink">
              ${price}
            </div>
            <div className="font-mono text-[10px] text-muted">One-time</div>
          </div>
        </div>
        <div className="flex items-center gap-2 pt-3 font-mono text-[10px] uppercase tracking-[0.1em] text-muted">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="M3 10h18" />
          </svg>
          Secured by Stripe
        </div>
      </div>

      {/* Step 1: Details */}
      {step === "details" && (
        <form onSubmit={handleDetailsSubmit} className="space-y-5">
          <div className="mb-6 border-b border-rule pb-3 text-[11px] font-bold uppercase tracking-[0.14em] text-ink">
            Your Details
          </div>

          <div className="grid grid-cols-2 gap-4 max-[500px]:grid-cols-1">
            <div>
              <label className="field-label">Email *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="input"
                placeholder="jane@acme.com"
              />
            </div>
            <div>
              <label className="field-label">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                className="input"
                placeholder="Jane Investor"
              />
            </div>
            <div>
              <label className="field-label">Company</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                disabled={loading}
                className="input"
                placeholder="Acme Capital"
              />
            </div>
            <div>
              <label className="field-label">Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={loading}
                className="input"
                placeholder="(555) 123-4567"
              />
            </div>
          </div>

          {error && (
            <div className="border border-red-200 border-l-[3px] border-l-red-500 bg-red-50 px-4 py-3 text-[13px] text-red-700">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-brass w-full py-3.5">
            {loading ? "Processing…" : "Continue to Payment →"}
          </button>
        </form>
      )}

      {/* Step 2: Payment */}
      {step === "payment" && clientSecret && (
        <Elements
          stripe={stripePromise}
          options={{
            clientSecret,
            appearance: {
              theme: "flat",
              variables: {
                fontFamily: "'DM Sans', system-ui, sans-serif",
                fontSizeBase: "14px",
                colorPrimary: "#9B7B4E",
                colorBackground: "#F5F2ED",
                colorText: "#0A1628",
                colorTextSecondary: "#5A6978",
                colorTextPlaceholder: "#A09888",
                colorDanger: "#DC2626",
                borderRadius: "0px",
                spacingUnit: "4px",
                spacingGridRow: "16px",
              },
              rules: {
                ".Input": {
                  border: "1px solid #E8E4DD",
                  boxShadow: "none",
                  padding: "12px 14px",
                },
                ".Input:focus": {
                  border: "1px solid #9B7B4E",
                  boxShadow: "0 0 0 3px rgba(155,123,78,0.1)",
                },
                ".Input:hover": {
                  border: "1px solid rgba(155,123,78,0.35)",
                },
                ".Label": {
                  fontFamily: "'DM Mono', monospace",
                  fontSize: "10px",
                  fontWeight: "500",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "#9B7B4E",
                  marginBottom: "8px",
                },
                ".Tab": {
                  border: "1px solid #E8E4DD",
                  borderRadius: "0px",
                },
                ".Tab--selected": {
                  backgroundColor: "#0A1628",
                  color: "#FAF8F4",
                  border: "1px solid #0A1628",
                },
              },
            },
          }}
        >
          <PaymentForm
            onSuccess={() => {
              if (subscriptionId && submissionToken) {
                router.replace(
                  `/submit-creative?token=${encodeURIComponent(submissionToken)}&sid=${encodeURIComponent(subscriptionId)}`,
                );
              } else {
                setStep("success");
              }
            }}
            onBack={() => {
              setStep("details");
              setClientSecret(null);
            }}
            planName={planName}
            price={price}
          />
        </Elements>
      )}

      {/* Step 3: Success — prompt to submit creative now */}
      {step === "success" && (
        <div className="border border-rule border-l-[3px] border-l-brass bg-card p-8">
          <div className="mb-6 flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center border border-green-300 bg-green-50">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-6 w-6 text-green-600">
                <path d="M5 12l5 5L20 7" />
              </svg>
            </div>
          </div>
          <div className="text-center">
            <div className="mb-2 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-brass">
              Payment Confirmed
            </div>
            <h2 className="mb-3 text-[22px] font-extrabold tracking-[-0.01em] text-ink">
              You&apos;re all set, {(name || email).split(" ")[0]}.
            </h2>
            <p className="mb-6 text-[14px] leading-[1.65] text-slate">
              One last step — submit your ad creative now so we can get it live within 1–2 business days.
            </p>

            {subscriptionId && submissionToken ? (
              <a
                href={`/submit-creative?token=${encodeURIComponent(submissionToken)}&sid=${encodeURIComponent(subscriptionId)}`}
                className="btn-brass inline-flex py-3.5"
              >
                Submit Ad Creative →
              </a>
            ) : (
              <div className="text-[13px] text-muted">
                Redirecting to creative submission…
              </div>
            )}

            <p className="mt-6 text-[12px] text-muted">
              Not ready? A reminder link will be emailed to{" "}
              <span className="font-mono text-ink">{email}</span> if not submitted within 24 hours.
            </p>

            <div className="mt-8 flex justify-center gap-3 border-t border-rule pt-6">
              <a href="/" className="btn-outline-brass">Back to Home</a>
              <a href="/advertise" className="btn-outline-brass">Advertise</a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Payment Form (inside Elements provider) ─── */

function PaymentForm({
  onSuccess,
  onBack,
  planName,
  price,
}: {
  onSuccess: () => void;
  onBack: () => void;
  planName: string;
  price: number;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setPaying(true);
    setError(null);

    const result = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    if (result.error) {
      setError(result.error.message ?? "Payment failed");
      setPaying(false);
    } else if (result.paymentIntent?.status === "succeeded") {
      onSuccess();
    } else {
      // Handle other statuses (processing, etc.)
      onSuccess();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="mb-2 border-b border-rule pb-3 text-[11px] font-bold uppercase tracking-[0.14em] text-ink">
        Payment Details
      </div>

      <PaymentElement
        onReady={() => setReady(true)}
        options={{ layout: "tabs" }}
      />

      {error && (
        <div className="border border-red-200 border-l-[3px] border-l-red-500 bg-red-50 px-4 py-3 text-[13px] text-red-700">
          {error}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          disabled={paying}
          className="btn-outline flex-1"
        >
          ← Back
        </button>
        <button
          type="submit"
          disabled={!stripe || !ready || paying}
          className="btn-brass flex-1 py-3.5"
        >
          {paying ? "Processing…" : `Pay $${price}`}
        </button>
      </div>

      <div className="flex items-center justify-center gap-2 pt-1 font-mono text-[9px] uppercase tracking-[0.1em] text-muted">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-50">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
        Encrypted · Secure · PCI Compliant
      </div>
    </form>
  );
}

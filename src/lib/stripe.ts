import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;

// Lazy init — avoids crashing during Next.js build when env vars aren't available
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
    _stripe = new Stripe(key, { apiVersion: "2026-03-25.dahlia" });
  }
  return _stripe;
}

export const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? "";

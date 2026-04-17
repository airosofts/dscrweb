import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;
if (!key) console.warn("[stripe] STRIPE_SECRET_KEY missing");

export const stripe = new Stripe(key ?? "", { apiVersion: "2026-03-25.dahlia" });

export const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? "";

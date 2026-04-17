import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;
if (!key) console.warn("[stripe] STRIPE_SECRET_KEY missing");

export const stripe = new Stripe(key ?? "", { apiVersion: "2025-04-30.basil" });

export const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? "";

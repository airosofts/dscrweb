import { NextRequest } from "next/server";
import { getStripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase";

const VALID_PLANS = ["starter", "premium", "growth", "pro", "premium-plus"];
const VALID_GEO = ["national", "state", "metro"] as const;

type Geo = (typeof VALID_GEO)[number];

const PRICE_COL: Record<Geo, string> = {
  national: "price_national",
  state: "price_state",
  metro: "price_metro",
};

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const planId = String(body.plan_id ?? "");
  const geo = String(body.geo ?? "national") as Geo;
  const email = String(body.email ?? "").trim().toLowerCase();
  const companyName = typeof body.company_name === "string" ? body.company_name.trim() : null;
  const contactName = typeof body.contact_name === "string" ? body.contact_name.trim() : null;
  const phone = typeof body.phone === "string" ? body.phone.trim() : null;

  if (!VALID_PLANS.includes(planId))
    return Response.json({ error: "Invalid plan" }, { status: 400 });
  if (!VALID_GEO.includes(geo))
    return Response.json({ error: "Invalid geo" }, { status: 400 });
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return Response.json({ error: "Valid email required" }, { status: 400 });

  // Fetch plan
  const { data: plan, error: planErr } = await supabaseAdmin
    .from("ad_plans")
    .select("*")
    .eq("id", planId)
    .eq("is_active", true)
    .single();

  if (planErr || !plan)
    return Response.json({ error: "Plan not found" }, { status: 404 });

  const priceCents = plan[PRICE_COL[geo]] as number;
  if (!priceCents)
    return Response.json({ error: "Price not available for this geo" }, { status: 400 });

  // Generate submission token upfront — used after payment to gate the creative form
  const submissionToken = crypto.randomUUID();

  // Create subscription record
  const { data: sub, error: subErr } = await supabaseAdmin
    .from("ad_subscriptions")
    .insert({
      email,
      company_name: companyName,
      contact_name: contactName,
      phone,
      plan_id: planId,
      geo_targeting: geo,
      price_cents: priceCents,
      status: "pending",
      submission_token: submissionToken,
    })
    .select()
    .single();

  if (subErr || !sub) {
    console.error("[checkout] insert failed:", subErr);
    return Response.json({ error: "Could not create subscription" }, { status: 500 });
  }

  // Create PaymentIntent
  try {
    const stripe = getStripe();
    const paymentIntent = await stripe.paymentIntents.create({
      amount: priceCents,
      currency: "usd",
      metadata: {
        subscription_id: sub.id,
        plan_id: planId,
        geo,
      },
      receipt_email: email,
      description: `${plan.name} — ${plan.placement} (${plan.duration_months}mo, ${geo})`,
    });

    // Store payment intent ID
    await supabaseAdmin
      .from("ad_subscriptions")
      .update({ stripe_payment_intent: paymentIntent.id })
      .eq("id", sub.id);

    return Response.json({
      clientSecret: paymentIntent.client_secret,
      subscriptionId: sub.id,
      submissionToken,
      plan: {
        name: plan.name,
        placement: plan.placement,
        duration_months: plan.duration_months,
      },
    });
  } catch (err) {
    console.error("[checkout] stripe error:", err);
    return Response.json({ error: "Could not create payment" }, { status: 500 });
  }
}

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

  // Fetch plan from DB
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

  // Create subscription record (pending)
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
    })
    .select()
    .single();

  if (subErr || !sub) {
    console.error("[checkout] insert failed:", subErr);
    return Response.json({ error: "Could not create subscription" }, { status: 500 });
  }

  // Create Stripe Checkout Session
  const origin = request.headers.get("origin") || process.env.PUBLIC_SITE_URL || "https://dscrcalculator.pro";

  try {
    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: priceCents,
            product_data: {
              name: `${plan.name} — ${plan.placement}`,
              description: `${plan.duration_months} month${plan.duration_months > 1 ? "s" : ""} · ${geo.charAt(0).toUpperCase() + geo.slice(1)} targeting`,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        subscription_id: sub.id,
        plan_id: planId,
        geo,
      },
      success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing?tier=${planId}&geo=${geo}`,
    });

    // Store checkout ID
    await supabaseAdmin
      .from("ad_subscriptions")
      .update({ stripe_checkout_id: session.id })
      .eq("id", sub.id);

    return Response.json({ url: session.url });
  } catch (err) {
    console.error("[checkout] stripe error:", err);
    return Response.json({ error: "Could not create checkout session" }, { status: 500 });
  }
}

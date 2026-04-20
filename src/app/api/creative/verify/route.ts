import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getStripe } from "@/lib/stripe";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const sid = searchParams.get("sid");

  if (!token || !sid) {
    return Response.json({ error: "Missing token or sid" }, { status: 400 });
  }

  const { data: sub, error } = await supabaseAdmin
    .from("ad_subscriptions")
    .select(
      "id, email, company_name, contact_name, phone, status, plan_id, stripe_payment_intent, ad_plans(duration_months)",
    )
    .eq("id", sid)
    .eq("submission_token", token)
    .single();

  if (error || !sub) {
    return Response.json({ error: "Invalid or expired link" }, { status: 403 });
  }

  let status = sub.status as string;

  // Self-heal: the client redirects here the moment Stripe confirms payment,
  // often before the webhook flips status to "paid". If the PI has in fact
  // succeeded, promote the row now so the form is accessible immediately.
  if (status === "pending" && sub.stripe_payment_intent) {
    try {
      const pi = await getStripe().paymentIntents.retrieve(sub.stripe_payment_intent);
      if (pi.status === "succeeded") {
        const durationMonths =
          (sub as { ad_plans?: { duration_months?: number } }).ad_plans?.duration_months ?? 1;
        const startsAt = new Date();
        const endsAt = new Date();
        endsAt.setMonth(endsAt.getMonth() + durationMonths);

        await supabaseAdmin
          .from("ad_subscriptions")
          .update({
            status: "paid",
            paid_at: new Date().toISOString(),
            starts_at: startsAt.toISOString().split("T")[0],
            ends_at: endsAt.toISOString().split("T")[0],
          })
          .eq("id", sid)
          .eq("status", "pending");

        status = "paid";
      }
    } catch (err) {
      console.error("[creative/verify] stripe PI lookup failed:", err);
    }
  }

  if (status !== "paid" && status !== "creative_submitted") {
    return Response.json({ error: "Subscription is not in a valid state" }, { status: 400 });
  }

  return Response.json({
    valid: true,
    subscription: {
      id: sub.id,
      email: sub.email,
      company_name: sub.company_name,
      contact_name: sub.contact_name,
      phone: sub.phone,
      status,
    },
  });
}

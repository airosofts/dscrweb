import { NextRequest } from "next/server";
import Stripe from "stripe";
import { getStripe, WEBHOOK_SECRET } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase";
import { resend, FROM_ADDRESS, ADMIN_NOTIFY_EMAIL } from "@/lib/resend";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig || !WEBHOOK_SECRET) {
    return Response.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, WEBHOOK_SECRET);
  } catch (err) {
    console.error("[webhook] sig verification failed:", err);
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Deduplicate
  const { data: existing } = await supabaseAdmin
    .from("ad_payment_events")
    .select("id")
    .eq("stripe_event_id", event.id)
    .maybeSingle();

  if (existing) {
    return Response.json({ received: true, duplicate: true });
  }

  if (event.type === "payment_intent.succeeded") {
    const pi = event.data.object as Stripe.PaymentIntent;
    const subId = pi.metadata?.subscription_id;

    if (!subId) {
      return Response.json({ received: true });
    }

    // Log event
    await supabaseAdmin.from("ad_payment_events").insert({
      subscription_id: subId,
      stripe_event_id: event.id,
      event_type: event.type,
      amount_cents: pi.amount,
      currency: pi.currency,
      raw_data: JSON.parse(body),
    });

    // Get subscription + plan
    const { data: sub } = await supabaseAdmin
      .from("ad_subscriptions")
      .select("*, ad_plans(*)")
      .eq("id", subId)
      .single();

    const durationMonths = sub?.ad_plans?.duration_months ?? 1;
    const startsAt = new Date();
    const endsAt = new Date();
    endsAt.setMonth(endsAt.getMonth() + durationMonths);

    // Update subscription (token was generated at checkout creation time)
    await supabaseAdmin
      .from("ad_subscriptions")
      .update({
        status: "paid",
        paid_at: new Date().toISOString(),
        stripe_payment_intent: pi.id,
        starts_at: startsAt.toISOString().split("T")[0],
        ends_at: endsAt.toISOString().split("T")[0],
      })
      .eq("id", subId);

    // Email customer
    if (sub?.email) {
      try {
        const planName = sub.ad_plans?.name ?? "Your Plan";
        const placement = sub.ad_plans?.placement ?? "";
        const price = `$${(pi.amount / 100).toFixed(0)}`;
        const firstName = (sub.contact_name ?? sub.email).split(" ")[0];

        await resend.emails.send({
          from: FROM_ADDRESS,
          to: sub.email,
          subject: "Payment confirmed — DSCR Calculator Pro",
          html: buildCustomerEmail(firstName, planName, placement, price, durationMonths),
        });
      } catch (err) {
        console.error("[webhook] customer email failed:", err);
      }
    }

    // Notify admin
    try {
      await resend.emails.send({
        from: FROM_ADDRESS,
        to: ADMIN_NOTIFY_EMAIL,
        replyTo: sub?.email,
        subject: `New ad payment — ${sub?.ad_plans?.name ?? "Unknown"} · $${(pi.amount / 100).toFixed(0)}`,
        html: buildAdminEmail(sub, pi),
      });
    } catch (err) {
      console.error("[webhook] admin email failed:", err);
    }
  }

  return Response.json({ received: true });
}

/* ─── Email builders ─── */

function buildCustomerEmail(firstName: string, planName: string, placement: string, price: string, months: number) {
  return `<!doctype html>
<html><head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#F5F2ED;font-family:'DM Sans',Helvetica,Arial,sans-serif;color:#0A1628;">
<table role="presentation" width="100%" style="background:#F5F2ED;padding:40px 16px;">
<tr><td align="center">
<table role="presentation" width="560" style="max-width:560px;background:#FFF;border:1px solid #E8E4DD;">
<tr><td style="height:3px;background:#9B7B4E;"></td></tr>
<tr><td style="padding:32px;">
<div style="font-family:monospace;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:#9B7B4E;margin-bottom:18px;">Payment Confirmed</div>
<h1 style="margin:0 0 16px;font-size:24px;font-weight:800;color:#0A1628;">Thanks, ${firstName}. You're all set.</h1>
<p style="font-size:15px;line-height:1.7;color:#5A6978;margin:0 0 24px;">
  Your payment of <strong style="color:#0A1628;">${price}</strong> for the
  <strong style="color:#0A1628;">${planName}</strong> plan has been received.
</p>
<table role="presentation" width="100%" style="background:#FAF8F4;border:1px solid #E8E4DD;border-left:3px solid #9B7B4E;">
<tr><td style="padding:20px;">
<div style="margin-bottom:14px;">
  <div style="font-family:monospace;font-size:10px;letter-spacing:0.14em;text-transform:uppercase;color:#9B7B4E;margin-bottom:4px;">Step 1</div>
  <div style="font-size:14px;color:#0A1628;font-weight:600;">We'll email you within 24 hours</div>
  <div style="font-size:13px;color:#5A6978;margin-top:2px;">With a link to submit your ad creative.</div>
</div>
<div style="margin-bottom:14px;">
  <div style="font-family:monospace;font-size:10px;letter-spacing:0.14em;text-transform:uppercase;color:#9B7B4E;margin-bottom:4px;">Step 2</div>
  <div style="font-size:14px;color:#0A1628;font-weight:600;">We review your creative</div>
  <div style="font-size:13px;color:#5A6978;margin-top:2px;">Approval takes 1–2 business days.</div>
</div>
<div>
  <div style="font-family:monospace;font-size:10px;letter-spacing:0.14em;text-transform:uppercase;color:#9B7B4E;margin-bottom:4px;">Step 3</div>
  <div style="font-size:14px;color:#0A1628;font-weight:600;">Your ad goes live</div>
  <div style="font-size:13px;color:#5A6978;margin-top:2px;">${placement} · ${months} month${months > 1 ? "s" : ""} nationwide.</div>
</div>
</td></tr></table>
<p style="margin:24px 0 0;font-size:13px;color:#A09888;">Questions? Reply to this email.</p>
</td></tr>
<tr><td style="padding:20px 32px;border-top:1px solid #E8E4DD;background:#FAF8F4;">
<div style="font-family:monospace;font-size:10px;letter-spacing:0.14em;text-transform:uppercase;color:#9B7B4E;">dscrcalculator.pro</div>
</td></tr>
</table>
</td></tr></table>
</body></html>`;
}

function buildAdminEmail(sub: Record<string, unknown> & { ad_plans?: Record<string, unknown> } | null, pi: Stripe.PaymentIntent) {
  const planName = (sub?.ad_plans?.name as string) ?? "Unknown";
  const email = (sub?.email as string) ?? "—";
  const amount = `$${(pi.amount / 100).toFixed(0)}`;
  const geo = (sub?.geo_targeting as string) ?? "national";

  return `<!doctype html>
<html><head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#F5F2ED;font-family:'DM Sans',Helvetica,Arial,sans-serif;color:#0A1628;">
<table role="presentation" width="100%" style="background:#F5F2ED;padding:40px 16px;">
<tr><td align="center">
<table role="presentation" width="560" style="max-width:560px;background:#FFF;border:1px solid #E8E4DD;">
<tr><td style="height:3px;background:#9B7B4E;"></td></tr>
<tr><td style="padding:32px;">
<div style="font-family:monospace;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:#9B7B4E;margin-bottom:18px;">New Payment</div>
<h1 style="margin:0 0 16px;font-size:22px;font-weight:800;color:#0A1628;">${planName} · ${amount}</h1>
<table role="presentation" width="100%" style="background:#FAF8F4;border:1px solid #E8E4DD;border-left:3px solid #9B7B4E;">
<tr><td style="padding:16px;font-size:13px;color:#5A6978;line-height:1.8;">
<strong style="color:#0A1628;">Email:</strong> ${email}<br/>
<strong style="color:#0A1628;">Company:</strong> ${(sub?.company_name as string) ?? "—"}<br/>
<strong style="color:#0A1628;">Plan:</strong> ${planName}<br/>
<strong style="color:#0A1628;">Geo:</strong> ${geo}<br/>
<strong style="color:#0A1628;">Amount:</strong> ${amount}<br/>
<strong style="color:#0A1628;">Stripe:</strong> <code style="font-family:monospace;font-size:11px;">${pi.id}</code>
</td></tr></table>
<p style="margin:20px 0 0;font-size:13px;color:#A09888;">Send creative submission link within 24 hours.</p>
</td></tr>
</table>
</td></tr></table>
</body></html>`;
}

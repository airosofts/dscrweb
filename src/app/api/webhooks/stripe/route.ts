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

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const subId = session.metadata?.subscription_id;

    if (!subId) {
      console.warn("[webhook] no subscription_id in metadata");
      return Response.json({ received: true });
    }

    // Log event
    await supabaseAdmin.from("ad_payment_events").insert({
      subscription_id: subId,
      stripe_event_id: event.id,
      event_type: event.type,
      amount_cents: session.amount_total,
      currency: session.currency,
      raw_data: JSON.parse(body),
    });

    // Calculate start/end dates
    const { data: sub } = await supabaseAdmin
      .from("ad_subscriptions")
      .select("*, ad_plans(*)")
      .eq("id", subId)
      .single();

    const durationMonths = sub?.ad_plans?.duration_months ?? 1;
    const startsAt = new Date();
    const endsAt = new Date();
    endsAt.setMonth(endsAt.getMonth() + durationMonths);

    // Update subscription
    await supabaseAdmin
      .from("ad_subscriptions")
      .update({
        status: "paid",
        paid_at: new Date().toISOString(),
        stripe_payment_intent: session.payment_intent as string,
        stripe_customer_id: session.customer as string,
        starts_at: startsAt.toISOString().split("T")[0],
        ends_at: endsAt.toISOString().split("T")[0],
      })
      .eq("id", subId);

    // Send confirmation email to customer
    if (sub?.email) {
      try {
        await resend.emails.send({
          from: FROM_ADDRESS,
          to: sub.email,
          subject: "Payment confirmed — DSCR Calculator Pro",
          html: buildCustomerEmail(sub, durationMonths),
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
        subject: `New ad payment — ${sub?.ad_plans?.name ?? "Unknown"} · $${((session.amount_total ?? 0) / 100).toFixed(0)}`,
        html: buildAdminPaymentEmail(sub, session),
      });
    } catch (err) {
      console.error("[webhook] admin email failed:", err);
    }
  }

  return Response.json({ received: true });
}

/* ─── Email templates ─── */

function buildCustomerEmail(
  sub: Record<string, unknown> & { ad_plans?: Record<string, unknown> },
  durationMonths: number,
) {
  const planName = (sub.ad_plans?.name as string) ?? "Your Plan";
  const placement = (sub.ad_plans?.placement as string) ?? "";
  const price = `$${((sub.price_cents as number) / 100).toFixed(0)}`;
  const firstName = ((sub.contact_name as string) ?? (sub.email as string)).split(" ")[0];

  return `<!doctype html>
<html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#F5F2ED;font-family:'DM Sans',Helvetica,Arial,sans-serif;color:#0A1628;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F5F2ED;padding:40px 16px;">
<tr><td align="center">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#FFFFFF;border:1px solid #E8E4DD;">
<tr><td style="height:3px;background:#9B7B4E;"></td></tr>
<tr><td style="padding:32px 32px 24px;">

<div style="font-family:monospace;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:#9B7B4E;margin-bottom:18px;">
  Payment Confirmed
</div>

<h1 style="margin:0 0 16px;font-size:24px;font-weight:800;color:#0A1628;letter-spacing:-0.02em;">
  Thanks, ${firstName}. You're all set.
</h1>

<p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#5A6978;">
  Your payment of <strong style="color:#0A1628;">${price}</strong> for the
  <strong style="color:#0A1628;">${planName}</strong> plan has been received.
  Here's what happens next:
</p>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FAF8F4;border:1px solid #E8E4DD;border-left:3px solid #9B7B4E;">
<tr><td style="padding:20px;">
  <div style="margin-bottom:14px;">
    <div style="font-family:monospace;font-size:10px;letter-spacing:0.14em;text-transform:uppercase;color:#9B7B4E;margin-bottom:4px;">Step 1</div>
    <div style="font-size:14px;color:#0A1628;font-weight:600;">We'll email you within 24 hours</div>
    <div style="font-size:13px;color:#5A6978;margin-top:2px;">With a link to submit your ad creative (banner image or pop-up content).</div>
  </div>
  <div style="margin-bottom:14px;">
    <div style="font-family:monospace;font-size:10px;letter-spacing:0.14em;text-transform:uppercase;color:#9B7B4E;margin-bottom:4px;">Step 2</div>
    <div style="font-size:14px;color:#0A1628;font-weight:600;">We review your creative</div>
    <div style="font-size:13px;color:#5A6978;margin-top:2px;">Approval takes 1–2 business days. We'll confirm via email.</div>
  </div>
  <div>
    <div style="font-family:monospace;font-size:10px;letter-spacing:0.14em;text-transform:uppercase;color:#9B7B4E;margin-bottom:4px;">Step 3</div>
    <div style="font-size:14px;color:#0A1628;font-weight:600;">Your ad goes live</div>
    <div style="font-size:13px;color:#5A6978;margin-top:2px;">${placement} · ${durationMonths} month${durationMonths > 1 ? "s" : ""} of nationwide reach.</div>
  </div>
</td></tr>
</table>

<p style="margin:24px 0 0;font-size:13px;color:#A09888;">
  Questions? Just reply to this email — we read every message.
</p>

</td></tr>
<tr><td style="padding:20px 32px;border-top:1px solid #E8E4DD;background:#FAF8F4;">
  <div style="font-family:monospace;font-size:10px;letter-spacing:0.14em;text-transform:uppercase;color:#9B7B4E;">dscrcalculator.pro</div>
</td></tr>
</table>
<div style="margin-top:16px;font-family:monospace;font-size:10px;letter-spacing:0.14em;text-transform:uppercase;color:#A09888;">
  © ${new Date().getFullYear()} DSCR Calculator Pro
</div>
</td></tr>
</table>
</body></html>`;
}

function buildAdminPaymentEmail(
  sub: Record<string, unknown> & { ad_plans?: Record<string, unknown> } | null,
  session: Stripe.Checkout.Session,
) {
  const planName = (sub?.ad_plans?.name as string) ?? "Unknown";
  const email = (sub?.email as string) ?? session.customer_email ?? "—";
  const amount = `$${((session.amount_total ?? 0) / 100).toFixed(0)}`;
  const geo = (sub?.geo_targeting as string) ?? "national";

  return `<!doctype html>
<html><head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#F5F2ED;font-family:'DM Sans',Helvetica,Arial,sans-serif;color:#0A1628;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F5F2ED;padding:40px 16px;">
<tr><td align="center">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#FFFFFF;border:1px solid #E8E4DD;">
<tr><td style="height:3px;background:#9B7B4E;"></td></tr>
<tr><td style="padding:32px;">

<div style="font-family:monospace;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:#9B7B4E;margin-bottom:18px;">
  New Payment Received
</div>

<h1 style="margin:0 0 16px;font-size:22px;font-weight:800;color:#0A1628;">
  ${planName} · ${amount}
</h1>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FAF8F4;border:1px solid #E8E4DD;border-left:3px solid #9B7B4E;">
<tr><td style="padding:16px;">
  <div style="font-size:13px;color:#5A6978;line-height:1.8;">
    <strong style="color:#0A1628;">Email:</strong> ${email}<br/>
    <strong style="color:#0A1628;">Company:</strong> ${(sub?.company_name as string) ?? "—"}<br/>
    <strong style="color:#0A1628;">Plan:</strong> ${planName}<br/>
    <strong style="color:#0A1628;">Geo:</strong> ${geo}<br/>
    <strong style="color:#0A1628;">Amount:</strong> ${amount}<br/>
    <strong style="color:#0A1628;">Stripe ID:</strong> <code style="font-family:monospace;font-size:11px;">${session.id}</code>
  </div>
</td></tr>
</table>

<p style="margin:20px 0 0;font-size:13px;color:#A09888;">
  Send the creative submission link to this customer within 24 hours.
</p>

</td></tr>
</table>
</td></tr>
</table>
</body></html>`;
}

import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { resend, FROM_ADDRESS, ADMIN_NOTIFY_EMAIL } from "@/lib/resend";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      subscription_id,
      token,
      company_name,
      contact_name,
      email,
      phone,
      ad_type,
      description,
      notes,
      banner_images,
      popup_images,
      logo_files,
    } = body;

    // Validate required fields
    if (!subscription_id || !token || !company_name || !contact_name || !email || !ad_type) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!["banner", "popup"].includes(ad_type)) {
      return Response.json({ error: "Invalid ad_type" }, { status: 400 });
    }

    // Validate token
    const { data: sub, error: subError } = await supabaseAdmin
      .from("ad_subscriptions")
      .select("*")
      .eq("id", subscription_id)
      .eq("submission_token", token)
      .single();

    if (subError || !sub) {
      return Response.json({ error: "Invalid or expired submission link" }, { status: 403 });
    }

    if (sub.status !== "paid" && sub.status !== "creative_submitted") {
      return Response.json({ error: "Subscription is not in a valid state" }, { status: 400 });
    }

    // Insert creative submission
    const { error: insertError } = await supabaseAdmin
      .from("creative_submissions")
      .insert({
        subscription_id,
        company_name,
        contact_name,
        email,
        phone: phone || null,
        ad_type,
        description: description || null,
        notes: notes || null,
        banner_images: banner_images || [],
        popup_images: popup_images || [],
        logo_files: logo_files || [],
      });

    if (insertError) {
      console.error("[creative/submit] insert error:", insertError);
      return Response.json({ error: "Failed to save submission" }, { status: 500 });
    }

    // Update subscription status
    await supabaseAdmin
      .from("ad_subscriptions")
      .update({
        status: "creative_submitted",
        creative_submitted_at: new Date().toISOString(),
      })
      .eq("id", subscription_id);

    // Send admin notification
    try {
      await resend.emails.send({
        from: FROM_ADDRESS,
        to: ADMIN_NOTIFY_EMAIL,
        replyTo: email,
        subject: `Creative submitted — ${company_name}`,
        html: buildAdminNotification(company_name, contact_name, email, ad_type, subscription_id),
      });
    } catch (err) {
      console.error("[creative/submit] admin email failed:", err);
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error("[creative/submit] error:", err);
    return Response.json({ error: "Submission failed" }, { status: 500 });
  }
}

function buildAdminNotification(
  companyName: string,
  contactName: string,
  email: string,
  adType: string,
  subscriptionId: string,
) {
  return `<!doctype html>
<html><head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#F5F2ED;font-family:'DM Sans',Helvetica,Arial,sans-serif;color:#0A1628;">
<table role="presentation" width="100%" style="background:#F5F2ED;padding:40px 16px;">
<tr><td align="center">
<table role="presentation" width="560" style="max-width:560px;background:#FFF;border:1px solid #E8E4DD;">
<tr><td style="height:3px;background:#9B7B4E;"></td></tr>
<tr><td style="padding:32px;">
<div style="font-family:monospace;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:#9B7B4E;margin-bottom:18px;">Creative Submitted</div>
<h1 style="margin:0 0 16px;font-size:22px;font-weight:800;color:#0A1628;">${companyName}</h1>
<table role="presentation" width="100%" style="background:#FAF8F4;border:1px solid #E8E4DD;border-left:3px solid #9B7B4E;">
<tr><td style="padding:16px;font-size:13px;color:#5A6978;line-height:1.8;">
<strong style="color:#0A1628;">Contact:</strong> ${contactName}<br/>
<strong style="color:#0A1628;">Email:</strong> ${email}<br/>
<strong style="color:#0A1628;">Ad Type:</strong> ${adType}<br/>
<strong style="color:#0A1628;">Subscription:</strong> <code style="font-family:monospace;font-size:11px;">${subscriptionId}</code>
</td></tr></table>
<p style="margin:20px 0 0;font-size:13px;color:#A09888;">Review the creative in the admin portal.</p>
</td></tr>
</table>
</td></tr></table>
</body></html>`;
}

/**
 * One-click unsubscribe.
 *
 * GET  /api/unsubscribe?token=<uuid>   — link in every pipeline email
 * POST /api/unsubscribe?token=<uuid>   — RFC 8058 List-Unsubscribe-Post
 *
 * Stops the pipeline for the matching advertising_request and renders a
 * small confirmation page.
 */

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

async function stop(token: string): Promise<{ ok: boolean; companyName?: string }> {
  if (!token || !/^[a-f0-9-]{20,}$/i.test(token)) return { ok: false };

  const { data } = await supabaseAdmin
    .from("advertising_requests")
    .select("id, company_name, pipeline_stopped_at")
    .eq("unsubscribe_token", token)
    .maybeSingle();

  if (!data) return { ok: false };

  if (!data.pipeline_stopped_at) {
    await supabaseAdmin
      .from("advertising_requests")
      .update({
        pipeline_stopped_at: new Date().toISOString(),
        pipeline_stop_reason: "User unsubscribed",
      })
      .eq("id", data.id);

    await supabaseAdmin.from("pipeline_stops").insert({
      advertising_request_id: data.id,
      action: "stop_all",
      reason: "User clicked unsubscribe link",
      admin_email: "system@unsubscribe",
    });

    // Cancel every pending email for this lead — both cron-queued ('scheduled')
    // and Resend-handed ('resend_scheduled'). The processor's reconcile sweep
    // then cancels the Resend-side schedule for the latter.
    await supabaseAdmin
      .from("pipeline_emails")
      .update({ status: "cancelled", cancel_reason: "User unsubscribed" })
      .eq("advertising_request_id", data.id)
      .in("status", ["scheduled", "resend_scheduled"]);
  }

  return { ok: true, companyName: data.company_name ?? undefined };
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token") ?? "";
  const { ok, companyName } = await stop(token);

  const body = ok
    ? `<h1 style="margin:0 0 12px;font-size:22px;font-weight:800;color:#0A1628;">You're unsubscribed.</h1>
       <p style="margin:0;font-size:14px;color:#5A6978;line-height:1.6;">${companyName ? `We won't send any more emails about advertising on DSCR Calculator Pro to <strong>${companyName}</strong>.` : "We won't send any more emails about advertising on DSCR Calculator Pro."}</p>
       <p style="margin:18px 0 0;font-size:13px;color:#A09888;">If this was a mistake, just reply to the most recent email and we'll re-enable.</p>`
    : `<h1 style="margin:0 0 12px;font-size:22px;font-weight:800;color:#0A1628;">Link expired or invalid.</h1>
       <p style="margin:0;font-size:14px;color:#5A6978;line-height:1.6;">This unsubscribe link couldn't be matched. You may already be unsubscribed — if you keep hearing from us, reply to any email and we'll handle it manually.</p>`;

  const html = `<!doctype html><html><head><meta charset="utf-8"/><title>Unsubscribe — DSCR Calculator Pro</title>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<style>body{margin:0;padding:0;background:#F5F2ED;font-family:'DM Sans',Helvetica,Arial,sans-serif;color:#0A1628;}</style></head>
<body><div style="max-width:520px;margin:80px auto;padding:32px;background:#FFF;border:1px solid #E8E4DD;">
<div style="height:3px;background:#9B7B4E;margin:-32px -32px 24px;"></div>
<div style="font-family:monospace;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:#9B7B4E;margin-bottom:18px;">Email Preferences</div>
${body}
<div style="margin-top:32px;padding-top:18px;border-top:1px solid #E8E4DD;font-family:monospace;font-size:10px;letter-spacing:0.14em;text-transform:uppercase;color:#9B7B4E;">dscrcalculator.pro</div>
</div></body></html>`;

  return new NextResponse(html, {
    status: ok ? 200 : 404,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

export async function POST(request: NextRequest) {
  // RFC 8058 one-click: token may be in query string or body
  let token = request.nextUrl.searchParams.get("token") ?? "";
  if (!token) {
    try {
      const body = await request.text();
      const params = new URLSearchParams(body);
      token = params.get("token") ?? "";
    } catch {
      // ignore
    }
  }
  const { ok } = await stop(token);
  return Response.json({ ok }, { status: ok ? 200 : 404 });
}

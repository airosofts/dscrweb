import { createHmac, timingSafeEqual } from "crypto";
import { supabaseAdmin } from "@/lib/supabase";
import { resend, FROM_ADDRESS, getNotifyEmails } from "@/lib/resend";
import { recordEvent } from "@/lib/journey";

/**
 * Resend Webhook Handler
 * Listens for delivery events, updates pipeline_emails tracking status in
 * real time, and notifies the configured contacts on meaningful events.
 *
 * Set this URL in Resend Dashboard → Webhooks:
 *   https://dscrcalculator.pro/api/webhooks/resend
 *
 * All email.* events may be subscribed; unknown ones are safely ignored.
 *
 * Put the webhook's signing secret (whsec_…) in RESEND_WEBHOOK_SECRET so
 * forged events are rejected. Unset = accept unsigned (dev only).
 */

// Resend signs webhooks with svix: HMAC-SHA256 over "{id}.{timestamp}.{payload}"
// keyed with the base64 part of the whsec_ secret.
function verifySignature(request: Request, payload: string): boolean {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret) return true; // verification not configured

  const id = request.headers.get("svix-id");
  const timestamp = request.headers.get("svix-timestamp");
  const signatures = request.headers.get("svix-signature");
  if (!id || !timestamp || !signatures) return false;

  // reject stale timestamps (>5 min) to prevent replay
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return false;

  const key = Buffer.from(secret.replace(/^whsec_/, ""), "base64");
  const expected = createHmac("sha256", key)
    .update(`${id}.${timestamp}.${payload}`)
    .digest("base64");

  // header holds space-separated "v1,<sig>" entries
  return signatures.split(" ").some((part) => {
    const sig = part.split(",")[1] ?? "";
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    return a.length === b.length && timingSafeEqual(a, b);
  });
}

/* States an engagement event may upgrade FROM — never resurrect a dead email. */
const OPENABLE = ["resend_scheduled", "processing", "sent", "delivered"];
const CLICKABLE = [...OPENABLE, "opened"];

type PipelineRow = {
  id: string;
  status: string;
  opened_at: string | null;
  clicked_at: string | null;
  to_email: string;
  subject: string | null;
  advertising_request_id: string | null;
  advertising_requests: { company_name: string; contact_person: string } | null;
};

/* ── Contact notifications ────────────────────────────────────────────── */

const NOTIFY_EVENTS: Record<string, { title: string; color: string; action?: string }> = {
  "email.opened":     { title: "Email opened",  color: "#15803d" },
  "email.clicked":    { title: "Link clicked",  color: "#9B7B4E" },
  "email.bounced":    {
    title: "Email bounced", color: "#dc2626",
    action: "The address could not be reached, so all remaining emails to this lead were stopped automatically. Please verify the correct email address with the lead and restart their sequence manually from the admin portal.",
  },
  "email.failed":     {
    title: "Email failed", color: "#dc2626",
    action: "Sending failed and the lead's remaining emails were stopped automatically. Please review the reason below and handle this lead manually.",
  },
  "email.suppressed": {
    title: "Address suppressed", color: "#dc2626",
    action: "This address is on the Resend suppression list (previous bounce or unsubscribe). Remaining emails were stopped. Do not re-add without confirming a working address.",
  },
  "email.complained": {
    title: "Spam complaint", color: "#ea580c",
    action: "The recipient marked our email as spam. Their sequence has been permanently stopped — do not contact this address again.",
  },
};

async function notifyContacts(eventType: string, row: PipelineRow, detail?: string) {
  const meta = NOTIFY_EVENTS[eventType];
  if (!meta) return;
  try {
    const to = await getNotifyEmails();
    const lead = row.advertising_requests
      ? `${row.advertising_requests.contact_person} (${row.advertising_requests.company_name})`
      : row.to_email;
    await resend.emails.send({
      from: FROM_ADDRESS,
      to,
      subject: `[Pipeline] ${meta.title} — ${lead}`,
      html: `
        <div style="font-family:sans-serif;max-width:520px">
          <h2 style="color:${meta.color};margin:0 0 12px">${meta.title}</h2>
          <table style="font-size:14px;color:#0A1628;border-collapse:collapse">
            <tr><td style="padding:3px 12px 3px 0;color:#667">Lead</td><td><b>${lead}</b></td></tr>
            <tr><td style="padding:3px 12px 3px 0;color:#667">Recipient</td><td>${row.to_email}</td></tr>
            ${row.subject ? `<tr><td style="padding:3px 12px 3px 0;color:#667">Email</td><td>${row.subject}</td></tr>` : ""}
            ${detail ? `<tr><td style="padding:3px 12px 3px 0;color:#667">Detail</td><td>${detail}</td></tr>` : ""}
            <tr><td style="padding:3px 12px 3px 0;color:#667">When</td><td>${new Date().toUTCString()}</td></tr>
          </table>
          ${meta.action ? `<p style="margin:14px 0 0;padding:10px 12px;background:#FEF2F2;border-left:3px solid ${meta.color};font-size:13px;color:#0A1628">${meta.action}</p>` : ""}
        </div>`,
    });
  } catch (err) {
    console.error("[resend-webhook] contact notification failed:", err);
  }
}

/* ── Handler ──────────────────────────────────────────────────────────── */

export async function POST(request: Request) {
  const raw = await request.text();
  if (!verifySignature(request, raw)) {
    return Response.json({ error: "Invalid signature" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const eventType = body.type as string | undefined;
  const data = body.data as Record<string, unknown> | undefined;

  if (!eventType || !data) {
    return Response.json({ error: "Missing event data" }, { status: 400 });
  }

  const resendEmailId = data.email_id as string | undefined;
  if (!resendEmailId) {
    return Response.json({ received: true, skipped: "no email_id" });
  }

  const { data: row } = await supabaseAdmin
    .from("pipeline_emails")
    .select(
      "id, status, opened_at, clicked_at, to_email, subject, advertising_request_id, advertising_requests(company_name, contact_person)",
    )
    .eq("resend_email_id", resendEmailId)
    .maybeSingle<PipelineRow>();

  if (!row) {
    // Not a pipeline email — could be an admin notification, ignore
    return Response.json({ received: true, skipped: "not a pipeline email" });
  }

  const now = new Date().toISOString();

  // Cancel every still-pending email for this lead and stop the pipeline.
  async function stopLead(reason: string) {
    if (!row!.advertising_request_id) return;
    await supabaseAdmin
      .from("advertising_requests")
      .update({ pipeline_stopped_at: now, pipeline_stop_reason: reason })
      .eq("id", row!.advertising_request_id)
      .is("pipeline_stopped_at", null);
    await supabaseAdmin
      .from("pipeline_emails")
      .update({ status: "cancelled", cancel_reason: reason })
      .eq("advertising_request_id", row!.advertising_request_id)
      .in("status", ["scheduled", "resend_scheduled"]);
  }

  switch (eventType) {
    case "email.scheduled":
    case "email.received":
    case "email.delivery_delayed":
      // No state change: scheduled is our resend_scheduled, received is
      // inbound mail, delayed may still deliver.
      break;

    case "email.sent": {
      if (["resend_scheduled", "processing"].includes(row.status)) {
        await supabaseAdmin
          .from("pipeline_emails")
          .update({ status: "sent", sent_at: now })
          .eq("id", row.id);
      }
      break;
    }

    case "email.delivered": {
      if (["resend_scheduled", "processing", "sent"].includes(row.status)) {
        await supabaseAdmin
          .from("pipeline_emails")
          .update({ status: "delivered", sent_at: row.status === "sent" ? undefined : now })
          .eq("id", row.id);
        await recordEvent(row.advertising_request_id, "email_delivered", { metadata: { via: "resend_webhook" } });
      }
      break;
    }

    case "email.opened": {
      const { data: changed } = await supabaseAdmin
        .from("pipeline_emails")
        .update({ status: "opened", opened_at: now })
        .eq("id", row.id)
        .is("opened_at", null)
        .in("status", OPENABLE)
        .select("id");
      // Notify only on the FIRST open (repeat opens / pixel-recorded opens skip).
      if (changed?.length) {
        await notifyContacts(eventType, row);
        await recordEvent(row.advertising_request_id, "email_opened", { metadata: { via: "resend_webhook" } });
      }
      break;
    }

    case "email.clicked": {
      const { data: changed } = await supabaseAdmin
        .from("pipeline_emails")
        .update({ status: "clicked", clicked_at: now, opened_at: row.opened_at ?? now })
        .eq("id", row.id)
        .is("clicked_at", null)
        .in("status", CLICKABLE)
        .select("id");
      if (changed?.length) {
        const link = (data.click as Record<string, unknown>)?.link;
        await notifyContacts(eventType, row, link ? String(link) : undefined);
        await recordEvent(row.advertising_request_id, "email_clicked", { metadata: { via: "resend_webhook", link } });
      }
      break;
    }

    case "email.bounced": {
      const bounceReason =
        (data.bounce as Record<string, unknown>)?.message ??
        (data.reason as string) ??
        "Unknown bounce";
      const alreadyDead = ["bounced", "failed"].includes(row.status);
      await supabaseAdmin
        .from("pipeline_emails")
        .update({ status: "bounced", bounce_reason: String(bounceReason) })
        .eq("id", row.id);
      // Bounced addresses won't suddenly start delivering, and Resend will
      // rate-limit our domain if we keep hammering them.
      await stopLead(`Auto-stop: bounce (${String(bounceReason).slice(0, 200)})`);
      if (!alreadyDead) {
        await notifyContacts(eventType, row, String(bounceReason));
        await recordEvent(row.advertising_request_id, "email_bounced", { metadata: { reason: String(bounceReason) } });
      }
      break;
    }

    case "email.failed":
    case "email.suppressed": {
      const reason =
        eventType === "email.suppressed"
          ? "Address is on the Resend suppression list"
          : String((data.failed as Record<string, unknown>)?.reason ?? "Send failed");
      const alreadyDead = ["bounced", "failed"].includes(row.status);
      await supabaseAdmin
        .from("pipeline_emails")
        .update({ status: "failed", bounce_reason: reason })
        .eq("id", row.id);
      await stopLead(`Auto-stop: ${reason.slice(0, 200)}`);
      if (!alreadyDead) await notifyContacts(eventType, row, reason);
      break;
    }

    case "email.complained": {
      await supabaseAdmin
        .from("pipeline_emails")
        .update({ status: "failed", bounce_reason: "Marked as spam by recipient" })
        .eq("id", row.id);
      // Spam complaint = hard stop. Same treatment as unsubscribe.
      await stopLead("Auto-stop: spam complaint");
      if (row.advertising_request_id) {
        await supabaseAdmin.from("pipeline_stops").insert({
          advertising_request_id: row.advertising_request_id,
          action: "stop_all",
          reason: "Resend reported spam complaint",
          admin_email: "system@resend-webhook",
        });
      }
      await notifyContacts(eventType, row);
      break;
    }

    default:
      // Ignore other events
      break;
  }

  return Response.json({ received: true, event: eventType });
}

import { supabaseAdmin } from "@/lib/supabase";

/**
 * Resend Webhook Handler
 * Listens for delivery events and updates pipeline_emails tracking status.
 *
 * Set this URL in Resend Dashboard → Webhooks:
 *   https://dscrcalculator.pro/api/webhooks/resend
 *
 * Events to subscribe: email.delivered, email.bounced, email.complained
 */
export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
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

  // Find the pipeline email by resend_email_id
  const { data: pipelineEmail } = await supabaseAdmin
    .from("pipeline_emails")
    .select("id, status, opened_at, clicked_at, advertising_request_id")
    .eq("resend_email_id", resendEmailId)
    .maybeSingle();

  if (!pipelineEmail) {
    // Not a pipeline email — could be an admin notification, ignore
    return Response.json({ received: true, skipped: "not a pipeline email" });
  }

  switch (eventType) {
    case "email.sent": {
      // Resend has dispatched a previously scheduled email.
      if (pipelineEmail.status === "resend_scheduled") {
        await supabaseAdmin
          .from("pipeline_emails")
          .update({ status: "sent", sent_at: new Date().toISOString() })
          .eq("id", pipelineEmail.id);
      }
      break;
    }

    case "email.delivered": {
      // Upgrade from 'sent' or 'resend_scheduled'; never downgrade opened/clicked.
      if (pipelineEmail.status === "sent" || pipelineEmail.status === "resend_scheduled") {
        await supabaseAdmin
          .from("pipeline_emails")
          .update({ status: "delivered" })
          .eq("id", pipelineEmail.id);
      }
      break;
    }

    case "email.bounced": {
      const bounceReason =
        (data.bounce as Record<string, unknown>)?.message ??
        (data.reason as string) ??
        "Unknown bounce";

      await supabaseAdmin
        .from("pipeline_emails")
        .update({
          status: "bounced",
          bounce_reason: String(bounceReason),
        })
        .eq("id", pipelineEmail.id);

      // Stop the rest of the chain for this lead — bounced addresses won't
      // suddenly start delivering, and Resend will rate-limit our domain if
      // we keep hammering them.
      if (pipelineEmail.advertising_request_id) {
        await supabaseAdmin
          .from("advertising_requests")
          .update({
            pipeline_stopped_at: new Date().toISOString(),
            pipeline_stop_reason: `Auto-stop: bounce (${String(bounceReason).slice(0, 200)})`,
          })
          .eq("id", pipelineEmail.advertising_request_id)
          .is("pipeline_stopped_at", null);
        await supabaseAdmin
          .from("pipeline_emails")
          .update({ status: "cancelled", cancel_reason: "Address bounced" })
          .eq("advertising_request_id", pipelineEmail.advertising_request_id)
          .in("status", ["scheduled", "resend_scheduled"]);
      }
      break;
    }

    case "email.complained": {
      await supabaseAdmin
        .from("pipeline_emails")
        .update({
          status: "failed",
          bounce_reason: "Marked as spam by recipient",
        })
        .eq("id", pipelineEmail.id);

      // Spam complaint = hard stop. Same treatment as unsubscribe.
      if (pipelineEmail.advertising_request_id) {
        await supabaseAdmin
          .from("advertising_requests")
          .update({
            pipeline_stopped_at: new Date().toISOString(),
            pipeline_stop_reason: "Auto-stop: spam complaint",
          })
          .eq("id", pipelineEmail.advertising_request_id)
          .is("pipeline_stopped_at", null);
        await supabaseAdmin.from("pipeline_stops").insert({
          advertising_request_id: pipelineEmail.advertising_request_id,
          action: "stop_all",
          reason: "Resend reported spam complaint",
          admin_email: "system@resend-webhook",
        });
        await supabaseAdmin
          .from("pipeline_emails")
          .update({ status: "cancelled", cancel_reason: "Spam complaint" })
          .eq("advertising_request_id", pipelineEmail.advertising_request_id)
          .in("status", ["scheduled", "resend_scheduled"]);
      }
      break;
    }

    default:
      // Ignore other events
      break;
  }

  return Response.json({ received: true, event: eventType });
}

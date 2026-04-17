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
    .select("id, status, opened_at, clicked_at")
    .eq("resend_email_id", resendEmailId)
    .maybeSingle();

  if (!pipelineEmail) {
    // Not a pipeline email — could be an admin notification, ignore
    return Response.json({ received: true, skipped: "not a pipeline email" });
  }

  switch (eventType) {
    case "email.delivered": {
      // Only update if status is still 'sent' (don't downgrade opened/clicked)
      if (pipelineEmail.status === "sent") {
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
      break;
    }

    default:
      // Ignore other events
      break;
  }

  return Response.json({ received: true, event: eventType });
}

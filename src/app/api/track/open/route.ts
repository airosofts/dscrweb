import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { recordEvent } from "@/lib/journey";

// 1x1 transparent GIF
const PIXEL = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  "base64",
);

// States an open is allowed to upgrade FROM. Never resurrect a bounced,
// failed, cancelled, or skipped email — mail-server scanners fetch the
// pixel even for messages they end up rejecting, which used to flip
// bounced emails to "opened".
const OPENABLE = ["resend_scheduled", "processing", "sent", "delivered"];

export async function GET(request: NextRequest) {
  const eid = request.nextUrl.searchParams.get("eid");

  if (eid) {
    try {
      const { data: changed } = await supabaseAdmin
        .from("pipeline_emails")
        .update({
          status: "opened",
          opened_at: new Date().toISOString(),
        })
        .eq("id", eid)
        .is("opened_at", null)
        .in("status", OPENABLE)
        .select("advertising_request_id");
      if (changed?.[0]?.advertising_request_id) {
        await recordEvent(changed[0].advertising_request_id, "email_opened", {
          metadata: { pipeline_email_id: eid, via: "pixel" },
        });
      }
    } catch {
      // silently fail — don't block pixel response
    }
  }

  return new Response(PIXEL, {
    status: 200,
    headers: {
      "Content-Type": "image/gif",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}

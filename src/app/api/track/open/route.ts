import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// 1x1 transparent GIF
const PIXEL = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  "base64",
);

export async function GET(request: NextRequest) {
  const eid = request.nextUrl.searchParams.get("eid");

  if (eid) {
    // Only update if not already opened (idempotent)
    await supabaseAdmin
      .from("pipeline_emails")
      .update({
        status: "opened",
        opened_at: new Date().toISOString(),
      })
      .eq("id", eid)
      .is("opened_at", null)
      .catch(() => {});
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

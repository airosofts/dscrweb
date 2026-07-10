import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// States a click may upgrade FROM (a click implies an open, so "opened"
// is included). Terminal states — bounced, failed, cancelled, skipped —
// stay put: security gateways follow links in mail they reject, which
// used to flip dead emails back to "clicked".
const CLICKABLE = ["resend_scheduled", "processing", "sent", "delivered", "opened"];

// Only redirect to our own pages — an unchecked ?url= is an open redirect.
const ALLOWED_HOSTS = new Set(["dscrcalculator.pro", "www.dscrcalculator.pro"]);
const FALLBACK = "https://dscrcalculator.pro/pricing";

function safeDestination(raw: string | null): string {
  if (!raw) return FALLBACK;
  try {
    const u = new URL(raw);
    return ALLOWED_HOSTS.has(u.hostname) ? u.toString() : FALLBACK;
  } catch {
    return FALLBACK;
  }
}

export async function GET(request: NextRequest) {
  const eid = request.nextUrl.searchParams.get("eid");
  const url = request.nextUrl.searchParams.get("url");

  if (eid) {
    try {
      const now = new Date().toISOString();
      await supabaseAdmin
        .from("pipeline_emails")
        .update({ status: "clicked", clicked_at: now })
        .eq("id", eid)
        .is("clicked_at", null)
        .in("status", CLICKABLE);
    } catch {
      // silently fail — don't block redirect
    }
  }

  return NextResponse.redirect(safeDestination(url), { status: 302 });
}

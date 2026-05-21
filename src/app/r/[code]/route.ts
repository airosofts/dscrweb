import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { PUBLIC_SITE_URL } from "@/lib/resend";

/**
 * Tracked-link redirect.  GET /r/<code>
 *
 * Looks up the tracked_link, logs a click row (raw IP, user agent, referer),
 * then 302-redirects to the destination. An unknown/inactive code falls back
 * to the homepage so a stale ad link never dead-ends.
 */
export async function GET(
  request: NextRequest,
  ctx: { params: Promise<{ code: string }> },
) {
  const { code } = await ctx.params;
  const home = PUBLIC_SITE_URL;

  if (!code) return NextResponse.redirect(home, 302);

  const { data: link } = await supabaseAdmin
    .from("tracked_links")
    .select("id, destination_url, is_active")
    .eq("code", code)
    .maybeSingle();

  if (!link || !link.is_active) return NextResponse.redirect(home, 302);

  // Log the click. Awaited so the row isn't dropped when the function ends.
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    null;
  try {
    await supabaseAdmin.from("tracked_link_clicks").insert({
      link_id: link.id,
      ip,
      user_agent: request.headers.get("user-agent"),
      referer: request.headers.get("referer"),
    });
  } catch (err) {
    console.error("[r] click log failed:", err);
  }

  return NextResponse.redirect(link.destination_url, 302);
}

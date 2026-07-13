import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * GET /api/advertise/context?rid=<advertising_request_id>
 *
 * Minimal, non-sensitive context so the pricing page can greet pipeline
 * visitors ("Prepared for Acme Capital — requested markets: Texas").
 * Keyed by the unguessable request UUID from the email link.
 */
export async function GET(request: NextRequest) {
  const rid = request.nextUrl.searchParams.get("rid");
  if (!rid || !/^[a-f0-9-]{20,}$/i.test(rid)) {
    return Response.json({ found: false });
  }

  const { data } = await supabaseAdmin
    .from("advertising_requests")
    .select("company_name, target_states, ad_type")
    .eq("id", rid)
    .maybeSingle();

  if (!data) return Response.json({ found: false });

  return Response.json({
    found: true,
    companyName: data.company_name,
    targetStates: data.target_states ?? [],
    adType: data.ad_type,
  });
}

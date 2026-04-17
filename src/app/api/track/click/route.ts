import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const eid = request.nextUrl.searchParams.get("eid");
  const url = request.nextUrl.searchParams.get("url");

  if (eid) {
    try {
      await supabaseAdmin
        .from("pipeline_emails")
        .update({
          status: "clicked",
          clicked_at: new Date().toISOString(),
        })
        .eq("id", eid)
        .is("clicked_at", null);
    } catch {
      // silently fail — don't block redirect
    }
  }

  // Redirect to original URL
  const destination = url || "https://dscrcalculator.pro/pricing";
  return NextResponse.redirect(destination, { status: 302 });
}

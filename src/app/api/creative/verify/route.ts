import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const sid = searchParams.get("sid");

  if (!token || !sid) {
    return Response.json({ error: "Missing token or sid" }, { status: 400 });
  }

  const { data: sub, error } = await supabaseAdmin
    .from("ad_subscriptions")
    .select("id, email, company_name, contact_name, phone, status, plan_id")
    .eq("id", sid)
    .eq("submission_token", token)
    .single();

  if (error || !sub) {
    return Response.json({ error: "Invalid or expired link" }, { status: 403 });
  }

  if (sub.status !== "paid" && sub.status !== "creative_submitted") {
    return Response.json({ error: "Subscription is not in a valid state" }, { status: 400 });
  }

  return Response.json({
    valid: true,
    subscription: {
      id: sub.id,
      email: sub.email,
      company_name: sub.company_name,
      contact_name: sub.contact_name,
      phone: sub.phone,
      status: sub.status,
    },
  });
}

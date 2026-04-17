import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { resend, FROM_ADDRESS, ADMIN_NOTIFY_EMAIL } from "@/lib/resend";
import {
  buildAdminNotification,
  type AdvertisingRequestPayload,
} from "@/lib/email-templates";

const AD_TYPES = ["banner", "popup"];
const PLACEMENTS = ["homepage", "calculator_page", "results_section", "other"];
const BUDGET_RANGES = ["under_500", "500_1000", "1000_5000", "5000_plus", "custom"];

const str = (v: unknown, max = 1000) =>
  typeof v === "string" ? v.trim().slice(0, max) : "";

export async function POST(request: NextRequest) {
  let raw: Record<string, unknown>;
  try {
    raw = (await request.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const company_name = str(raw.company_name, 255);
  const contact_person = str(raw.contact_person, 255);
  const email = str(raw.email, 255).toLowerCase();
  const phone = str(raw.phone, 50);
  const website = str(raw.website, 500) || null;
  const ad_type = str(raw.ad_type, 100);
  const ad_description = str(raw.ad_description, 5000);
  const target_audience = str(raw.target_audience, 1000) || null;
  const preferred_placement = str(raw.preferred_placement, 100);
  const budget_range = str(raw.budget_range, 100) || null;
  const budget_custom_raw = raw.budget_custom;
  const start_date = str(raw.start_date, 32) || null;
  const duration_raw = raw.duration_months;
  const additional_notes = str(raw.additional_notes, 2000) || null;

  // Validation
  if (!company_name) return Response.json({ error: "Company name is required" }, { status: 400 });
  if (!contact_person) return Response.json({ error: "Contact person is required" }, { status: 400 });
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return Response.json({ error: "Valid email is required" }, { status: 400 });
  if (!phone) return Response.json({ error: "Phone is required" }, { status: 400 });
  if (!AD_TYPES.includes(ad_type))
    return Response.json({ error: "Invalid ad type" }, { status: 400 });
  if (!ad_description) return Response.json({ error: "Description is required" }, { status: 400 });
  if (!PLACEMENTS.includes(preferred_placement))
    return Response.json({ error: "Invalid placement" }, { status: 400 });
  if (budget_range && !BUDGET_RANGES.includes(budget_range))
    return Response.json({ error: "Invalid budget range" }, { status: 400 });

  const budget_custom =
    budget_range === "custom" && budget_custom_raw != null && budget_custom_raw !== ""
      ? Number(budget_custom_raw)
      : null;
  if (budget_custom !== null && Number.isNaN(budget_custom))
    return Response.json({ error: "Invalid custom budget" }, { status: 400 });

  const duration_months =
    duration_raw != null && duration_raw !== "" ? Number(duration_raw) : null;
  if (duration_months !== null && (Number.isNaN(duration_months) || duration_months < 1))
    return Response.json({ error: "Invalid duration" }, { status: 400 });

  const user_ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    null;
  const user_agent = request.headers.get("user-agent") || null;

  // ── 1. Persist the request ──────────────────────────────────────────────
  const { data: inserted, error: insertError } = await supabaseAdmin
    .from("advertising_requests")
    .insert({
      company_name, contact_person, email, phone, website,
      ad_type, ad_description, target_audience, preferred_placement,
      budget_range, budget_custom, start_date, duration_months,
      additional_notes, user_ip, user_agent,
    })
    .select()
    .single();

  if (insertError || !inserted) {
    console.error("[advertise] insert failed:", insertError);
    return Response.json({ error: "Could not save request" }, { status: 500 });
  }

  const payload: AdvertisingRequestPayload = {
    id: inserted.id,
    companyName: inserted.company_name,
    contactPerson: inserted.contact_person,
    email: inserted.email,
    phone: inserted.phone,
    website: inserted.website,
    adType: inserted.ad_type,
    adDescription: inserted.ad_description,
    targetAudience: inserted.target_audience,
    preferredPlacement: inserted.preferred_placement,
    budgetRange: inserted.budget_range,
    budgetCustom: inserted.budget_custom,
    startDate: inserted.start_date,
    durationMonths: inserted.duration_months,
    additionalNotes: inserted.additional_notes,
    createdAt: inserted.created_at,
  };

  // ── 2. Send immediate admin notification ────────────────────────────────
  try {
    const admin = buildAdminNotification(payload);
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: ADMIN_NOTIFY_EMAIL,
      replyTo: email,
      subject: admin.subject,
      html: admin.html,
    });
    await supabaseAdmin
      .from("advertising_requests")
      .update({ notification_sent_at: new Date().toISOString() })
      .eq("id", inserted.id);
  } catch (err) {
    console.error("[advertise] admin notification failed:", err);
  }

  // ── 3. Create pipeline entries (pricing + followup) ─────────────────────
  try {
    // Fetch pipeline settings
    const { data: settings } = await supabaseAdmin
      .from("pipeline_settings")
      .select("*")
      .eq("id", 1)
      .single();

    const pricingDelay = settings?.pricing_email_delay_minutes ?? 1;
    const followupDelay = settings?.followup_delay_minutes ?? 1440;
    const pricingEnabled = settings?.pricing_email_enabled ?? true;
    const followupEnabled = settings?.followup_email_enabled ?? true;

    const now = Date.now();

    if (pricingEnabled) {
      await supabaseAdmin.from("pipeline_emails").insert({
        advertising_request_id: inserted.id,
        email_type: "pricing",
        to_email: email,
        to_name: contact_person,
        scheduled_for: new Date(now + pricingDelay * 60_000).toISOString(),
        status: "scheduled",
      });
    }

    if (followupEnabled) {
      // Followup delay is relative to the pricing email's scheduled time
      const pricingSendTime = now + pricingDelay * 60_000;
      await supabaseAdmin.from("pipeline_emails").insert({
        advertising_request_id: inserted.id,
        email_type: "followup",
        to_email: email,
        to_name: contact_person,
        scheduled_for: new Date(pricingSendTime + followupDelay * 60_000).toISOString(),
        status: "scheduled",
      });
    }
  } catch (err) {
    console.error("[advertise] pipeline creation failed:", err);
  }

  // ── 4. Process any due pipeline emails while we're here ──────────────
  try {
    const processUrl = new URL("/api/pipeline/process", request.url);
    fetch(processUrl.toString()).catch(() => {});
  } catch {
    // fire-and-forget
  }

  return Response.json({ ok: true, id: inserted.id }, { status: 201 });
}

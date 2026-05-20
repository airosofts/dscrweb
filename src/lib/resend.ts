import { Resend } from "resend";
import { supabaseAdmin } from "@/lib/supabase";

const key = process.env.RESEND_API_KEY;
if (!key) console.warn("[resend] RESEND_API_KEY is not set — emails will fail.");

export const resend = new Resend(key ?? "missing");

export const FROM_ADDRESS =
  process.env.RESEND_FROM_EMAIL || "DSCR Calculator Pro <noreply@dscrcalculator.pro>";

// Legacy single-email constant kept for callers that haven't migrated yet.
export const ADMIN_NOTIFY_EMAIL =
  process.env.ADVERTISING_NOTIFY_EMAIL || "hamza@airosofts.com";

// Replies to customer-facing outreach route to the team.
export const REPLY_TO = ["hamza@airosofts.com", "info@airosofts.com"];

export const PUBLIC_SITE_URL =
  process.env.PUBLIC_SITE_URL?.replace(/\/+$/, "") || "https://dscrcalculator.pro";

/**
 * Returns all active notification emails from the DB.
 * Falls back to ADMIN_NOTIFY_EMAIL so the app never silently drops alerts.
 */
export async function getNotifyEmails(): Promise<string[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from("notification_dscr_emails")
      .select("email")
      .eq("active", true)
      .order("created_at");
    if (error || !data || data.length === 0) throw new Error("empty");
    return data.map((r) => r.email as string);
  } catch {
    return [ADMIN_NOTIFY_EMAIL];
  }
}

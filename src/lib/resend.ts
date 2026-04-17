import { Resend } from "resend";

const key = process.env.RESEND_API_KEY;
if (!key) console.warn("[resend] RESEND_API_KEY is not set — emails will fail.");

export const resend = new Resend(key ?? "missing");

export const FROM_ADDRESS =
  process.env.RESEND_FROM_EMAIL || "DSCR Calculator Pro <noreply@dscrcalculator.pro>";

export const ADMIN_NOTIFY_EMAIL =
  process.env.ADVERTISING_NOTIFY_EMAIL || "hamza@airosofts.com";

export const PUBLIC_SITE_URL =
  process.env.PUBLIC_SITE_URL?.replace(/\/+$/, "") || "https://dscrcalculator.pro";

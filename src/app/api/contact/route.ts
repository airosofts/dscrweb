import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

const ALLOWED_TOPICS = ["Support", "Advertising", "Press", "Partnership", "Other"] as const;
type Topic = (typeof ALLOWED_TOPICS)[number];

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const company = typeof body.company === "string" ? body.company.trim() : "";
  const topicRaw = typeof body.topic === "string" ? body.topic : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (!name) return Response.json({ error: "Name is required" }, { status: 400 });
  if (!email) return Response.json({ error: "Email is required" }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: "Invalid email" }, { status: 400 });
  }
  if (!message) return Response.json({ error: "Message is required" }, { status: 400 });
  if (!ALLOWED_TOPICS.includes(topicRaw as Topic)) {
    return Response.json({ error: "Invalid topic" }, { status: 400 });
  }

  // Light abuse guard — messages above 10k chars are almost certainly bots
  if (message.length > 10000 || name.length > 200 || company.length > 200) {
    return Response.json({ error: "Payload too large" }, { status: 413 });
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    null;
  const userAgent = request.headers.get("user-agent") || null;

  const { error } = await supabaseAdmin.from("contact_submissions").insert({
    name,
    email,
    company: company || null,
    topic: topicRaw,
    message,
    ip_address: ip,
    user_agent: userAgent,
  });

  if (error) {
    console.error("[contact] insert failed:", error);
    return Response.json({ error: "Could not save submission" }, { status: 500 });
  }

  return Response.json({ ok: true }, { status: 201 });
}

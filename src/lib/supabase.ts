import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  // Will throw only when actually invoked server-side; avoids crashing build.
  console.warn("[landing-site] Supabase env vars missing — contact form submissions will fail.");
}

// Server-only client (service role). Never import into a "use client" module.
export const supabaseAdmin = createClient(
  supabaseUrl ?? "",
  supabaseServiceRoleKey ?? "",
  { auth: { persistSession: false } },
);

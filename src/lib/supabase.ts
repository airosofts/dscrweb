import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client (service role). Never import into a "use client" module.
 *
 * Created lazily on first use rather than at module load: `next build` evaluates
 * every route module while collecting page data, and the deploy platform only
 * injects NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY at runtime. An
 * eager createClient() throws "supabaseUrl is required" and fails the build.
 */
let client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (client) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "[landing-site] Supabase env vars missing (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).",
    );
  }
  client = createClient(url, key, { auth: { persistSession: false } });
  return client;
}

// Same call shape as before (`supabaseAdmin.from(...)`), resolved on first access.
export const supabaseAdmin: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop, _receiver) {
    const c = getClient();
    const value = Reflect.get(c, prop, c);
    return typeof value === "function" ? value.bind(c) : value;
  },
});

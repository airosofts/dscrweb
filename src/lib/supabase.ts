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

/**
 * Read an env var at RUNTIME. Next inlines any literal
 * `process.env.NEXT_PUBLIC_*` reference into the bundle at build time, so if
 * the build machine lacks the var it is baked in as empty and the runtime
 * value is never consulted. A computed key defeats the inlining.
 */
function readEnv(name: string): string | undefined {
  const v = (process.env as Record<string, string | undefined>)[name];
  return v && v.trim() ? v : undefined;
}

function getClient(): SupabaseClient {
  if (client) return client;
  const url = readEnv("SUPABASE_URL") ?? readEnv("NEXT_PUBLIC_SUPABASE_URL");
  const key = readEnv("SUPABASE_SERVICE_ROLE_KEY");
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

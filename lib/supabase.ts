import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let browserClient: SupabaseClient | null = null;

export function getBrowserClient(): SupabaseClient {
  if (browserClient) return browserClient;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  browserClient = createClient(url, key, { auth: { persistSession: false } });
  return browserClient;
}

export function getServerClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key, {
    auth: { persistSession: false },
    global: {
      // Next.js patches global fetch and caches it by default; without this,
      // reads made via a stable per-mntsId URL (e.g. getMeeting) can keep
      // serving a stale pre-update snapshot even on force-dynamic routes.
      fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
    },
  });
}

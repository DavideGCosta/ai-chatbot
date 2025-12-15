import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

export function createSupabaseBrowserClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase browser env vars");
  }

  if (typeof window === "undefined") {
    // Return a dummy client or throw a clear error if preferred,
    // but returning a minimal object might satisfy the type if casted,
    // or better allow it to fail gracefully if the provider handles it.
    // However, createBrowserClient is supposed to be SSR safe.
    // Let's just create it. If it fails, safe guarding here won't help if the library is broken.
    // Instead, let's assuming it's fine and look elsewhere, BUT
    // adding a check doesn't hurt.
    return createBrowserClient(supabaseUrl, supabaseAnonKey, {
      isSingleton: false,
      cookieOptions: { name: "sb-auth-token" }, // Dummy options
    });
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

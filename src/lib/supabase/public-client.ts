import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { getPublicSupabaseConfig } from "@/src/lib/utils/env";

let supabaseBrowserClient: SupabaseClient | null = null;

export function getSupabaseBrowserClient() {
  if (!supabaseBrowserClient) {
    const { supabaseUrl, supabasePublishableKey } = getPublicSupabaseConfig();

    if (!supabaseUrl || !supabasePublishableKey) {
      throw new Error(
        "Supabase browser client is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY."
      );
    }

    supabaseBrowserClient = createClient(supabaseUrl, supabasePublishableKey);
  }

  return supabaseBrowserClient;
}

import "react-native-url-polyfill/auto";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

/** Lazy Supabase client — only created on first call. Safe to import in mock mode. */
export function getSupabase(): SupabaseClient {
  if (!_client) {
    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error(
        "Missing Supabase env vars. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in .env",
      );
    }

    _client = createClient(supabaseUrl, supabaseAnonKey);
  }
  return _client;
}

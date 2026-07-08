import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const url = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";

// True only when both build-time env vars are present. When false the app shows
// a readable config screen instead of crashing — createClient throws on an empty
// key, and a module-load throw would white-screen before React can render.
export const supabaseConfigured = Boolean(url && anonKey);

// Anon key only — never the service role key in a mobile app. Non-empty
// placeholders keep createClient from throwing at import when env is missing;
// real use is guarded by supabaseConfigured.
export const supabase = createClient(
  url || "https://placeholder.supabase.co",
  anonKey || "placeholder-anon-key",
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  },
);

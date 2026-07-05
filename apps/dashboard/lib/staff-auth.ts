import { createClient } from "@supabase/supabase-js";
import type { Database } from "@llw/db";

// Authenticates a staff HTTP request via `Authorization: Bearer <access_token>`
// (the Expo app sends its Supabase session token). Returns the user id or null.
export async function authedUserId(request: Request): Promise<string | null> {
  const header = request.headers.get("authorization") ?? "";
  const token = header.toLowerCase().startsWith("bearer ")
    ? header.slice(7).trim()
    : null;
  if (!token) return null;

  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

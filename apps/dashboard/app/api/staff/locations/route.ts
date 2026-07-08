import { apiError, apiOk } from "@/lib/api";
import { authedUserId } from "@/lib/staff-auth";
import { createAdminClient } from "@/lib/supabase/admin";

// GET /api/staff/locations — active locations the signed-in staff user can
// attribute scans to (across every business they're an active member of).
export async function GET(request: Request) {
  const userId = await authedUserId(request);
  if (!userId) return apiError("unauthorized", "Sign in required.", 401);

  const admin = createAdminClient();
  const { data: members } = await admin
    .from("staff_members")
    .select("business_id")
    .eq("user_id", userId)
    .eq("is_active", true);

  const businessIds = [...new Set((members ?? []).map((m) => m.business_id))];
  if (businessIds.length === 0) return apiOk({ locations: [] });

  const { data: locations } = await admin
    .from("locations")
    .select("id, name")
    .in("business_id", businessIds)
    .eq("is_active", true)
    .order("name", { ascending: true });

  return apiOk({ locations: locations ?? [] });
}

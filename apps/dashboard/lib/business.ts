import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@llw/db";

export interface ActiveMembership {
  userId: string;
  businessId: string;
  staffMemberId: string;
  role: Database["public"]["Enums"]["user_role"];
}

// Resolves the current user's active business membership, or null if none.
export async function getActiveMembership(
  supabase: SupabaseClient<Database>,
): Promise<ActiveMembership | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("staff_members")
    .select("id, business_id, role")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .limit(1)
    .maybeSingle();

  if (!data) return null;
  return {
    userId: user.id,
    businessId: data.business_id,
    staffMemberId: data.id,
    role: data.role,
  };
}

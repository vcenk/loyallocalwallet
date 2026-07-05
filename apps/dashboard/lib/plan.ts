import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@llw/db";
import { getPlanLimits, type PlanLimits } from "@llw/config";

type DbClient = SupabaseClient<Database>;

export async function getBusinessPlan(
  supabase: DbClient,
  businessId: string,
): Promise<{ planKey: string; limits: PlanLimits }> {
  const { data } = await supabase
    .from("businesses")
    .select("plan_key")
    .eq("id", businessId)
    .maybeSingle();
  const planKey = data?.plan_key ?? "trial";
  return { planKey, limits: getPlanLimits(planKey) };
}

export async function countPrograms(supabase: DbClient, businessId: string) {
  const { count } = await supabase
    .from("loyalty_programs")
    .select("id", { count: "exact", head: true })
    .eq("business_id", businessId);
  return count ?? 0;
}

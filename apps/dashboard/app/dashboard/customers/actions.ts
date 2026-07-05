"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getActiveMembership } from "@/lib/business";
import { generateSerial } from "@/lib/token";

const DAY = 86_400_000;

// name, days since last visit, current stamps — a varied mix so analytics,
// inactive lists, and win-back suggestions all have something to show.
const SAMPLES = [
  { name: "Sarah Jenkins", days: 2, stamps: 7 },
  { name: "Marcus Thorne", days: 5, stamps: 10 },
  { name: "Elena Rodriguez", days: 0, stamps: 1 },
  { name: "Liam Chen", days: 24, stamps: 4 },
  { name: "Priya Patel", days: 33, stamps: 8 },
  { name: "Noah Williams", days: 45, stamps: 2 },
  { name: "Ava Martin", days: 9, stamps: 9 },
  { name: "Ethan Brown", days: 15, stamps: 5 },
  { name: "Mia Garcia", days: 63, stamps: 3 },
  { name: "Lucas Kim", days: 1, stamps: 6 },
  { name: "Sofia Nguyen", days: 28, stamps: 10 },
  { name: "Oliver Davis", days: 12, stamps: 8 },
];

const CAN_SEED = ["business_owner", "business_admin"];

export async function seedDemoCustomers() {
  const supabase = await createClient();
  const m = await getActiveMembership(supabase);
  if (!m) redirect("/login");
  if (!CAN_SEED.includes(m.role)) {
    redirect(
      `/dashboard/customers?error=${encodeURIComponent("Only owners/admins can load demo data.")}`,
    );
  }

  const admin = createAdminClient();
  const { data: program } = await admin
    .from("loyalty_programs")
    .select("id, stamps_required")
    .eq("business_id", m.businessId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (!program) {
    redirect(
      `/dashboard/customers?error=${encodeURIComponent("Create a loyalty card first.")}`,
    );
  }
  const required = program.stamps_required ?? 10;
  const now = Date.now();

  const { data: customers } = await admin
    .from("customers")
    .insert(
      SAMPLES.map((s) => ({
        business_id: m.businessId,
        first_name: s.name.split(" ")[0],
        last_name: s.name.split(" ")[1] ?? null,
        marketing_consent: true,
        first_seen_at: new Date(now - (s.days + 30) * DAY).toISOString(),
        last_seen_at: new Date(now - s.days * DAY).toISOString(),
      })),
    )
    .select("id");
  if (!customers) {
    redirect(
      `/dashboard/customers?error=${encodeURIComponent("Could not create demo customers.")}`,
    );
  }

  const { data: passes } = await admin
    .from("wallet_passes")
    .insert(
      customers.map((c, i) => ({
        business_id: m.businessId,
        customer_id: c.id,
        program_id: program.id,
        platform: "apple" as const,
        status: "active" as const,
        serial_number: generateSerial(),
        current_stamps: SAMPLES[i].stamps,
        rewards_available: Math.floor(SAMPLES[i].stamps / required),
      })),
    )
    .select("id");

  if (passes) {
    await admin.from("stamp_events").insert(
      passes.map((p, i) => ({
        business_id: m.businessId,
        customer_id: customers[i].id,
        program_id: program.id,
        wallet_pass_id: p.id,
        staff_member_id: m.staffMemberId,
        event_type: "earn" as const,
        quantity: SAMPLES[i].stamps,
        reason: "demo seed",
      })),
    );
  }

  revalidatePath("/dashboard/customers");
  redirect("/dashboard/customers?seeded=1");
}

import { z } from "zod";
import { apiError, apiOk } from "@/lib/api";
import { authedUserId } from "@/lib/staff-auth";
import { rateLimit } from "@/lib/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  findPassBySerial,
  loadProgram,
  getMembership,
  computeProgress,
} from "@/lib/stamps";

const bodySchema = z.object({
  barcodeValue: z.string().min(1),
  locationId: z.string().uuid().optional(),
});

// POST /api/staff/scan — validate a scanned pass and return current progress.
export async function POST(request: Request) {
  const userId = await authedUserId(request);
  if (!userId) return apiError("unauthorized", "Sign in required.", 401);
  if (!rateLimit(`scan:${userId}`, 60, 60_000).ok) {
    return apiError("rate_limited", "Too many requests. Slow down.", 429);
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return apiError("validation_error", parsed.error.issues[0].message, 400);
  }

  const admin = createAdminClient();
  const pass = await findPassBySerial(admin, parsed.data.barcodeValue);
  if (!pass) return apiError("not_found", "Card not found.", 404);

  const membership = await getMembership(admin, userId, pass.business_id);
  if (!membership) {
    return apiError("permission_denied", "Not authorized for this business.", 403);
  }

  const program = await loadProgram(admin, pass.program_id);
  if (!program) return apiError("not_found", "Program not found.", 404);

  const progress = await computeProgress(admin, pass.id, program);
  const { data: customer } = await admin
    .from("customers")
    .select("first_name, last_name")
    .eq("id", pass.customer_id)
    .maybeSingle();

  return apiOk({
    walletPassId: pass.id,
    customerId: pass.customer_id,
    customerName:
      `${customer?.first_name ?? "Guest"} ${customer?.last_name ?? ""}`.trim(),
    programId: program.id,
    programName: program.name,
    rewardTitle: program.reward_title,
    stampsRequired: program.stamps_required,
    currentStamps: progress.towardNext,
    total: progress.total,
    rewardsAvailable: progress.rewardsAvailable,
  });
}

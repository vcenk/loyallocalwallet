import { z } from "zod";
import { apiError, apiOk } from "@/lib/api";
import { authedUserId } from "@/lib/staff-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { findPassById, loadProgram, getMembership, addStamp } from "@/lib/stamps";
import { rateLimit } from "@/lib/rate-limit";

const bodySchema = z.object({
  walletPassId: z.string().uuid(),
  locationId: z.string().uuid().nullish(),
  eventType: z.enum(["earn", "bonus"]).optional(),
  reason: z.string().max(120).optional(),
  quantity: z.coerce.number().int().min(1).max(100000).optional(),
});

// POST /api/staff/stamps — add a stamp or bonus stamp to a pass.
export async function POST(request: Request) {
  const userId = await authedUserId(request);
  if (!userId) return apiError("unauthorized", "Sign in required.", 401);
  if (!rateLimit(`stamps:${userId}`, 40, 60_000).ok) {
    return apiError("rate_limited", "Too many requests. Slow down.", 429);
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return apiError("validation_error", parsed.error.issues[0].message, 400);
  }

  const admin = createAdminClient();
  const pass = await findPassById(admin, parsed.data.walletPassId);
  if (!pass) return apiError("not_found", "Card not found.", 404);

  const membership = await getMembership(admin, userId, pass.business_id);
  if (!membership) {
    return apiError("permission_denied", "Not authorized for this business.", 403);
  }

  const program = await loadProgram(admin, pass.program_id);
  if (!program) return apiError("not_found", "Program not found.", 404);

  const progress = await addStamp(
    admin,
    { userId, staffMemberId: membership.staffMemberId, businessId: pass.business_id },
    pass,
    program,
    {
      isBonus: parsed.data.eventType === "bonus",
      reason: parsed.data.reason,
      locationId: parsed.data.locationId ?? null,
      quantity: parsed.data.quantity,
    },
  );

  return apiOk({
    currentStamps: progress.towardNext,
    total: progress.total,
    rewardsAvailable: progress.rewardsAvailable,
  });
}

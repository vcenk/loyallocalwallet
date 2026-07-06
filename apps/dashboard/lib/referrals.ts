import "server-only";
import {
  type DbClient,
  type PassInfo,
  loadProgram,
  findPassById,
  giveSystemBonus,
} from "./stamps";

// When a friend enrolls via a ?ref= link, credit both sides one bonus stamp.
// Idempotent (each referred customer is credited once) and never throws.
export async function processReferral(
  admin: DbClient,
  opts: {
    businessId: string;
    programId: string;
    referrerCode: string;
    referredCustomerId: string;
    referredPassId: string;
  },
): Promise<void> {
  try {
    if (!opts.referrerCode) return;

    const { data: referrer } = await admin
      .from("customers")
      .select("id")
      .eq("business_id", opts.businessId)
      .eq("referral_code", opts.referrerCode)
      .maybeSingle();
    if (!referrer || referrer.id === opts.referredCustomerId) return;

    // One credit per referred customer.
    const { data: existing } = await admin
      .from("referrals")
      .select("id")
      .eq("referred_customer_id", opts.referredCustomerId)
      .maybeSingle();
    if (existing) return;

    const { error } = await admin.from("referrals").insert({
      business_id: opts.businessId,
      program_id: opts.programId,
      referrer_customer_id: referrer.id,
      referred_customer_id: opts.referredCustomerId,
    });
    if (error) return; // unique violation → already credited

    // Bonus for the new customer (on the pass they just created).
    const program = await loadProgram(admin, opts.programId);
    const newPass = await findPassById(admin, opts.referredPassId);
    if (program && newPass) {
      await giveSystemBonus(admin, newPass, program, "Welcome — referred by a friend");
    }

    // Bonus for the referrer (on their active pass).
    const { data: passes } = await admin
      .from("wallet_passes")
      .select("id, business_id, customer_id, program_id, status")
      .eq("customer_id", referrer.id);
    const primary = (passes ?? []).find(
      (p) => p.status !== "voided" && p.status !== "deleted",
    );
    if (primary) {
      const refProgram = await loadProgram(admin, primary.program_id);
      if (refProgram) {
        const info: PassInfo = {
          id: primary.id,
          business_id: primary.business_id,
          customer_id: primary.customer_id,
          program_id: primary.program_id,
        };
        await giveSystemBonus(admin, info, refProgram, "You referred a friend");
      }
    }
  } catch (err) {
    console.error("processReferral failed", err);
  }
}

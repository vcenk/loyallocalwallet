import { createAdminClient } from "@/lib/supabase/admin";
import { runDailyAutomations } from "@/lib/automations";

export const runtime = "nodejs";
export const maxDuration = 300;

// Runs daily via Vercel Cron (see vercel.json). Secured by CRON_SECRET —
// Vercel includes it as a Bearer token on scheduled invocations.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");
  if (secret && auth !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const admin = createAdminClient();
    const result = await runDailyAutomations(admin);
    return Response.json({ ok: true, ...result });
  } catch (err) {
    console.error("cron automations failed", err);
    return new Response("Automation run failed.", { status: 500 });
  }
}

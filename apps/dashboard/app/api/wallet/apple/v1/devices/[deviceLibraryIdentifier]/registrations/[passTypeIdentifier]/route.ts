import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

// Returns the serial numbers of passes registered to a device (optionally only
// those updated since a tag). No auth required per the PassKit spec.
export async function GET(
  request: Request,
  {
    params,
  }: {
    params: Promise<{
      deviceLibraryIdentifier: string;
      passTypeIdentifier: string;
    }>;
  },
) {
  const { deviceLibraryIdentifier } = await params;
  const admin = createAdminClient();

  const { data: regs } = await admin
    .from("pass_registrations")
    .select("wallet_pass_id")
    .eq("device_library_identifier", deviceLibraryIdentifier);

  const passIds = (regs ?? []).map((r) => r.wallet_pass_id);
  if (passIds.length === 0) return new Response(null, { status: 204 });

  const { data: passes } = await admin
    .from("wallet_passes")
    .select("serial_number, updated_at")
    .in("id", passIds);

  const since = new URL(request.url).searchParams.get("passesUpdatedSince");
  const filtered = (passes ?? []).filter(
    (p) => !since || new Date(p.updated_at) > new Date(since),
  );
  if (filtered.length === 0) return new Response(null, { status: 204 });

  return Response.json({
    lastUpdated: new Date().toISOString(),
    serialNumbers: filtered.map((p) => p.serial_number),
  });
}

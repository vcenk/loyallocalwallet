import { createAdminClient } from "@/lib/supabase/admin";
import { authorizePass } from "@/lib/wallet";

export const runtime = "nodejs";

type Params = Promise<{
  deviceLibraryIdentifier: string;
  passTypeIdentifier: string;
  serialNumber: string;
}>;

// Register a device to receive updates for a pass.
export async function POST(
  request: Request,
  { params }: { params: Params },
) {
  const { deviceLibraryIdentifier, serialNumber } = await params;
  const admin = createAdminClient();

  const pass = await authorizePass(
    admin,
    serialNumber,
    request.headers.get("authorization"),
  );
  if (!pass) return new Response("Unauthorized", { status: 401 });

  const body = (await request.json().catch(() => null)) as {
    pushToken?: string;
  } | null;
  if (!body?.pushToken) return new Response("Bad request", { status: 400 });

  const { data: existing } = await admin
    .from("pass_registrations")
    .select("id")
    .eq("device_library_identifier", deviceLibraryIdentifier)
    .eq("wallet_pass_id", pass.id)
    .maybeSingle();
  if (existing) return new Response(null, { status: 200 });

  await admin.from("pass_registrations").insert({
    wallet_pass_id: pass.id,
    device_library_identifier: deviceLibraryIdentifier,
    push_token: body.pushToken,
  });
  await admin
    .from("wallet_passes")
    .update({ status: "installed", installed_at: new Date().toISOString() })
    .eq("id", pass.id);

  return new Response(null, { status: 201 });
}

// Unregister a device → void the pass (per docs/security.md).
export async function DELETE(
  request: Request,
  { params }: { params: Params },
) {
  const { deviceLibraryIdentifier, serialNumber } = await params;
  const admin = createAdminClient();

  const pass = await authorizePass(
    admin,
    serialNumber,
    request.headers.get("authorization"),
  );
  if (!pass) return new Response("Unauthorized", { status: 401 });

  await admin
    .from("pass_registrations")
    .delete()
    .eq("device_library_identifier", deviceLibraryIdentifier)
    .eq("wallet_pass_id", pass.id);

  await admin
    .from("wallet_passes")
    .update({ status: "voided", uninstalled_at: new Date().toISOString() })
    .eq("id", pass.id);

  return new Response(null, { status: 200 });
}

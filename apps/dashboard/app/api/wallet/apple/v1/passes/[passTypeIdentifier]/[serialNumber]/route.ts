import { isAppleWalletConfigured, generateApplePkpass } from "@llw/wallet";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  authorizePass,
  cardDataBySerial,
  passAuthTokenBySerial,
  appleWebServiceURL,
} from "@/lib/wallet";

export const runtime = "nodejs";

// Returns the latest .pkpass for a pass (called by the device after a push).
export async function GET(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ passTypeIdentifier: string; serialNumber: string }>;
  },
) {
  const { serialNumber } = await params;
  const admin = createAdminClient();

  const pass = await authorizePass(
    admin,
    serialNumber,
    request.headers.get("authorization"),
  );
  if (!pass) return new Response("Unauthorized", { status: 401 });
  if (!isAppleWalletConfigured()) {
    return new Response("Not configured", { status: 501 });
  }

  const data = await cardDataBySerial(admin, serialNumber);
  if (!data) return new Response("Not found", { status: 404 });

  const token = await passAuthTokenBySerial(admin, serialNumber);
  const buffer = await generateApplePkpass(
    data,
    token
      ? { webServiceURL: appleWebServiceURL(), authenticationToken: token }
      : {},
  );

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.apple.pkpass",
      "Last-Modified": new Date().toUTCString(),
    },
  });
}

import { isAppleWalletConfigured, generateApplePkpass } from "@llw/wallet";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  cardDataBySerial,
  passAuthTokenBySerial,
  appleWebServiceURL,
} from "@/lib/wallet";

export const runtime = "nodejs";

// GET /api/wallet/apple/passes/:serialNumber — returns the signed .pkpass.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ serialNumber: string }> },
) {
  const { serialNumber } = await params;

  if (!isAppleWalletConfigured()) {
    return new Response("Apple Wallet is not configured yet.", { status: 501 });
  }

  const admin = createAdminClient();
  const data = await cardDataBySerial(admin, serialNumber);
  if (!data) return new Response("Pass not found.", { status: 404 });

  try {
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
        "Content-Disposition": `attachment; filename="${serialNumber}.pkpass"`,
      },
    });
  } catch (err) {
    console.error("apple pass generation failed", err);
    return new Response("Could not generate pass.", { status: 500 });
  }
}

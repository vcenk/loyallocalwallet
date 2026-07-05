export const runtime = "nodejs";

// Apple posts pass web-service errors here. Accept and log.
export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("[apple-wallet-log]", JSON.stringify(body));
  } catch {
    // ignore malformed logs
  }
  return new Response(null, { status: 200 });
}

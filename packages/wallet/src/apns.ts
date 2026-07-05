import { readFileSync } from "node:fs";
import http2 from "node:http2";
import jwt from "jsonwebtoken";
import { appleConfig } from "./env";

// APNs provider token (ES256 JWT signed with the .p8 key), cached ~50 min.
let cached: { token: string; iat: number } | null = null;

function providerToken(): string {
  const now = Math.floor(Date.now() / 1000);
  if (cached && now - cached.iat < 3000) return cached.token;
  const key = readFileSync(process.env.APPLE_APNS_PRIVATE_KEY_PATH ?? "", "utf8");
  const token = jwt.sign(
    { iss: process.env.APPLE_APNS_TEAM_ID, iat: now },
    key,
    { algorithm: "ES256", keyid: process.env.APPLE_APNS_KEY_ID },
  );
  cached = { token, iat: now };
  return token;
}

// Tells Wallet to re-fetch the pass. Topic = the pass type identifier.
export async function sendPassUpdatePush(pushToken: string): Promise<void> {
  const topic = appleConfig().passTypeIdentifier;
  const client = http2.connect("https://api.push.apple.com");
  try {
    await new Promise<void>((resolve, reject) => {
      const req = client.request({
        ":method": "POST",
        ":path": `/3/device/${pushToken}`,
        authorization: `bearer ${providerToken()}`,
        "apns-topic": topic,
        "apns-push-type": "background",
        "apns-priority": "5",
        "content-type": "application/json",
      });
      let status = 0;
      req.setEncoding("utf8");
      req.on("response", (headers) => {
        status = Number(headers[":status"]);
      });
      req.on("data", () => {});
      req.on("end", () =>
        status >= 200 && status < 300
          ? resolve()
          : reject(new Error(`APNs responded ${status}`)),
      );
      req.on("error", reject);
      req.end(JSON.stringify({ aps: { "content-available": 1 } }));
    });
  } finally {
    client.close();
  }
}

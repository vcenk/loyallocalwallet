import jwt from "jsonwebtoken";
import { googleConfig } from "./env";
import type { WalletCardData } from "./types";

const OBJECT_API = "https://walletobjects.googleapis.com/walletobjects/v1";

// Google requires a program logo on the class. Fallback when a business hasn't
// uploaded one (a stable public image; replaced by the real logo in production).
const DEFAULT_LOGO_URI =
  "https://www.gstatic.com/images/branding/product/2x/googleg_48dp.png";

// Google class/object ids must be `${issuerId}.${suffix}` with an alnum._- suffix.
function suffix(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function shortText(value: string | null | undefined, fallback: string, max = 60) {
  const text = String(value || fallback).trim();
  return text.length > max ? `${text.slice(0, max - 1)}...` : text;
}

function googleImage(uri: string, description: string) {
  return {
    sourceUri: { uri },
    contentDescription: {
      defaultValue: {
        language: "en-US",
        value: description,
      },
    },
  };
}

export function classIdFor(programId: string) {
  return `${googleConfig().issuerId}.program_${suffix(programId)}`;
}

export function objectIdFor(serialNumber: string) {
  return `${googleConfig().issuerId}.pass_${suffix(serialNumber)}`;
}

function buildLoyaltyClass(data: WalletCardData) {
  const logoUri = data.logoUrl || DEFAULT_LOGO_URI;
  return {
    id: classIdFor(data.programId),
    issuerName: data.businessName || "Loyalty",
    programName: shortText(data.programName, "Rewards", 40),
    reviewStatus: "UNDER_REVIEW",
    hexBackgroundColor: data.backgroundColor,
    programLogo: googleImage(logoUri, `${data.businessName || "Business"} logo`),
    wideProgramLogo: googleImage(logoUri, `${data.businessName || "Business"} logo`),
    heroImage: data.logoUrl
      ? googleImage(data.logoUrl, `${data.programName || "Loyalty card"} artwork`)
      : undefined,
  };
}

function buildLoyaltyObject(data: WalletCardData) {
  const total = Math.max(1, Math.round(data.stampsRequired || 1));
  const filled = Math.max(0, Math.min(Math.round(data.currentStamps || 0), total));
  const remaining = Math.max(0, total - filled);
  const rewardReady = data.rewardsAvailable > 0 || filled >= total;
  const progressBody = rewardReady
    ? "Reward ready to redeem"
    : `${filled} of ${total} stamps - ${remaining} to go`;

  return {
    id: objectIdFor(data.serialNumber),
    classId: classIdFor(data.programId),
    state: "ACTIVE",
    accountName: data.customerName || "Member",
    accountId: data.serialNumber,
    loyaltyPoints: {
      label: "Stamps",
      balance: { int: filled },
    },
    barcode: {
      type: "QR_CODE",
      value: data.serialNumber,
      alternateText: shortText(data.businessName, data.serialNumber, 24),
    },
    heroImage: data.logoUrl
      ? googleImage(data.logoUrl, `${data.businessName || "Business"} artwork`)
      : undefined,
    textModulesData: [
      {
        id: "program",
        header: data.businessName || "Member card",
        body: shortText(data.programName, "Rewards", 60),
      },
      { id: "reward", header: "Reward", body: shortText(data.rewardTitle, "Reward", 80) },
      {
        id: "progress",
        header: "Progress",
        body: progressBody,
      },
    ],
    // Self-serve preference / unsubscribe — mirrors the Apple pass back field so
    // the customer can opt out from the Google card too. Serial is the auth token.
    linksModuleData: {
      uris: [
        {
          id: "preferences",
          description: "Manage offers or unsubscribe",
          uri: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/unsubscribe/${data.serialNumber}`,
        },
      ],
    },
  };
}

// A "Save to Google Wallet" URL. The class+object are embedded in a signed JWT
// and created on the customer's device when they tap save — no REST call needed.
export function createGoogleSaveUrl(data: WalletCardData): string {
  const cfg = googleConfig();
  const claims = {
    iss: cfg.serviceAccountEmail,
    aud: "google",
    typ: "savetowallet",
    origins: cfg.origins,
    payload: {
      loyaltyClasses: [buildLoyaltyClass(data)],
      loyaltyObjects: [buildLoyaltyObject(data)],
    },
  };
  const token = jwt.sign(claims, cfg.privateKey, { algorithm: "RS256" });
  return `https://pay.google.com/gp/v/save/${token}`;
}

// OAuth access token via a service-account JWT assertion (no extra deps).
async function getAccessToken(): Promise<string> {
  const cfg = googleConfig();
  const now = Math.floor(Date.now() / 1000);
  const assertion = jwt.sign(
    {
      iss: cfg.serviceAccountEmail,
      scope: "https://www.googleapis.com/auth/wallet_object.issuer",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    },
    cfg.privateKey,
    { algorithm: "RS256" },
  );

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });
  if (!res.ok) throw new Error(`Google token error: ${res.status}`);
  const json = (await res.json()) as { access_token?: string };
  if (!json.access_token) throw new Error("No Google access token returned.");
  return json.access_token;
}

// Patch a loyalty object after a stamp/redeem. Returns false if the object
// doesn't exist yet (customer hasn't saved the pass) — caller treats as no-op.
export async function patchGoogleObject(data: WalletCardData): Promise<boolean> {
  const token = await getAccessToken();
  const objectId = objectIdFor(data.serialNumber);
  const res = await fetch(`${OBJECT_API}/loyaltyObject/${objectId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      loyaltyPoints: {
        label: "Stamps",
        balance: {
          int: Math.max(
            0,
            Math.min(
              Math.round(data.currentStamps || 0),
              Math.max(1, Math.round(data.stampsRequired || 1)),
            ),
          ),
        },
      },
      textModulesData: [
        {
          id: "program",
          header: data.businessName || "Member card",
          body: shortText(data.programName, "Rewards", 60),
        },
        { id: "reward", header: "Reward", body: shortText(data.rewardTitle, "Reward", 80) },
        {
          id: "progress",
          header: "Progress",
          body:
            data.rewardsAvailable > 0
              ? "Reward ready to redeem"
              : `${Math.max(0, Math.round(data.currentStamps || 0))} of ${Math.max(1, Math.round(data.stampsRequired || 1))} stamps`,
        },
      ],
    }),
  });
  if (res.status === 404) return false;
  if (!res.ok) throw new Error(`Google patch error: ${res.status}`);
  return true;
}

// Sends a notification to a saved Google Wallet pass (campaign / review nudge).
// Returns false if the object doesn't exist yet (pass not saved).
export async function addGoogleMessage(
  serialNumber: string,
  header: string,
  body: string,
): Promise<boolean> {
  const token = await getAccessToken();
  const objectId = objectIdFor(serialNumber);
  const res = await fetch(
    `${OBJECT_API}/loyaltyObject/${objectId}/addMessage`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: { header, body } }),
    },
  );
  if (res.status === 404) return false;
  if (!res.ok) throw new Error(`Google addMessage error: ${res.status}`);
  return true;
}

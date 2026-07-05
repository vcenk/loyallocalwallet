import { supabase } from "./supabase";

const BASE = process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:3000/api";

export interface ScanResult {
  walletPassId: string;
  customerId: string;
  customerName: string;
  programId: string;
  programName: string;
  rewardTitle: string;
  stampsRequired: number;
  currentStamps: number;
  total: number;
  rewardsAvailable: number;
}

export interface ProgressResult {
  currentStamps: number;
  total: number;
  rewardsAvailable: number;
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("You are signed out.");

  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(body),
  });

  const json = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(json?.error?.message ?? "Request failed.");
  }
  return json as T;
}

export const api = {
  scan: (barcodeValue: string) =>
    post<ScanResult>("/staff/scan", { barcodeValue }),
  addStamp: (walletPassId: string, opts?: { eventType?: "earn" | "bonus"; reason?: string }) =>
    post<ProgressResult>("/staff/stamps", { walletPassId, ...opts }),
  redeem: (walletPassId: string) =>
    post<ProgressResult>("/staff/redeem", { walletPassId }),
};

import { supabase } from "./supabase";

const BASE = process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:3000/api";

export type ProgramType = "stamps" | "points" | "visits" | "spend";

export interface ScanResult {
  walletPassId: string;
  customerId: string;
  customerName: string;
  programId: string;
  programName: string;
  programType: ProgramType;
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

export interface StaffLocation {
  id: string;
  name: string;
}

async function authHeader(): Promise<Record<string, string>> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("You are signed out.");
  return { Authorization: `Bearer ${session.access_token}` };
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(await authHeader()) },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(json?.error?.message ?? "Request failed.");
  return json as T;
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "GET",
    headers: await authHeader(),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(json?.error?.message ?? "Request failed.");
  return json as T;
}

export const api = {
  scan: (barcodeValue: string, locationId?: string | null) =>
    post<ScanResult>("/staff/scan", { barcodeValue, locationId: locationId ?? undefined }),
  addStamp: (
    walletPassId: string,
    opts?: {
      eventType?: "earn" | "bonus";
      reason?: string;
      quantity?: number;
      locationId?: string | null;
    },
  ) =>
    post<ProgressResult>("/staff/stamps", {
      walletPassId,
      ...opts,
      locationId: opts?.locationId ?? undefined,
    }),
  redeem: (walletPassId: string, locationId?: string | null) =>
    post<ProgressResult>("/staff/redeem", {
      walletPassId,
      locationId: locationId ?? undefined,
    }),
  listLocations: () => get<{ locations: StaffLocation[] }>("/staff/locations"),
};

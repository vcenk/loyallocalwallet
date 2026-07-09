"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Camera,
  X,
  Users,
  ArrowLeft,
  LayoutDashboard,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type ProgramType = "stamps" | "points" | "visits" | "spend";

interface ScanResult {
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
interface ProgressResult {
  currentStamps: number;
  total: number;
  rewardsAvailable: number;
}
interface StaffLocation {
  id: string;
  name: string;
}

const READER_ID = "qr-reader";
const LOCATION_KEY = "llw.scan.locationId";
const BONUS_REASONS = ["Referral", "Birthday", "Manager bonus"];
const AMOUNT_MODES: ProgramType[] = ["points", "spend"];
const ADD_LABEL: Record<ProgramType, string> = {
  stamps: "Add stamp",
  visits: "Add visit",
  points: "Add points",
  spend: "Add amount",
};
const AMOUNT_PLACEHOLDER: Record<string, string> = {
  points: "Points earned",
  spend: "Amount spent",
};

export function Scanner() {
  const supabase = useMemo(() => createClient(), []);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [progress, setProgress] = useState<ProgressResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manual, setManual] = useState("");
  const [cameraOn, setCameraOn] = useState(false);
  const [locations, setLocations] = useState<StaffLocation[]>([]);
  const [locationId, setLocationId] = useState<string | null>(null);
  const [amount, setAmount] = useState("1");

  const scannerRef = useRef<{ stop: () => Promise<void>; clear: () => void } | null>(null);
  const locationRef = useRef<string | null>(null);
  locationRef.current = locationId;
  const busyRef = useRef(false);
  busyRef.current = busy;

  // Authed fetch to the existing /api/staff endpoints (Bearer = session token).
  const authedFetch = useCallback(
    async (path: string, init?: RequestInit) => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error("You're signed out — reload and log in again.");
      const res = await fetch(`/api/staff${path}`, {
        ...init,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          ...(init?.headers ?? {}),
        },
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error?.message ?? "Request failed.");
      return json;
    },
    [supabase],
  );

  // Load locations + saved selection once.
  useEffect(() => {
    setLocationId(localStorage.getItem(LOCATION_KEY) || null);
    authedFetch("/locations")
      .then((r) => setLocations(r.locations ?? []))
      .catch(() => setLocations([]));
  }, [authedFetch]);

  const chooseLocation = (id: string | null) => {
    setLocationId(id);
    if (id) localStorage.setItem(LOCATION_KEY, id);
    else localStorage.removeItem(LOCATION_KEY);
  };

  const lookup = useCallback(
    async (barcodeValue: string) => {
      const value = barcodeValue.trim();
      if (!value || busyRef.current) return;
      setBusy(true);
      setError(null);
      try {
        const scan: ScanResult = await authedFetch("/scan", {
          method: "POST",
          body: JSON.stringify({ barcodeValue: value, locationId: locationRef.current }),
        });
        setResult(scan);
        setProgress({
          currentStamps: scan.currentStamps,
          total: scan.total,
          rewardsAvailable: scan.rewardsAvailable,
        });
        setAmount("1");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Scan failed.");
      } finally {
        setBusy(false);
      }
    },
    [authedFetch],
  );

  // Start/stop the camera when cameraOn toggles.
  useEffect(() => {
    if (!cameraOn) return;
    let cancelled = false;
    (async () => {
      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        if (cancelled) return;
        const instance = new Html5Qrcode(READER_ID);
        scannerRef.current = instance;
        await instance.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 240, height: 240 } },
          (decoded: string) => {
            setCameraOn(false);
            lookup(decoded);
          },
          () => {},
        );
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error
              ? `Camera error: ${e.message}`
              : "Could not start the camera. Use manual entry below.",
          );
          setCameraOn(false);
        }
      }
    })();
    return () => {
      cancelled = true;
      const inst = scannerRef.current;
      scannerRef.current = null;
      if (inst) {
        inst
          .stop()
          .then(() => inst.clear())
          .catch(() => {});
      }
    };
  }, [cameraOn, lookup]);

  async function run(fn: () => Promise<ProgressResult>) {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      setProgress(await fn());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  function addEarn() {
    if (!result) return;
    const quantity = AMOUNT_MODES.includes(result.programType)
      ? Math.max(1, Math.floor(Number(amount) || 1))
      : 1;
    run(() =>
      authedFetch("/stamps", {
        method: "POST",
        body: JSON.stringify({
          walletPassId: result.walletPassId,
          quantity,
          locationId,
        }),
      }),
    );
  }

  function reset() {
    setResult(null);
    setProgress(null);
    setError(null);
    setManual("");
  }

  // ---- Result view ----
  if (result && progress) {
    const rewardReady = progress.rewardsAvailable > 0;
    const filled = Math.min(progress.currentStamps, result.stampsRequired);
    const remaining = Math.max(0, result.stampsRequired - filled);
    const amountMode = AMOUNT_MODES.includes(result.programType);
    const dots = result.stampsRequired <= 12;

    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col gap-4 px-5 py-6">
        <button
          onClick={reset}
          className="flex items-center gap-1.5 text-sm font-semibold text-primary"
        >
          <ArrowLeft className="h-4 w-4" /> Scan another
        </button>

        {error ? <Banner>{error}</Banner> : null}

        <div
          className={`rounded-3xl border bg-card p-6 text-center shadow-sm ${rewardReady ? "border-[color:var(--success)]" : "border-border"}`}
        >
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
            {(result.customerName?.[0] ?? "G").toUpperCase()}
          </span>
          <h1 className="mt-3 font-display text-2xl font-bold text-foreground">
            {result.customerName}
          </h1>
          <p className="text-sm text-muted-foreground">{result.programName}</p>

          <div className="my-4 flex flex-wrap justify-center gap-2">
            {dots ? (
              Array.from({ length: result.stampsRequired }).map((_, i) => (
                <span
                  key={i}
                  className={`h-5 w-5 rounded-full border-2 ${i < filled ? "border-primary bg-primary" : "border-border"}`}
                />
              ))
            ) : (
              <span className="font-display text-3xl font-extrabold text-primary">
                {filled} / {result.stampsRequired}
              </span>
            )}
          </div>

          {rewardReady ? (
            <span className="inline-block rounded-full bg-[#e6f4ec] px-3 py-1.5 text-sm font-semibold text-[color:var(--success)]">
              🎉 Reward ready: {result.rewardTitle}
            </span>
          ) : (
            <p className="text-sm text-muted-foreground">
              {remaining === 0
                ? "Ready for a reward"
                : `${remaining} more to “${result.rewardTitle}”`}
            </p>
          )}
        </div>

        {rewardReady ? (
          <button
            onClick={() =>
              run(() =>
                authedFetch("/redeem", {
                  method: "POST",
                  body: JSON.stringify({
                    walletPassId: result.walletPassId,
                    locationId,
                  }),
                }),
              )
            }
            disabled={busy}
            className="h-14 rounded-2xl bg-[color:var(--success)] text-lg font-bold text-white transition-all active:scale-[0.98] disabled:opacity-60"
          >
            Redeem reward
          </button>
        ) : null}

        {amountMode ? (
          <div className="flex gap-3">
            <input
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={AMOUNT_PLACEHOLDER[result.programType] ?? "Amount"}
              className="w-28 rounded-2xl border border-input bg-card px-4 text-center text-xl font-bold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
            />
            <button
              onClick={addEarn}
              disabled={busy}
              className="h-14 flex-1 rounded-2xl bg-primary text-lg font-bold text-primary-foreground transition-all active:scale-[0.98] disabled:opacity-60"
            >
              {ADD_LABEL[result.programType]}
            </button>
          </div>
        ) : (
          <button
            onClick={addEarn}
            disabled={busy}
            className="h-14 rounded-2xl bg-primary text-lg font-bold text-primary-foreground transition-all active:scale-[0.98] disabled:opacity-60"
          >
            + {ADD_LABEL[result.programType]}
          </button>
        )}

        <p className="mt-2 text-sm font-semibold text-muted-foreground">
          Bonus stamp
        </p>
        <div className="flex flex-wrap gap-2">
          {BONUS_REASONS.map((reason) => (
            <button
              key={reason}
              disabled={busy}
              onClick={() =>
                run(() =>
                  authedFetch("/stamps", {
                    method: "POST",
                    body: JSON.stringify({
                      walletPassId: result.walletPassId,
                      eventType: "bonus",
                      reason,
                      locationId,
                    }),
                  }),
                )
              }
              className="rounded-full border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-60"
            >
              {reason}
            </button>
          ))}
        </div>
      </main>
    );
  }

  // ---- Scan view ----
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-4 px-5 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Scan a card
          </h1>
          <p className="text-sm text-muted-foreground">
            Point the camera at the customer&apos;s wallet QR
          </p>
        </div>
        <Link
          href="/dashboard"
          className="text-muted-foreground transition-colors hover:text-primary"
          aria-label="Dashboard"
        >
          <LayoutDashboard className="h-5 w-5" />
        </Link>
      </div>

      {locations.length > 0 ? (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Location
          </p>
          <div className="flex flex-wrap gap-2">
            <Chip label="All locations" active={!locationId} onClick={() => chooseLocation(null)} />
            {locations.map((l) => (
              <Chip
                key={l.id}
                label={l.name}
                active={locationId === l.id}
                onClick={() => chooseLocation(l.id)}
              />
            ))}
          </div>
        </div>
      ) : null}

      {error ? <Banner>{error}</Banner> : null}

      {cameraOn ? (
        <div className="relative overflow-hidden rounded-3xl bg-black">
          <div id={READER_ID} className="w-full [&_video]:w-full" />
          <button
            onClick={() => setCameraOn(false)}
            className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white"
            aria-label="Close camera"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => {
            setError(null);
            setCameraOn(true);
          }}
          className="flex flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-border bg-card py-14 transition-colors hover:border-primary/50"
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/15 text-primary">
            <Camera className="h-8 w-8" />
          </span>
          <span className="text-lg font-bold text-foreground">Scan with camera</span>
          <span className="text-sm text-muted-foreground">Tap to open the camera</span>
        </button>
      )}

      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">or enter code manually</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          lookup(manual);
        }}
        className="flex gap-2"
      >
        <input
          value={manual}
          onChange={(e) => setManual(e.target.value)}
          placeholder="llw_…"
          autoCapitalize="none"
          className="h-12 flex-1 rounded-2xl border border-input bg-card px-4 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
        />
        <button
          type="submit"
          disabled={busy}
          className="h-12 rounded-2xl bg-primary px-6 font-semibold text-primary-foreground transition-all active:scale-[0.98] disabled:opacity-60"
        >
          {busy ? "…" : "Look up"}
        </button>
      </form>

      <p className="mt-auto flex items-center justify-center gap-1.5 pt-4 text-xs text-muted-foreground">
        <Users className="h-3.5 w-3.5" /> Signed in as staff · stamps are attributed to the selected location
      </p>
    </main>
  );
}

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
        active
          ? "bg-primary text-primary-foreground"
          : "border border-border bg-card text-foreground hover:bg-muted"
      }`}
    >
      {label}
    </button>
  );
}

function Banner({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{children}</p>
  );
}

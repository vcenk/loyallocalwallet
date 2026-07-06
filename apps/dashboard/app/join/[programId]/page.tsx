import Link from "next/link";
import { notFound } from "next/navigation";
import { Apple, Smartphone } from "lucide-react";
import { CardPreview } from "@llw/ui";
import { createAdminClient } from "@/lib/supabase/admin";
import { enroll } from "./actions";

const INPUT_CLASS =
  "flex h-11 w-full rounded-xl border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30";

export default async function JoinPage({
  params,
  searchParams,
}: {
  params: Promise<{ programId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { programId } = await params;
  const { error } = await searchParams;

  const supabase = createAdminClient();
  const { data: program } = await supabase
    .from("loyalty_programs")
    .select("*")
    .eq("id", programId)
    .maybeSingle();
  if (!program) notFound();

  const [{ data: business }, { data: design }] = await Promise.all([
    supabase
      .from("businesses")
      .select("name")
      .eq("id", program.business_id)
      .maybeSingle(),
    supabase
      .from("card_designs")
      .select("background_color, foreground_color")
      .eq("program_id", programId)
      .maybeSingle(),
  ]);

  const businessName = business?.name ?? "This shop";
  const stampsRequired = program.stamps_required ?? 10;

  if (program.status !== "active") {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <div className="max-w-md text-center">
          <h1 className="text-xl font-bold text-foreground">
            This loyalty card isn&apos;t available yet
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Please check back soon, or ask {businessName} for their current
            reward card.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 px-6 py-10">
      <div className="text-center">
        <p className="text-sm font-medium text-muted-foreground">
          {businessName}
        </p>
        <h1 className="mt-1 text-2xl font-bold text-foreground">
          Join {program.name}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Collect {stampsRequired} stamps to earn {program.reward_title}.
        </p>
      </div>

      <div className="flex justify-center">
        <CardPreview
          businessName={businessName}
          programName={program.name}
          rewardTitle={program.reward_title}
          stampsRequired={stampsRequired}
          currentStamps={0}
          backgroundColor={design?.background_color ?? "#ae3115"}
          foregroundColor={design?.foreground_color ?? "#ffffff"}
        />
      </div>

      {error ? (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <form action={enroll} className="space-y-4">
        <input type="hidden" name="programId" value={program.id} />

        <input
          name="firstName"
          required
          placeholder="First name"
          autoComplete="given-name"
          className={INPUT_CLASS}
        />
        <input
          name="email"
          type="email"
          placeholder="Email (optional)"
          autoComplete="email"
          className={INPUT_CLASS}
        />
        <input
          name="phone"
          type="tel"
          placeholder="Phone (optional)"
          autoComplete="tel"
          className={INPUT_CLASS}
        />

        <div>
          <p className="mb-1.5 text-xs text-muted-foreground">
            Birthday (optional) — for a birthday treat 🎂
          </p>
          <div className="flex gap-2">
            <select name="birthMonth" defaultValue="" className={INPUT_CLASS} aria-label="Birth month">
              <option value="">Month</option>
              {[
                "January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December",
              ].map((label, i) => (
                <option key={label} value={i + 1}>
                  {label}
                </option>
              ))}
            </select>
            <select name="birthDay" defaultValue="" className={INPUT_CLASS} aria-label="Birth day">
              <option value="">Day</option>
              {Array.from({ length: 31 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>
          </div>
        </div>

        <label className="flex items-start gap-2 text-xs text-muted-foreground">
          <input
            type="checkbox"
            name="marketingConsent"
            className="mt-0.5 h-4 w-4 rounded border-input"
          />
          <span>
            Send me occasional offers and reward reminders from {businessName}.
          </span>
        </label>

        <div className="space-y-2 pt-1">
          <button
            type="submit"
            name="platform"
            value="apple"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-foreground px-4 py-3 text-sm font-semibold text-white transition-all hover:brightness-125 active:scale-[0.98]"
          >
            <Apple className="h-4 w-4" />
            Add to Apple Wallet
          </button>
          <button
            type="submit"
            name="platform"
            value="google"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-input bg-card px-4 py-3 text-sm font-semibold text-foreground transition-all hover:bg-muted active:scale-[0.98]"
          >
            <Smartphone className="h-4 w-4" />
            Save to Google Wallet
          </button>
        </div>

        <p className="text-center text-[11px] text-muted-foreground">
          No app required. Your card saves to your phone&apos;s wallet. By joining
          you agree to our{" "}
          <Link href="/terms" className="underline">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline">
            Privacy Policy
          </Link>
          .
        </p>
      </form>
    </main>
  );
}

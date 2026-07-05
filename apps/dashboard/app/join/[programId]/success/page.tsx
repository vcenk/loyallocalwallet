import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { CardPreview } from "@llw/ui";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  googleSaveUrlForSerial,
  isAppleWalletConfigured,
} from "@/lib/wallet";

export default async function JoinSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ programId: string }>;
  searchParams: Promise<{ p?: string }>;
}) {
  const { programId } = await params;
  const { p: serial } = await searchParams;
  if (!serial) notFound();

  const supabase = createAdminClient();
  const { data: pass } = await supabase
    .from("wallet_passes")
    .select("customer_id, program_id, current_stamps")
    .eq("serial_number", serial)
    .maybeSingle();
  if (!pass || pass.program_id !== programId) notFound();

  const [{ data: program }, { data: customer }] = await Promise.all([
    supabase
      .from("loyalty_programs")
      .select("*")
      .eq("id", programId)
      .maybeSingle(),
    supabase
      .from("customers")
      .select("first_name, business_id")
      .eq("id", pass.customer_id)
      .maybeSingle(),
  ]);
  if (!program || !customer) notFound();

  const [{ data: business }, { data: design }] = await Promise.all([
    supabase
      .from("businesses")
      .select("name")
      .eq("id", customer.business_id)
      .maybeSingle(),
    supabase
      .from("card_designs")
      .select("background_color, foreground_color")
      .eq("program_id", programId)
      .maybeSingle(),
  ]);

  const businessName = business?.name ?? "the shop";
  const stampsRequired = program.stamps_required ?? 10;

  const googleSaveUrl = await googleSaveUrlForSerial(supabase, serial);
  const appleAvailable = isAppleWalletConfigured();
  const walletReady = !!googleSaveUrl || appleAvailable;

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 px-6 py-10 text-center">
      <div>
        <CheckCircle2 className="mx-auto h-12 w-12 text-[color:var(--success)]" />
        <h1 className="mt-3 text-2xl font-bold text-foreground">
          You&apos;re in{customer.first_name ? `, ${customer.first_name}` : ""}!
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          You&apos;ve joined {program.name} at {businessName}.
        </p>
      </div>

      <div className="flex justify-center">
        <CardPreview
          businessName={businessName}
          programName={program.name}
          rewardTitle={program.reward_title}
          stampsRequired={stampsRequired}
          currentStamps={pass.current_stamps}
          backgroundColor={design?.background_color ?? "#ae3115"}
          foregroundColor={design?.foreground_color ?? "#ffffff"}
        />
      </div>

      {walletReady ? (
        <div className="flex flex-col gap-2">
          {appleAvailable ? (
            <a
              href={`/api/wallet/apple/passes/${serial}`}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-foreground px-4 py-3 text-sm font-semibold text-white transition-all hover:brightness-125"
            >
              Add to Apple Wallet
            </a>
          ) : null}
          {googleSaveUrl ? (
            <a
              href={googleSaveUrl}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-input bg-card px-4 py-3 text-sm font-semibold text-foreground transition-all hover:bg-muted"
            >
              Save to Google Wallet
            </a>
          ) : null}
          <p className="mt-1 text-xs text-muted-foreground">
            Show your wallet card at the counter to collect stamps.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
          Your wallet card is being set up — you&apos;ll be able to add it to
          Apple Wallet or Google Wallet shortly. Show your card at the counter to
          collect stamps.
        </div>
      )}
    </main>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { Button } from "@llw/ui";
import { createClient } from "@/lib/supabase/server";
import { PrintButton } from "@/components/print-button";

export default async function PosterPage({
  params,
}: {
  params: Promise<{ programId: string }>;
}) {
  const { programId } = await params;

  const supabase = await createClient();
  const { data: program } = await supabase
    .from("loyalty_programs")
    .select("*")
    .eq("id", programId)
    .maybeSingle();
  if (!program) notFound();

  const { data: business } = await supabase
    .from("businesses")
    .select("name")
    .eq("id", program.business_id)
    .maybeSingle();

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const joinUrl = `${appUrl}/join/${program.id}`;
  const qr = await QRCode.toDataURL(joinUrl, {
    width: 520,
    margin: 1,
    color: { dark: "#261815", light: "#ffffff" },
  });

  return (
    <div>
      <div className="mb-4 flex items-center justify-between print:hidden">
        <Button asChild variant="outline">
          <Link href={`/dashboard/loyalty-cards/${program.id}`}>Back to card</Link>
        </Button>
        <PrintButton />
      </div>

      <div className="mx-auto max-w-xl rounded-2xl border border-border bg-white p-12 text-center print:border-0">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">
          {business?.name ?? "Our shop"}
        </p>
        <h1 className="mt-3 text-4xl font-bold text-foreground">
          Join our rewards
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Collect {program.stamps_required} stamps → {program.reward_title}
        </p>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={qr}
          alt="Scan to join"
          width={300}
          height={300}
          className="mx-auto my-8"
        />

        <p className="text-xl font-bold text-foreground">
          Scan with your phone camera
        </p>
        <p className="mt-1 text-muted-foreground">
          No app needed — save your card to Apple Wallet or Google Wallet.
        </p>
        <p className="mt-8 text-xs text-muted-foreground">Powered by LoyalLocal</p>
      </div>
    </div>
  );
}

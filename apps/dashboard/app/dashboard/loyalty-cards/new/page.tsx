import Link from "next/link";
import { PageHeader, Button } from "@llw/ui";
import { createClient } from "@/lib/supabase/server";
import { CardBuilder } from "./card-builder";

export default async function NewProgramPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  const supabase = await createClient();
  const { data: business } = await supabase
    .from("businesses")
    .select("name, logo_url")
    .limit(1)
    .maybeSingle();

  return (
    <div>
      <PageHeader
        title="Create a loyalty campaign"
        description="Design your wallet card, set the reward, and launch it with QR codes and customer automations."
        action={
          <Button asChild variant="outline">
            <Link href="/dashboard/loyalty-cards">Cancel</Link>
          </Button>
        }
      />

      {error ? (
        <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <CardBuilder
        businessName={business?.name ?? "Your business"}
        logoUrl={business?.logo_url ?? null}
      />
    </div>
  );
}

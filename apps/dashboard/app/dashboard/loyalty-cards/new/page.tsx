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
        title="New loyalty card"
        description="Pick a template or design your own — it updates live."
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

import Link from "next/link";
import { PageHeader, Button, Card, CardContent } from "@llw/ui";
import { audienceCounts, type AudienceKey } from "@/lib/campaigns";
import { createClient } from "@/lib/supabase/server";
import { getActiveMembership } from "@/lib/business";
import { CampaignComposer } from "./campaign-composer";

export default async function NewCampaignPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  const supabase = await createClient();
  const membership = await getActiveMembership(supabase);

  const emptyCounts: Record<AudienceKey, number> = {
    all_active: 0,
    inactive_21_days: 0,
    close_to_reward: 0,
  };

  const [{ data: business }, counts] = await Promise.all([
    membership
      ? supabase
          .from("businesses")
          .select("name")
          .eq("id", membership.businessId)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    membership
      ? audienceCounts(supabase, membership.businessId)
      : Promise.resolve(emptyCounts),
  ]);

  return (
    <div>
      <PageHeader
        title="Create a customer campaign"
        description="Bring customers back with wallet updates, rewards, and targeted offers."
        action={
          <Button asChild variant="outline">
            <Link href="/dashboard/campaigns">Cancel</Link>
          </Button>
        }
      />

      {error ? (
        <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <Card>
        <CardContent className="p-6 pt-6">
          <CampaignComposer
            businessName={business?.name ?? ""}
            counts={counts}
          />
        </CardContent>
      </Card>
    </div>
  );
}

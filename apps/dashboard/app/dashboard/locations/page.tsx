import { MapPin, Phone, Plus, CheckCircle2, Building2 } from "lucide-react";
import {
  PageHeader,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Input,
  Label,
  Badge,
  EmptyState,
} from "@llw/ui";
import { createClient } from "@/lib/supabase/server";
import { getActiveMembership } from "@/lib/business";
import { getBusinessPlan, countLocations } from "@/lib/plan";
import { createLocation, setLocationActive } from "./actions";

function cityLine(loc: {
  city: string | null;
  province: string | null;
  postal_code: string | null;
}) {
  return [loc.city, loc.province, loc.postal_code].filter(Boolean).join(", ");
}

export default async function LocationsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const { saved, error } = await searchParams;

  const supabase = await createClient();
  const membership = await getActiveMembership(supabase);
  const canEdit =
    membership?.role === "business_owner" ||
    membership?.role === "business_admin";

  const [{ data: locations }, plan, activeCount] = await Promise.all([
    membership
      ? supabase
          .from("locations")
          .select("*")
          .eq("business_id", membership.businessId)
          .order("created_at", { ascending: true })
      : Promise.resolve({ data: [] }),
    membership
      ? getBusinessPlan(supabase, membership.businessId)
      : Promise.resolve(null),
    membership
      ? countLocations(supabase, membership.businessId)
      : Promise.resolve(0),
  ]);

  const rows = locations ?? [];
  const limit = plan?.limits.locations ?? 0;
  const atLimit = plan ? activeCount >= limit : false;
  const usagePct = limit ? Math.min(100, (activeCount / limit) * 100) : 0;

  const stats = [
    { label: "Locations", value: rows.length, icon: <MapPin className="h-4 w-4" /> },
    { label: "Active", value: activeCount, icon: <CheckCircle2 className="h-4 w-4" /> },
    {
      label: "Plan usage",
      value: plan ? `${activeCount}/${limit}` : "—",
      icon: <Building2 className="h-4 w-4" />,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Locations"
        description="Manage the shops where customers earn stamps."
      />

      {saved ? <Banner tone="green">Locations updated.</Banner> : null}
      {error ? <Banner tone="red">{error}</Banner> : null}

      {rows.length > 0 ? (
        <div className="mb-6 grid grid-cols-3 gap-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="flex flex-col gap-1 rounded-2xl border border-border bg-card p-5 shadow-sm"
            >
              <div className="flex items-center gap-2 text-muted-foreground">
                {s.icon}
                <span className="text-xs font-semibold uppercase tracking-wide">
                  {s.label}
                </span>
              </div>
              <p className="font-display text-3xl font-extrabold text-foreground">
                {s.value}
              </p>
            </div>
          ))}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* List */}
        <div className="space-y-4 lg:col-span-2">
          {rows.length === 0 ? (
            <EmptyState
              icon={<MapPin className="h-5 w-5" />}
              title="No locations yet"
              description="Add your first shop so stamps and analytics can be tied to a place."
            />
          ) : (
            rows.map((loc) => (
              <div
                key={loc.id}
                className="flex items-start justify-between gap-4 rounded-3xl border border-border bg-card p-5 shadow-sm transition-all hover:border-primary/40"
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent/15 text-primary">
                    <MapPin className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-semibold text-foreground">{loc.name}</p>
                    {loc.address_line1 ? (
                      <p className="text-sm text-muted-foreground">
                        {loc.address_line1}
                      </p>
                    ) : null}
                    {cityLine(loc) ? (
                      <p className="text-sm text-muted-foreground">
                        {cityLine(loc)}
                      </p>
                    ) : null}
                    {loc.phone ? (
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Phone className="h-3.5 w-3.5" />
                        {loc.phone}
                      </p>
                    ) : null}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge variant={loc.is_active ? "success" : "default"}>
                    {loc.is_active ? "Active" : "Inactive"}
                  </Badge>
                  {canEdit ? (
                    <form action={setLocationActive}>
                      <input type="hidden" name="locationId" value={loc.id} />
                      <input
                        type="hidden"
                        name="active"
                        value={loc.is_active ? "false" : "true"}
                      />
                      <Button type="submit" variant="outline" size="sm">
                        {loc.is_active ? "Deactivate" : "Activate"}
                      </Button>
                    </form>
                  ) : null}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add */}
        {canEdit ? (
          <div>
            <Card className="rounded-3xl">
              <CardHeader>
                <CardTitle>Add a location</CardTitle>
                <CardDescription>
                  {plan
                    ? `${activeCount} of ${limit} used on your ${plan.planKey} plan.`
                    : "Add a shop."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {plan ? (
                  <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-muted">
                    <span
                      className="block h-full rounded-full bg-primary transition-all"
                      style={{ width: `${usagePct}%` }}
                    />
                  </div>
                ) : null}
                {atLimit ? (
                  <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
                    You&apos;ve reached your plan&apos;s location limit. Upgrade
                    in Billing to add more.
                  </p>
                ) : (
                  <form action={createLocation} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="name">Location name</Label>
                      <Input id="name" name="name" placeholder="Main Street" required />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="addressLine1">Address</Label>
                      <Input id="addressLine1" name="addressLine1" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="city">City</Label>
                        <Input id="city" name="city" />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="province">Province</Label>
                        <Input id="province" name="province" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="postalCode">Postal code</Label>
                        <Input id="postalCode" name="postalCode" />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="phone">Phone</Label>
                        <Input id="phone" name="phone" />
                      </div>
                    </div>
                    <Button type="submit" className="w-full">
                      <Plus className="h-4 w-4" />
                      Add location
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Banner({
  tone,
  children,
}: {
  tone: "green" | "red";
  children: React.ReactNode;
}) {
  const cls =
    tone === "green" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700";
  return <p className={`mb-4 rounded-xl px-4 py-3 text-sm ${cls}`}>{children}</p>;
}

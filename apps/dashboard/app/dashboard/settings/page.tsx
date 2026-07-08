import { Building2, ImageIcon, Store, Star, Gift } from "lucide-react";
import { Button, Input, Label } from "@llw/ui";
import { createClient } from "@/lib/supabase/server";
import { getActiveMembership } from "@/lib/business";
import { updateBusinessProfile, uploadLogo } from "./actions";
import { BrandColorField } from "./brand-color-field";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; logo?: string; error?: string }>;
}) {
  const { saved, logo, error } = await searchParams;

  const supabase = await createClient();
  const membership = await getActiveMembership(supabase);
  const { data: business } = membership
    ? await supabase
        .from("businesses")
        .select("*")
        .eq("id", membership.businessId)
        .maybeSingle()
    : { data: null };

  const canEdit =
    membership?.role === "business_owner" ||
    membership?.role === "business_admin";

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
          Settings
        </h1>
        <p className="mt-1 text-muted-foreground">
          Your business profile and branding.
        </p>
      </div>

      {saved ? (
        <Banner tone="green">Profile saved.</Banner>
      ) : logo ? (
        <Banner tone="green">Logo updated.</Banner>
      ) : error ? (
        <Banner tone="red">{error}</Banner>
      ) : null}

      {!canEdit ? (
        <p className="mb-4 text-sm text-muted-foreground">
          Only owners and admins can edit these settings.
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile */}
        <div className="lg:col-span-2">
          <section className="rounded-3xl border border-border bg-card p-7 shadow-sm">
            <SectionHeader
              icon={<Store className="h-5 w-5" />}
              title="Business profile"
              description="This appears on your loyalty cards and enrollment page."
            />
            <form action={updateBusinessProfile} className="mt-6 space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="name">Business name</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={business?.name ?? ""}
                  disabled={!canEdit}
                  required
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="industry">Industry</Label>
                  <Input
                    id="industry"
                    name="industry"
                    defaultValue={business?.industry ?? ""}
                    disabled={!canEdit}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    defaultValue={business?.phone ?? ""}
                    disabled={!canEdit}
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    name="website"
                    placeholder="https://…"
                    defaultValue={business?.website ?? ""}
                    disabled={!canEdit}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Contact email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue={business?.email ?? ""}
                    disabled={!canEdit}
                  />
                </div>
              </div>

              <BrandColorField
                defaultValue={business?.brand_color ?? "#ae3115"}
                disabled={!canEdit}
              />

              <div className="rounded-2xl border border-border bg-muted/40 p-5">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-primary" />
                  <p className="text-sm font-semibold text-foreground">
                    Reviews
                  </p>
                </div>
                <div className="mt-3 space-y-1.5">
                  <Label htmlFor="googleReviewUrl">
                    Google review link{" "}
                    <span className="text-muted-foreground">(optional)</span>
                  </Label>
                  <Input
                    id="googleReviewUrl"
                    name="googleReviewUrl"
                    type="url"
                    placeholder="https://g.page/r/…/review"
                    defaultValue={business?.google_review_url ?? ""}
                    disabled={!canEdit}
                  />
                  <p className="text-xs text-muted-foreground">
                    After a customer redeems a reward, we send a friendly,
                    non-incentivized invite to review you here.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-muted/40 p-5">
                <div className="flex items-center gap-2">
                  <Gift className="h-4 w-4 text-primary" />
                  <p className="text-sm font-semibold text-foreground">
                    Welcome bonus
                  </p>
                </div>
                <div className="mt-3 space-y-1.5">
                  <Label htmlFor="welcomeBonusStamps">
                    Welcome bonus stamps
                  </Label>
                  <Input
                    id="welcomeBonusStamps"
                    name="welcomeBonusStamps"
                    type="number"
                    min={0}
                    max={5}
                    defaultValue={business?.welcome_bonus_stamps ?? 0}
                    disabled={!canEdit}
                    className="max-w-[120px]"
                  />
                  <p className="text-xs text-muted-foreground">
                    Give new customers a head start — stamps added automatically
                    when they enroll. 0 turns it off.
                  </p>
                </div>
              </div>

              {canEdit ? <Button type="submit">Save profile</Button> : null}
            </form>
          </section>
        </div>

        {/* Logo */}
        <div>
          <section className="rounded-3xl border border-border bg-card p-7 shadow-sm">
            <SectionHeader
              icon={<ImageIcon className="h-5 w-5" />}
              title="Logo"
              description="Shows on your Google Wallet card. Square PNG works best, under 2MB."
            />
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-center rounded-2xl border border-dashed border-border bg-muted/40 p-6">
                {business?.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={business.logo_url}
                    alt="Business logo"
                    className="h-28 w-28 rounded-2xl object-cover shadow-sm"
                  />
                ) : (
                  <div className="flex h-28 w-28 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                    <Building2 className="h-9 w-9" />
                  </div>
                )}
              </div>
              {canEdit ? (
                <form action={uploadLogo} className="space-y-3">
                  <input
                    type="file"
                    name="logo"
                    accept="image/*"
                    required
                    className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary-foreground hover:file:brightness-110"
                  />
                  <Button type="submit" variant="outline" className="w-full">
                    Upload logo
                  </Button>
                </form>
              ) : null}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent/15 text-primary">
        {icon}
      </span>
      <div>
        <h2 className="font-display text-lg font-bold text-foreground">
          {title}
        </h2>
        <p className="text-sm text-muted-foreground">{description}</p>
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
    tone === "green"
      ? "bg-green-50 text-green-700"
      : "bg-red-50 text-red-700";
  return (
    <p className={`mb-4 rounded-xl px-4 py-3 text-sm ${cls}`}>{children}</p>
  );
}

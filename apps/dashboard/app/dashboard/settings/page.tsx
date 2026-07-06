import { Building2 } from "lucide-react";
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
} from "@llw/ui";
import { createClient } from "@/lib/supabase/server";
import { getActiveMembership } from "@/lib/business";
import { updateBusinessProfile, uploadLogo } from "./actions";

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
      <PageHeader
        title="Settings"
        description="Your business profile and branding."
      />

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
          <Card>
            <CardHeader>
              <CardTitle>Business profile</CardTitle>
              <CardDescription>
                This appears on your loyalty cards and enrollment page.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={updateBusinessProfile} className="space-y-4">
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
                <div className="space-y-1.5">
                  <Label htmlFor="brandColor">Brand color</Label>
                  <input
                    id="brandColor"
                    name="brandColor"
                    type="color"
                    defaultValue={business?.brand_color ?? "#ae3115"}
                    disabled={!canEdit}
                    className="h-10 w-16 cursor-pointer rounded-lg border border-input bg-card"
                  />
                </div>

                <div className="space-y-1.5">
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
                {canEdit ? (
                  <Button type="submit">Save profile</Button>
                ) : null}
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Logo */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Logo</CardTitle>
              <CardDescription>
                Shows on your Google Wallet card. Square PNG works best, under 2MB.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center rounded-2xl border border-dashed border-border bg-muted/40 p-6">
                {business?.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={business.logo_url}
                    alt="Business logo"
                    className="h-24 w-24 rounded-xl object-cover"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                    <Building2 className="h-8 w-8" />
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
            </CardContent>
          </Card>
        </div>
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

import { Users, Mail } from "lucide-react";
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
  type BadgeProps,
} from "@llw/ui";
import { ASSIGNABLE_ROLES } from "@/lib/validation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getActiveMembership } from "@/lib/business";
import { getBusinessPlan, countStaff } from "@/lib/plan";
import { inviteStaff, updateStaffRole, setStaffActive } from "./actions";

const SELECT_CLASS =
  "flex h-10 w-full rounded-xl border border-input bg-card px-3 py-2 text-sm text-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30";

const ROLE_LABEL: Record<string, string> = {
  business_owner: "Owner",
  business_admin: "Admin",
  manager: "Manager",
  staff: "Staff",
  platform_admin: "Platform admin",
};

const ROLE_VARIANT: Record<string, BadgeProps["variant"]> = {
  business_owner: "success",
  business_admin: "default",
  manager: "warning",
  staff: "default",
};

const AVATAR_COLORS = ["#ae3115", "#c0421e", "#b45309", "#0f766e", "#be185d", "#7c2d12"];
function avatarColor(seed: string) {
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

export default async function StaffPage({
  searchParams,
}: {
  searchParams: Promise<{ invited?: string; saved?: string; error?: string }>;
}) {
  const { invited, saved, error } = await searchParams;

  const supabase = await createClient();
  const membership = await getActiveMembership(supabase);
  const canEdit =
    membership?.role === "business_owner" ||
    membership?.role === "business_admin";

  const [{ data: members }, { data: locations }, plan, activeCount] =
    await Promise.all([
      membership
        ? supabase
            .from("staff_members")
            .select("id, user_id, role, is_active, location_id, locations(name)")
            .eq("business_id", membership.businessId)
            .order("created_at", { ascending: true })
        : Promise.resolve({ data: [] }),
      membership
        ? supabase
            .from("locations")
            .select("id, name")
            .eq("business_id", membership.businessId)
            .eq("is_active", true)
        : Promise.resolve({ data: [] }),
      membership ? getBusinessPlan(supabase, membership.businessId) : Promise.resolve(null),
      membership ? countStaff(supabase, membership.businessId) : Promise.resolve(0),
    ]);

  const rows = members ?? [];

  // Resolve emails for the member list (admin — service role).
  const emailById = new Map<string, string>();
  if (rows.length) {
    const admin = createAdminClient();
    const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    for (const u of list?.users ?? []) {
      if (u.email) emailById.set(u.id, u.email);
    }
  }

  const atLimit = plan ? activeCount >= plan.limits.staff : false;

  return (
    <div>
      <PageHeader
        title="Staff"
        description="Invite team members and manage their roles."
      />

      {invited ? (
        <Banner tone="green">Invite sent. They&apos;ll get an email to finish setting up.</Banner>
      ) : saved ? (
        <Banner tone="green">Team updated.</Banner>
      ) : error ? (
        <Banner tone="red">{error}</Banner>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Team list */}
        <div className="space-y-4 lg:col-span-2">
          {rows.map((member) => {
            const email = emailById.get(member.user_id) ?? "Pending invite";
            const isOwner = member.role === "business_owner";
            const isSelf = member.user_id === membership?.userId;
            const locName =
              (member.locations as { name: string } | null)?.name ?? "All locations";
            return (
              <Card key={member.id}>
                <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
                  <div className="flex items-center gap-3">
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                      style={{ backgroundColor: avatarColor(email) }}
                    >
                      {email.slice(0, 2).toUpperCase()}
                    </span>
                    <div>
                      <p className="font-medium text-foreground">{email}</p>
                      <p className="text-xs text-muted-foreground">{locName}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge variant={ROLE_VARIANT[member.role] ?? "default"}>
                      {ROLE_LABEL[member.role] ?? member.role}
                    </Badge>
                    {!member.is_active ? (
                      <Badge variant="destructive">Inactive</Badge>
                    ) : null}

                    {canEdit && !isOwner ? (
                      <div className="flex items-center gap-2">
                        <form action={updateStaffRole} className="flex items-center gap-2">
                          <input type="hidden" name="staffMemberId" value={member.id} />
                          <select name="role" defaultValue={member.role} className={SELECT_CLASS} style={{ width: 120 }}>
                            {ASSIGNABLE_ROLES.map((r) => (
                              <option key={r} value={r}>
                                {ROLE_LABEL[r]}
                              </option>
                            ))}
                          </select>
                          <Button type="submit" variant="outline" size="sm">
                            Save
                          </Button>
                        </form>
                        {!isSelf ? (
                          <form action={setStaffActive}>
                            <input type="hidden" name="staffMemberId" value={member.id} />
                            <input
                              type="hidden"
                              name="active"
                              value={member.is_active ? "false" : "true"}
                            />
                            <Button type="submit" variant="outline" size="sm">
                              {member.is_active ? "Deactivate" : "Activate"}
                            </Button>
                          </form>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Invite */}
        {canEdit ? (
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Invite a team member</CardTitle>
                <CardDescription>
                  {plan
                    ? `${activeCount} of ${plan.limits.staff} used on your ${plan.planKey} plan.`
                    : "Add someone to your team."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {atLimit ? (
                  <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
                    You&apos;ve reached your plan&apos;s team limit. Upgrade in
                    Billing to add more.
                  </p>
                ) : (
                  <form action={inviteStaff} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="teammate@shop.com"
                          className="pl-9"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="role">Role</Label>
                      <select id="role" name="role" defaultValue="staff" className={SELECT_CLASS}>
                        {ASSIGNABLE_ROLES.map((r) => (
                          <option key={r} value={r}>
                            {ROLE_LABEL[r]}
                          </option>
                        ))}
                      </select>
                    </div>
                    {locations && locations.length > 0 ? (
                      <div className="space-y-1.5">
                        <Label htmlFor="locationId">Location (optional)</Label>
                        <select id="locationId" name="locationId" defaultValue="" className={SELECT_CLASS}>
                          <option value="">All locations</option>
                          {locations.map((l) => (
                            <option key={l.id} value={l.id}>
                              {l.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : null}
                    <Button type="submit" className="w-full">
                      <Users className="h-4 w-4" />
                      Send invite
                    </Button>
                  </form>
                )}
                <p className="mt-4 text-xs text-muted-foreground">
                  Staff scan cards and add stamps. Admins can also manage cards,
                  staff, and settings.
                </p>
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

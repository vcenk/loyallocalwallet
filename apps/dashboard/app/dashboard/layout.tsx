import { redirect } from "next/navigation";
import { Bell } from "lucide-react";
import { Button } from "@llw/ui";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/sidebar";
import { signOut } from "./actions";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: membership } = await supabase
    .from("staff_members")
    .select("business_id, role")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .limit(1)
    .maybeSingle();
  if (!membership) redirect("/onboarding");

  const { data: business } = await supabase
    .from("businesses")
    .select("name")
    .eq("id", membership.business_id)
    .maybeSingle();

  const businessName = business?.name ?? "Your business";
  const initial = businessName.charAt(0).toUpperCase();

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-border bg-background px-6 print:hidden">
          <div className="leading-tight">
            <p className="text-sm font-semibold text-foreground">
              {businessName}
            </p>
            <p className="text-xs capitalize text-muted-foreground">
              {membership.role.replace("_", " ")}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              aria-label="Notifications"
              className="text-muted-foreground transition-colors hover:text-primary"
            >
              <Bell className="h-5 w-5" />
            </button>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/20 text-sm font-bold text-primary">
              {initial}
            </div>
            <form action={signOut}>
              <Button type="submit" variant="outline" size="sm">
                Sign out
              </Button>
            </form>
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
          {children}
        </main>
      </div>
    </div>
  );
}

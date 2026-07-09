import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Scanner } from "./scanner";

// Full-screen mobile scanner for staff. Lives outside the /dashboard layout so
// there's no sidebar — staff just open this on their phone. Any active staff
// member (staff/manager/admin/owner) can use it.
export default async function ScanPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: membership } = await supabase
    .from("staff_members")
    .select("id")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .limit(1)
    .maybeSingle();
  if (!membership) redirect("/onboarding");

  return <Scanner />;
}

import { redirect } from "next/navigation";
import { Button, Input, Label, Card, CardContent } from "@llw/ui";
import { createClient } from "@/lib/supabase/server";
import { createBusiness } from "./actions";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: membership } = await supabase
    .from("staff_members")
    .select("business_id")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .limit(1)
    .maybeSingle();
  if (membership) redirect("/dashboard");

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-foreground">
            Set up your business
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            This creates your account&apos;s first business. You&apos;ll be the
            owner.
          </p>
        </div>

        <Card>
          <CardContent className="p-6 pt-6">
            {error ? (
              <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            ) : null}

            <form action={createBusiness} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Business name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  required
                  placeholder="Main Street Cafe"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="industry">
                  Industry{" "}
                  <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Input
                  id="industry"
                  name="industry"
                  type="text"
                  placeholder="cafe"
                />
              </div>

              <Button type="submit" className="w-full">
                Create business
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

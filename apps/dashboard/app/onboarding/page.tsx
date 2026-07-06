import { redirect } from "next/navigation";
import { QrCode, Wallet, Megaphone, Star } from "lucide-react";
import { Button, Input, Label } from "@llw/ui";
import { createClient } from "@/lib/supabase/server";
import { IndustrySelect } from "@/components/industry-select";
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

  const fullName =
    (user.user_metadata?.full_name as string) ||
    (user.user_metadata?.name as string) ||
    "";
  const firstName = fullName.split(" ")[0];

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      {/* Left — warm welcome panel */}
      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-[#c0421e] to-[#8f2712] p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(50% 40% at 80% 10%, rgba(255,138,110,0.5), transparent 60%)",
          }}
        />
        <div className="relative z-10">
          <span className="font-display text-2xl font-extrabold">LoyalLocal</span>
        </div>

        <div className="relative z-10 max-w-sm">
          <h2 className="font-display text-4xl font-bold leading-tight">
            {firstName ? `Welcome, ${firstName}.` : "Welcome aboard."}
            <br />
            Let&apos;s set up your shop.
          </h2>
          <ul className="mt-8 space-y-4 text-white/90">
            {[
              { icon: <Wallet className="h-4 w-4" />, t: "Create a branded wallet card" },
              { icon: <QrCode className="h-4 w-4" />, t: "Enroll customers with a QR code" },
              { icon: <Megaphone className="h-4 w-4" />, t: "Bring them back with smart offers" },
            ].map((b) => (
              <li key={b.t} className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15">
                  {b.icon}
                </span>
                {b.t}
              </li>
            ))}
          </ul>
        </div>

        {/* Floating card mockup */}
        <div className="relative z-10 w-64 -rotate-3 rounded-2xl bg-white/10 p-5 backdrop-blur-sm ring-1 ring-white/20">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-white/70">
              Your shop
            </span>
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-bold text-primary">
              ★
            </span>
          </div>
          <p className="mt-3 font-display text-lg font-bold">Coffee Rewards</p>
          <div className="mt-3 flex gap-1.5">
            {Array.from({ length: 8 }).map((_, i) => (
              <span
                key={i}
                className="flex h-4 w-4 items-center justify-center rounded-full border border-white/60"
                style={{ background: i < 5 ? "#fff" : "transparent" }}
              >
                {i < 5 ? <Star className="h-2 w-2 text-primary" /> : null}
              </span>
            ))}
          </div>
        </div>
      </aside>

      {/* Right — form */}
      <div className="flex items-center justify-center bg-background px-6 py-12">
        <div className="w-full max-w-sm">
          <h1 className="font-display text-3xl font-bold text-foreground">
            Set up your business
          </h1>
          <p className="mt-2 text-muted-foreground">
            This creates your first business — you&apos;ll be the owner.
          </p>

          {error ? (
            <p className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          <form action={createBusiness} className="mt-8 space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="name">Business name</Label>
              <Input
                id="name"
                name="name"
                required
                placeholder="Main Street Cafe"
                className="h-11"
              />
            </div>

            <div className="space-y-1.5">
              <Label>
                Industry <span className="text-muted-foreground">(optional)</span>
              </Label>
              <IndustrySelect />
            </div>

            <Button type="submit" size="lg" className="w-full">
              Create business
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            You can change any of this later in Settings.
          </p>
        </div>
      </div>
    </main>
  );
}

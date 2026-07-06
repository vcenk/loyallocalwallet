import Link from "next/link";
import { redirect } from "next/navigation";
import { Wallet, QrCode, Megaphone, Star } from "lucide-react";
import { Button, Input, Label } from "@llw/ui";
import { createClient } from "@/lib/supabase/server";
import { GoogleButton } from "@/components/google-button";
import { signIn, signUp } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      {/* Left — brand panel */}
      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-[#c0421e] to-[#8f2712] p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(50% 40% at 80% 10%, rgba(255,138,110,0.5), transparent 60%)",
          }}
        />
        <Link href="/" className="relative z-10 font-display text-2xl font-extrabold">
          LoyalLocal
        </Link>

        <div className="relative z-10 max-w-sm">
          <h2 className="font-display text-4xl font-bold leading-tight">
            Rewards that live in the wallet they already have.
          </h2>
          <ul className="mt-8 space-y-4 text-white/90">
            {[
              { icon: <Wallet className="h-4 w-4" />, t: "Apple & Google Wallet cards" },
              { icon: <QrCode className="h-4 w-4" />, t: "Enroll customers by QR — no app" },
              { icon: <Megaphone className="h-4 w-4" />, t: "Win back the ones who fade away" },
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

        <div className="relative z-10 w-64 -rotate-3 rounded-2xl bg-white/10 p-5 backdrop-blur-sm ring-1 ring-white/20">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-white/70">
              Main Street Cafe
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
                style={{ background: i < 6 ? "#fff" : "transparent" }}
              >
                {i < 6 ? <Star className="h-2 w-2 text-primary" /> : null}
              </span>
            ))}
          </div>
        </div>
      </aside>

      {/* Right — auth form */}
      <div className="flex items-center justify-center bg-background px-6 py-12">
        <div className="w-full max-w-sm">
          <h1 className="font-display text-3xl font-bold text-foreground">
            Welcome back
          </h1>
          <p className="mt-2 text-muted-foreground">
            Log in or create your shop account.
          </p>

          {error ? (
            <p className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          ) : null}
          {message ? (
            <p className="mt-6 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">
              {message}
            </p>
          ) : null}

          <div className="mt-8">
            <GoogleButton />
            <div className="my-5 flex items-center gap-3 text-xs font-medium text-muted-foreground">
              <div className="h-px flex-1 bg-border" />
              or
              <div className="h-px flex-1 bg-border" />
            </div>

            <form className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="fullName">
                  Name{" "}
                  <span className="text-muted-foreground">(new accounts)</span>
                </Label>
                <Input id="fullName" name="fullName" type="text" autoComplete="name" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required autoComplete="email" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" required autoComplete="current-password" />
              </div>
              <div className="flex gap-3 pt-1">
                <Button formAction={signIn} className="flex-1">
                  Sign in
                </Button>
                <Button formAction={signUp} variant="outline" className="flex-1">
                  Create account
                </Button>
              </div>
            </form>
          </div>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            <Link href="/terms" className="hover:underline">
              Terms
            </Link>{" "}
            ·{" "}
            <Link href="/privacy" className="hover:underline">
              Privacy
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";
import { Button, Input, Label, Card, CardContent } from "@llw/ui";
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
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-foreground">
            Local Loyalty Wallet
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in to manage your loyalty cards and customers.
          </p>
        </div>

        <Card>
          <CardContent className="p-6 pt-6">
            {error ? (
              <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            ) : null}
            {message ? (
              <p className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
                {message}
              </p>
            ) : null}

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
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  autoComplete="name"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button formAction={signIn} className="flex-1">
                  Sign in
                </Button>
                <Button
                  formAction={signUp}
                  variant="outline"
                  className="flex-1"
                >
                  Create account
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          <Link href="/terms" className="hover:underline">
            Terms
          </Link>{" "}
          ·{" "}
          <Link href="/privacy" className="hover:underline">
            Privacy
          </Link>
        </p>
      </div>
    </main>
  );
}

"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signInSchema, signUpSchema } from "@/lib/validation";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function signIn(formData: FormData) {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    redirect(`/login?error=${encodeURIComponent(parsed.error.issues[0].message)}`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/dashboard");
}

export async function signUp(formData: FormData) {
  const parsed = signUpSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    fullName: formData.get("fullName") || undefined,
  });
  if (!parsed.success) {
    redirect(`/login?error=${encodeURIComponent(parsed.error.issues[0].message)}`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName ?? null },
      emailRedirectTo: `${APP_URL}/auth/confirm`,
    },
  });
  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  // With email confirmations OFF, signUp returns a session -> go straight in.
  if (data.session) {
    redirect("/dashboard");
  }

  redirect(
    `/login?message=${encodeURIComponent(
      "Check your email to confirm your account, then sign in.",
    )}`,
  );
}

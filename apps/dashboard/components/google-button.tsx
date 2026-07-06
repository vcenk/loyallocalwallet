"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function GoogleButton() {
  const [busy, setBusy] = useState(false);

  async function signInWithGoogle() {
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setBusy(false);
    // On success the browser is redirected to Google.
  }

  return (
    <button
      type="button"
      onClick={signInWithGoogle}
      disabled={busy}
      className="flex w-full items-center justify-center gap-3 rounded-xl border border-input bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-60"
    >
      <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden>
        <path
          fill="#EA4335"
          d="M12 10.2v3.9h5.5c-.24 1.4-1.65 4.1-5.5 4.1-3.31 0-6-2.74-6-6.1s2.69-6.1 6-6.1c1.88 0 3.14.8 3.86 1.49l2.63-2.53C16.9 3.2 14.7 2.2 12 2.2 6.98 2.2 2.9 6.28 2.9 11.3S6.98 20.4 12 20.4c5.5 0 9.1-3.86 9.1-9.3 0-.62-.07-1.1-.16-1.58H12z"
        />
      </svg>
      {busy ? "Redirecting…" : "Continue with Google"}
    </button>
  );
}

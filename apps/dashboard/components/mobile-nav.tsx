"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { SidebarContent } from "./sidebar";

// Hamburger + slide-in drawer for mobile (the desktop sidebar is md+ only).
export function MobileNav({
  businessName,
  planLabel,
}: {
  businessName?: string;
  planLabel?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="flex h-10 w-10 items-center justify-center rounded-xl text-foreground transition-colors hover:bg-muted"
      >
        <Menu className="h-6 w-6" />
      </button>

      {open ? (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="absolute left-0 top-0 flex h-full w-72 max-w-[85%] flex-col overflow-y-auto border-r border-border bg-background px-4 py-6 shadow-xl">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="absolute right-3 top-4 flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted"
            >
              <X className="h-5 w-5" />
            </button>
            <SidebarContent
              businessName={businessName}
              planLabel={planLabel}
              onNavigate={() => setOpen(false)}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

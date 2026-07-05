"use client";

import { Button } from "@llw/ui";

export function PrintButton() {
  return (
    <Button type="button" onClick={() => window.print()}>
      Print poster
    </Button>
  );
}

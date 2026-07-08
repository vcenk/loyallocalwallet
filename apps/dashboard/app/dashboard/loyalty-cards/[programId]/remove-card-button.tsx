"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@llw/ui";
import { deleteProgram } from "../actions";

export function RemoveCardButton({ programId }: { programId: string }) {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <Button
        type="button"
        variant="outline"
        onClick={() => setConfirming(true)}
        className="border-red-200 text-red-600 hover:bg-red-50"
      >
        <Trash2 className="h-4 w-4" />
        Remove card
      </Button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-sm font-medium text-foreground">
        Remove this card? This can&apos;t be undone.
      </span>
      <form action={deleteProgram}>
        <input type="hidden" name="programId" value={programId} />
        <Button
          type="submit"
          className="bg-red-600 text-white hover:bg-red-700"
        >
          Yes, remove
        </Button>
      </form>
      <Button
        type="button"
        variant="outline"
        onClick={() => setConfirming(false)}
      >
        Cancel
      </Button>
    </div>
  );
}

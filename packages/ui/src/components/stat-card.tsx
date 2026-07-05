import * as React from "react";
import { Card, CardContent } from "./card";
import { cn } from "../lib/utils";

export interface StatCardProps {
  label: string;
  value: React.ReactNode;
  hint?: string;
  className?: string;
}

export function StatCard({ label, value, hint, className }: StatCardProps) {
  return (
    <Card className={cn("", className)}>
      <CardContent className="p-5 pt-5">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-semibold text-foreground">{value}</p>
        {hint ? (
          <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}

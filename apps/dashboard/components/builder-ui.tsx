"use client";

import { type ReactNode } from "react";
import { Check, AlertCircle } from "lucide-react";

// Shared premium building blocks for the loyalty-card and campaign builders.

export function StepHeader({
  steps,
  current,
}: {
  steps: string[];
  current: number;
}) {
  return (
    <div className="mb-7 flex flex-wrap items-center gap-x-2 gap-y-2">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center gap-2">
          <span
            className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold transition-colors ${
              i === current
                ? "bg-primary text-primary-foreground"
                : i < current
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground"
            }`}
          >
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] ${
                i <= current ? "bg-white/25" : "bg-background"
              }`}
            >
              {i < current ? <Check className="h-3 w-3" /> : i + 1}
            </span>
            {s}
          </span>
          {i < steps.length - 1 ? (
            <span aria-hidden className="h-px w-5 bg-border" />
          ) : null}
        </div>
      ))}
    </div>
  );
}

export function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-border bg-card p-6 shadow-[0_1px_2px_rgba(38,24,21,0.04)]">
      <div className="mb-5">
        <h2 className="font-display text-lg font-bold text-foreground">
          {title}
        </h2>
        {description ? (
          <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

// Premium selectable card — used for templates, campaign goals, audiences.
export function SelectableCard({
  icon,
  title,
  description,
  tag,
  meta,
  selected,
  disabled,
  onClick,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  tag?: string;
  meta?: string;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={!!selected}
      className={`group relative flex h-full flex-col gap-2 rounded-2xl border p-4 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
        selected
          ? "border-primary bg-primary/5 shadow-[0_2px_10px_rgba(174,49,21,0.10)]"
          : "border-border bg-card hover:border-primary/40 hover:shadow-sm"
      } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
    >
      {selected ? (
        <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Check className="h-3 w-3" strokeWidth={3} />
        </span>
      ) : null}
      {icon ? (
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          {icon}
        </span>
      ) : null}
      <span className="pr-6 font-semibold text-foreground">{title}</span>
      {description ? (
        <span className="text-sm leading-snug text-muted-foreground">
          {description}
        </span>
      ) : null}
      <span className="mt-auto flex items-center gap-2 pt-1">
        {tag ? (
          <span className="inline-flex w-fit rounded-full bg-accent/15 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
            {tag}
          </span>
        ) : null}
        {meta ? (
          <span className="text-[11px] font-medium text-muted-foreground">
            {meta}
          </span>
        ) : null}
      </span>
    </button>
  );
}

export function PreviewTabs({
  tabs,
  active,
  onChange,
}: {
  tabs: string[];
  active: string;
  onChange: (t: string) => void;
}) {
  return (
    <div className="flex gap-1 rounded-xl border border-border bg-muted/60 p-1">
      {tabs.map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => onChange(t)}
          className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-semibold transition-colors ${
            active === t
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {t}
        </button>
      ))}
    </div>
  );
}

export function ReadinessChecklist({
  items,
}: {
  items: { label: string; state: "done" | "todo" | "warn" }[];
}) {
  return (
    <ul className="space-y-2">
      {items.map((it) => (
        <li key={it.label} className="flex items-center gap-2 text-sm">
          {it.state === "done" ? (
            <Check className="h-4 w-4 text-[color:var(--success)]" strokeWidth={3} />
          ) : it.state === "warn" ? (
            <AlertCircle className="h-4 w-4 text-amber-500" />
          ) : (
            <span className="h-4 w-4 rounded-full border border-muted-foreground/40" />
          )}
          <span
            className={
              it.state === "done" ? "text-foreground" : "text-muted-foreground"
            }
          >
            {it.label}
          </span>
        </li>
      ))}
    </ul>
  );
}

// Small clickable suggestion pill (fills a field on click).
export function SuggestionPill({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border border-border bg-card px-3 py-1.5 text-left text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-primary/5"
    >
      {label}
    </button>
  );
}

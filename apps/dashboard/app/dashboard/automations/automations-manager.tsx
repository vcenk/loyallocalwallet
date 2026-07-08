"use client";

import { useState } from "react";
import {
  Zap,
  Sparkles,
  HeartHandshake,
  Cake,
  Clock,
  ChevronDown,
  Plus,
  Check,
  type LucideIcon,
} from "lucide-react";
import { Button, Input, Label, Badge } from "@llw/ui";
import { saveAutomation } from "./actions";

export interface AutomationItem {
  key: "welcome" | "almost_there" | "win_back" | "birthday";
  name: string;
  description: string;
  timing: "Instant" | "Daily";
  hasThreshold: boolean;
  title: string;
  body: string;
  thresholdDays: number;
  enabled: boolean;
}

const ICONS: Record<AutomationItem["key"], LucideIcon> = {
  welcome: Sparkles,
  almost_there: Zap,
  win_back: HeartHandshake,
  birthday: Cake,
};

const BODY_CLASS =
  "flex w-full rounded-xl border border-input bg-card px-3 py-2 text-sm text-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30";

export function AutomationsManager({
  automations,
  canEdit,
  titleMax,
  bodyMax,
}: {
  automations: AutomationItem[];
  canEdit: boolean;
  titleMax: number;
  bodyMax: number;
}) {
  // Keys the user just added from the picker this session (disabled in the DB
  // but promoted into the active list, expanded and pre-enabled to configure).
  const [added, setAdded] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [showPicker, setShowPicker] = useState(false);

  const isActive = (a: AutomationItem) => a.enabled || added.has(a.key);
  const active = automations.filter(isActive);
  const available = automations.filter((a) => !isActive(a));

  const toggle = (key: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const add = (key: string) => {
    setAdded((prev) => new Set(prev).add(key));
    setExpanded((prev) => new Set(prev).add(key));
    setShowPicker(false);
  };

  return (
    <div className="space-y-5">
      {active.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-card p-10 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/15 text-primary">
            <Zap className="h-6 w-6" />
          </span>
          <p className="mt-3 font-semibold text-foreground">
            No automations running yet
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Add one below — it&apos;ll bring customers back for you on autopilot.
          </p>
        </div>
      ) : (
        active.map((a) => {
          const Icon = ICONS[a.key];
          const open = expanded.has(a.key);
          const justAdded = added.has(a.key);
          return (
            <div
              key={a.key}
              className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm"
            >
              <form action={saveAutomation}>
                <input type="hidden" name="key" value={a.key} />

                <button
                  type="button"
                  onClick={() => toggle(a.key)}
                  className="flex w-full items-center gap-3 p-6 text-left transition-colors hover:bg-muted/40"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent/15 text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-foreground">{a.name}</p>
                      <Badge variant="default">
                        <Clock className="mr-1 h-3 w-3" />
                        {a.timing}
                      </Badge>
                      {a.enabled ? (
                        <Badge variant="success">On</Badge>
                      ) : (
                        <Badge variant="warning">Off</Badge>
                      )}
                    </div>
                    <p className="mt-0.5 truncate text-sm text-muted-foreground">
                      {a.description}
                    </p>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
                  />
                </button>

                {open ? (
                  <div className="space-y-4 border-t border-border p-6">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        name="enabled"
                        defaultChecked={a.enabled || justAdded}
                        disabled={!canEdit}
                        className="h-5 w-5 rounded border-input accent-[color:var(--primary)]"
                      />
                      <span className="font-medium text-foreground">Enabled</span>
                      <span className="text-muted-foreground">
                        — turn this automation on
                      </span>
                    </label>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label htmlFor={`${a.key}-title`}>
                          Title{" "}
                          <span className="text-muted-foreground">
                            (max {titleMax})
                          </span>
                        </Label>
                        <Input
                          id={`${a.key}-title`}
                          name="title"
                          defaultValue={a.title}
                          maxLength={titleMax}
                          disabled={!canEdit}
                          required
                        />
                      </div>
                      {a.hasThreshold ? (
                        <div className="space-y-1.5">
                          <Label htmlFor={`${a.key}-threshold`}>
                            Days inactive before sending
                          </Label>
                          <Input
                            id={`${a.key}-threshold`}
                            name="thresholdDays"
                            type="number"
                            min={1}
                            max={365}
                            defaultValue={a.thresholdDays}
                            disabled={!canEdit}
                          />
                        </div>
                      ) : null}
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor={`${a.key}-body`}>
                        Message{" "}
                        <span className="text-muted-foreground">
                          (max {bodyMax})
                        </span>
                      </Label>
                      <textarea
                        id={`${a.key}-body`}
                        name="body"
                        defaultValue={a.body}
                        maxLength={bodyMax}
                        rows={2}
                        disabled={!canEdit}
                        required
                        className={BODY_CLASS}
                      />
                    </div>

                    {canEdit ? <Button type="submit">Save</Button> : null}
                  </div>
                ) : null}
              </form>
            </div>
          );
        })
      )}

      {/* Add automation */}
      {canEdit && available.length > 0 ? (
        <div>
          {showPicker ? (
            <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <p className="font-semibold text-foreground">
                  Choose an automation to add
                </p>
                <button
                  type="button"
                  onClick={() => setShowPicker(false)}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {available.map((a) => {
                  const Icon = ICONS[a.key];
                  return (
                    <button
                      key={a.key}
                      type="button"
                      onClick={() => add(a.key)}
                      className="group flex items-start gap-3 rounded-2xl border border-border bg-card p-4 text-left transition-all hover:border-primary/50 hover:shadow-sm"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-primary">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-foreground">{a.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {a.description}
                        </p>
                      </div>
                      <span className="mt-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/15 text-primary opacity-0 transition-opacity group-hover:opacity-100">
                        <Check className="h-3.5 w-3.5" />
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowPicker(true)}
              className="flex w-full items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-border bg-card/50 py-5 text-sm font-semibold text-muted-foreground transition-all hover:border-primary/50 hover:text-primary"
            >
              <Plus className="h-5 w-5" />
              Add automation
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
}

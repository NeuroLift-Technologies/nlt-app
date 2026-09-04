/**
 * Top3View — System 3 TOP3 (Planner Pro + EffortAlign)
 *
 * Daily Top 3 not huge list, defer rest to Later, effort×time check to prevent overcommitment.
 * Addresses decision fatigue (too many choices → freeze) + perfectionism (huge list = never start).
 * Functional MVP v0.1: 3 inputs, localStorage (nlt-mvp:top3 / nlt-mvp:later), effort check >4h warning, check-off.
 * Tailwind + React.
 *
 * @see src/advocates/09-plannerPro/index.ts — getTop3(), effortCheck(), checkTop3Budget()
 */
"use client";

import * as React from "react";
import { checkTop3Budget, effortCheck } from "../advocates/09-plannerPro";
import type { TaskCandidate } from "../advocates/09-plannerPro";

export type Top3Task = TaskCandidate;

export interface Top3ViewProps {
  top3: Top3Task[];
  later: Top3Task[];
  onSelect: (task: Top3Task) => void;
  onDefer: (task: Top3Task) => void;
  /** Optional: toggle done for Top3 task */
  onToggleDone?: (task: Top3Task, done: boolean) => void;
  /** Optional: completed ids (for check-off UI) */
  completedIds?: Set<string>;
  /** Optional: add new task via 3-input form (parent handles persistence) */
  onAddTask?: (task: Top3Task) => void;
}

const STORAGE_TOP3 = "nlt-mvp:top3";
const STORAGE_LATER = "nlt-mvp:later";
const STORAGE_COMPLETED = "nlt-mvp:completedTop3";

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function TaskCard({
  task,
  actionLabel,
  onAction,
  done,
  onToggleDone,
  showEffortWarn,
}: {
  task: Top3Task;
  actionLabel: string;
  onAction: () => void;
  done?: boolean;
  onToggleDone?: (done: boolean) => void;
  showEffortWarn?: string | null;
}) {
  const check = effortCheck(task);
  return (
    <div className={`flex items-start justify-between gap-3 rounded-xl border bg-card p-4 shadow-sm ${done ? "opacity-60 bg-muted/50" : "border-border"}`}>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          {onToggleDone && (
            <input
              type="checkbox"
              checked={!!done}
              onChange={(e) => onToggleDone(e.target.checked)}
              aria-label={`Mark ${task.title} done`}
              className="h-4 w-4 rounded border-input accent-brand-600"
            />
          )}
          <div className={`truncate text-sm font-medium ${done ? "line-through text-muted-foreground" : ""}`}>{task.title}</div>
        </div>
        <div className="mt-1 text-xs text-muted-foreground">
          Effort {task.effort}/5 · {task.time_min}m{typeof task.interest === "number" ? ` · Interest ${task.interest}/10` : ""}
        </div>
        {!check.ok && !done && <div className="mt-1 text-xs text-amber-600">{check.reason}</div>}
        {showEffortWarn && !done && <div className="mt-1 text-xs text-amber-700 font-medium">{showEffortWarn}</div>}
      </div>
      <button
        type="button"
        onClick={onAction}
        disabled={!!done}
        className="shrink-0 rounded-lg border border-border px-3 py-2 text-xs font-medium hover:bg-accent transition-colors disabled:opacity-40 min-h-[36px]"
      >
        {actionLabel}
      </button>
    </div>
  );
}

function AddTop3Form({ onAdd }: { onAdd: (t: Top3Task) => void }) {
  const [title, setTitle] = React.useState("");
  const [effort, setEffort] = React.useState(3);
  const [time, setTime] = React.useState(30);
  const [interest, setInterest] = React.useState(5);

  const handleAdd = () => {
    const clean = title.trim();
    if (!clean) return;
    const task: Top3Task = {
      id: `task_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 4)}`,
      title: clean.slice(0, 80),
      effort,
      time_min: time,
      interest,
    };
    onAdd(task);
    setTitle("");
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleAdd();
  };

  return (
    <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-4 space-y-3">
      <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Add to Top 3 — max 3 for today (not 20)</div>
      <div className="flex gap-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Task title — keep concrete (e.g. Write QBR report intro)"
          className="flex-1 rounded-lg border border-input bg-background px-3 py-2.5 text-sm"
          aria-label="New Top 3 task title"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={!title.trim()}
          className="rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-40"
        >
          Add
        </button>
      </div>
      <div className="flex flex-wrap gap-3 text-xs">
        <label className="flex items-center gap-1.5">Effort
          <select value={effort} onChange={(e) => setEffort(parseInt(e.target.value))} className="rounded-md border border-input bg-background px-2 py-1">
            {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}/5</option>)}
          </select>
        </label>
        <label className="flex items-center gap-1.5">Est
          <select value={time} onChange={(e) => setTime(parseInt(e.target.value))} className="rounded-md border border-input bg-background px-2 py-1">
            {[15,30,45,60,90,120].map(n => <option key={n} value={n}>{n}m</option>)}
          </select>
        </label>
        <label className="flex items-center gap-1.5">Interest
          <select value={interest} onChange={(e) => setInterest(parseInt(e.target.value))} className="rounded-md border border-input bg-background px-2 py-1">
            {[2,5,8,10].map(n => <option key={n} value={n}>{n}/10</option>)}
          </select>
        </label>
      </div>
      <p className="text-[11px] text-muted-foreground">Top 3 total &gt; 4h warns overcommitment (PlannerPro EffortAlign). Excess goes to Later.</p>
    </div>
  );
}

export function Top3View({ top3, later, onSelect, onDefer, onToggleDone, completedIds, onAddTask }: Top3ViewProps) {
  const totalCheck = React.useMemo(() => checkTop3Budget(top3), [top3]);
  const completedSet = completedIds ?? new Set<string>();

  // Hydration for standalone usage (when parent passes empty arrays initially)
  // MVP page will hydrate via its own localStorage; this is fallback for direct surface use.
  const [hydrated, setHydrated] = React.useState(false);
  React.useEffect(() => {
    if (top3.length === 0 && later.length === 0 && isBrowser() && !hydrated) {
      try {
        const rawTop3 = localStorage.getItem(STORAGE_TOP3);
        const rawLater = localStorage.getItem(STORAGE_LATER);
        if (rawTop3 || rawLater) {
          // let parent know via onAddTask? For standalone, we can't update parent's state,
          // so just mark hydrated and rely on parent's own hydration (MVP page).
        }
      } catch { /* ignore */ }
      setHydrated(true);
    }
  }, [top3.length, later.length, hydrated]);

  const handleAdd = React.useCallback((task: Top3Task) => {
    if (onAddTask) {
      onAddTask(task);
    } else {
      // Standalone: persist directly to localStorage (max 3, excess to Later)
      try {
        const existingTop3: Top3Task[] = JSON.parse(localStorage.getItem(STORAGE_TOP3) || "[]");
        const existingLater: Top3Task[] = JSON.parse(localStorage.getItem(STORAGE_LATER) || "[]");
        if (existingTop3.length < 3) {
          existingTop3.push(task);
          localStorage.setItem(STORAGE_TOP3, JSON.stringify(existingTop3));
        } else {
          existingLater.push(task);
          localStorage.setItem(STORAGE_LATER, JSON.stringify(existingLater));
        }
        // force refresh via page reload hint — parent should re-hydrate
        window.dispatchEvent(new Event("nlt-mvp:storage"));
      } catch { /* ignore */ }
    }
  }, [onAddTask]);

  return (
    <div className="w-full max-w-xl space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">System 3 — TOP 3 · Planner Pro</span>
        <span className="text-xs text-muted-foreground">{top3.length}/3</span>
      </div>
      <p className="text-sm text-muted-foreground">Daily Top 3 only — rest goes to Later. Effort×time checked. ADHD: small wins first.</p>

      {!totalCheck.ok && top3.length > 0 && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-950/30 p-3 text-xs leading-relaxed">
          <span className="font-semibold text-amber-700 dark:text-amber-400">Overcommitment warning:</span>{" "}
          <span className="text-amber-800 dark:text-amber-200">{totalCheck.reason}</span>
          {totalCheck.suggested && <div className="mt-1 text-amber-700 dark:text-amber-300">{totalCheck.suggested}</div>}
        </div>
      )}

      <AddTop3Form onAdd={handleAdd} />

      <div className="grid gap-3">
        {top3.map((t) => (
          <TaskCard
            key={t.id}
            task={t}
            actionLabel="Start →"
            onAction={() => onSelect(t)}
            done={completedSet.has(t.id)}
            onToggleDone={onToggleDone ? (done) => onToggleDone(t, done) : undefined}
          />
        ))}
        {top3.length === 0 && <div className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">No Top 3 yet — add 3 tasks above. PlannerPro will triage the rest to Later.</div>}
      </div>

      <div className="text-xs text-muted-foreground">
        Total est: {top3.reduce((s, t) => s + t.time_min, 0)}m · Effort {top3.reduce((s, t) => s + t.effort, 0)}/15
        {top3.length === 3 && later.length === 0 ? " · Top 3 full — new tasks will go to Later" : ""}
      </div>

      {later.length > 0 && (
        <div className="rounded-2xl border border-border bg-muted/40 p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Later · deferred ({later.length} parked)</span>
          </div>
          <ul className="space-y-2">
            {later.map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-2 text-sm">
                <span className="truncate text-muted-foreground">{t.title} · {t.time_min}m · Effort {t.effort}</span>
                <button
                  type="button"
                  onClick={() => onDefer(t)}
                  className="shrink-0 text-xs text-muted-foreground hover:text-foreground underline underline-offset-4"
                >
                  Move to Top3
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[11px] text-muted-foreground">Later is not lost — MemoryMate remembers, PlannerPro re-triage tomorrow. Tap “Move to Top3” to promote (if slot).</p>
        </div>
      )}
    </div>
  );
}

export default Top3View;

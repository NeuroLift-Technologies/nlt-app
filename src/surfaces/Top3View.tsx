/**
 * Top3View — System 3 TOP3 (Planner Pro + EffortAlign)
 *
 * Daily Top 3 not huge list, defer rest to Later, effort×time check to prevent overcommitment.
 * Addresses decision fatigue (too many choices → freeze) + perfectionism (huge list = never start).
 * Tailwind + React.
 *
 * @see src/advocates/09-plannerPro/index.ts — getTop3(), effortCheck()
 * TODO: wire to A2A PlannerPro + persist Later to MemoryMate dump store
 */
import * as React from "react";

export interface Top3Task {
  id: string;
  title: string;
  effort: number; // 1-5
  time_min: number;
  interest?: number;
}

export interface Top3ViewProps {
  top3: Top3Task[];
  later: Top3Task[];
  onSelect: (task: Top3Task) => void;
  onDefer: (task: Top3Task) => void;
}

function TaskCard({ task, actionLabel, onAction }: { task: Top3Task; actionLabel: string; onAction: () => void }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="min-w-0">
        <div className="truncate text-sm font-medium">{task.title}</div>
        <div className="mt-1 text-xs text-muted-foreground">
          Effort {task.effort}/5 · {task.time_min}m{typeof task.interest === "number" ? ` · Interest ${task.interest}/10` : ""}
        </div>
      </div>
      <button
        type="button"
        onClick={onAction}
        className="shrink-0 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-accent transition-colors"
      >
        {actionLabel}
      </button>
    </div>
  );
}

export function Top3View({ top3, later, onSelect, onDefer }: Top3ViewProps) {
  return (
    <div className="w-full max-w-xl space-y-4">
      <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">System 3 — TOP 3 · Planner Pro</div>
      <p className="text-sm text-muted-foreground">Daily Top 3 only — rest goes to Later. Effort×time checked.</p>

      <div className="grid gap-3">
        {top3.map((t) => (
          <TaskCard key={t.id} task={t} actionLabel="Start →" onAction={() => onSelect(t)} />
        ))}
        {top3.length === 0 && <div className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">No Top 3 yet — add candidates and getTop3() will triage.</div>}
      </div>

      {later.length > 0 && (
        <div className="rounded-2xl border border-border bg-muted/40 p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Later · deferred</span>
            <span className="text-xs text-muted-foreground">{later.length} parked</span>
          </div>
          <ul className="space-y-2">
            {later.map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-2 text-sm">
                <span className="truncate text-muted-foreground">{t.title}</span>
                <button
                  type="button"
                  onClick={() => onDefer(t)}
                  className="shrink-0 text-xs text-muted-foreground hover:text-foreground underline underline-offset-4"
                >
                  Defer
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[11px] text-muted-foreground">Later is not lost — MemoryMate remembers, PlannerPro re-triage tomorrow.</p>
        </div>
      )}

      <p className="text-[11px] text-muted-foreground">TODO: wire effortCheck(task) to block overcommit; StayAlert can reframe low-interest Top 3.</p>
    </div>
  );
}

export default Top3View;

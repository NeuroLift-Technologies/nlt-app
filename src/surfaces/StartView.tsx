/**
 * StartView — System 1 START (Activation Bridge)
 *
 * Shows ONE 2-min micro-step + [Done]/[Stuck] — bridges intention→initiation.
 * On Done → next micro-step (TaskKickstart). On Stuck → reclassify via orchestrator/classifier.
 * Tailwind + React, no external deps beyond apps/web stack.
 * Rendered per-user by 20th Developer builder (src/advocates/20-developer).
 *
 * @see src/advocates/07-taskKickstart/index.ts — getNextMicroStep()
 * @see src/orchestrator/classifier.ts — classifyStuckState()
 * TODO: wire to A2A advocate inference (neurolift-ai-fusion) + persist progress via D1
 */
import * as React from "react";

// Mirrors src/advocates/07-taskKickstart MicroStep (duplicate to avoid cross-import churn in stub)
export interface MicroStep {
  next_action: string;
  duration_min: 2;
  why?: string;
  id: string;
  reclassify: (reason: string) => MicroStep;
}

export interface StartViewProps {
  step: MicroStep;
  onDone: () => void;
  onStuck: (reason: string) => void;
}

export function StartView({ step, onDone, onStuck }: StartViewProps) {
  const [reason, setReason] = React.useState("");

  return (
    <div className="w-full max-w-xl rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        System 1 — START · Activation Bridge
      </div>
      <h2 className="text-lg font-semibold leading-tight">ONE micro-step · 2 min</h2>
      <p className="mt-3 rounded-xl bg-muted p-4 text-sm leading-relaxed">{step.next_action}</p>
      {step.why ? <p className="mt-2 text-xs text-muted-foreground">{step.why}</p> : null}
      <div className="mt-5 flex gap-3">
        <button
          type="button"
          onClick={onDone}
          className="flex-1 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700 transition-colors"
        >
          Done ✓
        </button>
        <div className="flex flex-1 gap-2">
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="why stuck? (bored / overwhelm / time)"
            className="flex-1 rounded-xl border border-input bg-background px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={() => onStuck(reason || "stuck")}
            className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium hover:bg-accent transition-colors"
          >
            Stuck
          </button>
        </div>
      </div>
      <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
        TODO: wire reclassify(reason) → classifier → advocate. No lectures — just next tiny move.
      </p>
    </div>
  );
}

export default StartView;

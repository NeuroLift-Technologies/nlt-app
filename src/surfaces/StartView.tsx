/**
 * StartView — System 1 START (Activation Bridge)
 *
 * Shows ONE 2-min micro-step + [Done]/[Stuck] — bridges intention→initiation.
 * On Done → next micro-step (TaskKickstart, logs actual vs estimate for time blindness).
 * On Stuck → reclassify via orchestrator/classifier → shrink step (bored/overwhelm/perfectionism/unsure).
 * Functional MVP v0.1: real heuristic, local persistence (nlt-mvp:activeMicroStep), no TODO.
 * Tailwind + React.
 *
 * @see src/advocates/07-taskKickstart/index.ts — getNextMicroStepSync(), generateMicroSteps()
 * @see src/orchestrator/classifier.ts — classifyStuckStateSync()
 */
"use client";

import * as React from "react";
import { getNextMicroStepSync } from "../advocates/07-taskKickstart";
import { classifyStuckStateSync } from "../orchestrator/classifier";
import { injectInterest } from "../advocates/01-stayAlert";
import type { MicroStep } from "../advocates/07-taskKickstart";

// Keep export for backward compat
export type { MicroStep } from "../advocates/07-taskKickstart";

export interface StartViewProps {
  /** Controlled micro-step (if provided, component is controlled; otherwise manages its own via intent) */
  step?: MicroStep | null;
  /** Controlled intent (task title) — when activeTask from Top3 is selected */
  intent?: string;
  onDone?: (nextStep: MicroStep | null, meta: { actualSec: number; estimatedSec: number; stepIndex: number }) => void;
  onStuck?: (reason: string, advocateId: string, reframedStep: MicroStep) => void;
  /** When Top3 task is active, pass it so StartView shows context */
  activeTaskTitle?: string;
}

const STORAGE_KEY = "nlt-mvp:activeMicroStep";

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function persistMicroStep(data: { intent: string; stepIndex: number; startedAt: number; next_action: string } | null) {
  if (!isBrowser()) return;
  try {
    if (data) localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    else localStorage.removeItem(STORAGE_KEY);
  } catch { /* ignore */ }
}

function loadPersisted(): { intent: string; stepIndex: number; startedAt: number; next_action: string } | null {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}

export function StartView({ step: controlledStep, intent: controlledIntent, onDone, onStuck, activeTaskTitle }: StartViewProps) {
  const isControlled = controlledStep !== undefined;
  const effectiveIntent = (controlledIntent ?? activeTaskTitle ?? "").trim();

  const [intentInput, setIntentInput] = React.useState(effectiveIntent);
  const [stepIndex, setStepIndex] = React.useState(0);
  const [startedAt, setStartedAt] = React.useState<number | null>(null);
  const [stuckReason, setStuckReason] = React.useState("");
  const [reframed, setReframed] = React.useState<{ text: string; hook: string } | null>(null);
  const [advocateHint, setAdvocateHint] = React.useState<string | null>(null);

  // Intent sync: when activeTaskTitle changes, reset to that intent
  React.useEffect(() => {
    if (activeTaskTitle) {
      setIntentInput(activeTaskTitle);
      setStepIndex(0);
      setStartedAt(Date.now());
      setReframed(null);
      setAdvocateHint(null);
    } else if (controlledIntent) {
      setIntentInput(controlledIntent);
    }
  }, [activeTaskTitle, controlledIntent]);

  // Hydrate persisted micro-step on mount (survives refresh)
  React.useEffect(() => {
    if (isControlled) return;
    const persisted = loadPersisted();
    if (persisted && !activeTaskTitle) {
      setIntentInput(persisted.intent);
      setStepIndex(persisted.stepIndex);
      setStartedAt(persisted.startedAt);
    } else if (!persisted && !activeTaskTitle) {
      // no persisted — keep empty, user will type intent
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const intent = isControlled ? (effectiveIntent || intentInput) : intentInput;
  const hasIntent = intent.trim().length > 0;

  const currentStep: MicroStep | null = React.useMemo(() => {
    if (isControlled) return controlledStep ?? null;
    if (!hasIntent) return null;
    try {
      const s = getNextMicroStepSync(intent, stepIndex);
      return s;
    } catch {
      return null;
    }
  }, [isControlled, controlledStep, hasIntent, intent, stepIndex]);

  // Persist when step changes
  React.useEffect(() => {
    if (isControlled) return;
    if (currentStep && hasIntent && startedAt) {
      persistMicroStep({ intent, stepIndex, startedAt, next_action: currentStep.next_action });
    }
  }, [isControlled, currentStep, hasIntent, intent, stepIndex, startedAt]);

  const handleStart = React.useCallback(() => {
    const clean = intentInput.trim();
    if (!clean) return;
    try {
      const s = getNextMicroStepSync(clean, 0);
      void s;
    } catch { /* ignore */ }
    setStepIndex(0);
    setStartedAt(Date.now());
    setReframed(null);
    setAdvocateHint(null);
    persistMicroStep({ intent: clean, stepIndex: 0, startedAt: Date.now(), next_action: currentStep?.next_action ?? "" });
  }, [intentInput, currentStep]);

  const handleDone = React.useCallback(() => {
    const now = Date.now();
    const actualSec = startedAt ? Math.round((now - startedAt) / 1000) : 120;
    const estimatedSec = 120; // 2 min
    // Log for TimeBar / time blindness training
    try {
      const logsRaw = localStorage.getItem("nlt-mvp:timeLogs");
      const logs = logsRaw ? JSON.parse(logsRaw) : [];
      logs.push({ task: intent, estimated: estimatedSec, actual: actualSec, delta: actualSec - estimatedSec, at: now });
      localStorage.setItem("nlt-mvp:timeLogs", JSON.stringify(logs.slice(-20)));
    } catch { /* ignore */ }

    const nextIndex = stepIndex + 1;
    setStepIndex(nextIndex);
    setStartedAt(now);
    setReframed(null);
    setAdvocateHint(null);

    if (isControlled && onDone) {
      // Controlled: let parent generate next step
      let nextStep: MicroStep | null = null;
      try { nextStep = getNextMicroStepSync(intent, nextIndex); } catch { nextStep = null; }
      onDone(nextStep, { actualSec, estimatedSec, stepIndex: nextIndex });
      return;
    }
    // Uncontrolled: update local state, will memo new currentStep
    persistMicroStep({ intent, stepIndex: nextIndex, startedAt: now, next_action: "" });
    if (onDone) {
      let nextStep: MicroStep | null = null;
      try { nextStep = getNextMicroStepSync(intent, nextIndex); } catch { nextStep = null; }
      onDone(nextStep, { actualSec, estimatedSec, stepIndex: nextIndex });
    }
  }, [intent, onDone, isControlled, startedAt, stepIndex]);

  const handleStuck = React.useCallback(() => {
    const reason = stuckReason.trim() || "stuck";
    const lower = reason.toLowerCase();
    let advocateId: string;
    try {
      advocateId = classifyStuckStateSync(reason, {});
    } catch {
      advocateId = "07-taskKickstart";
    }

    // Heuristic reclassify via TaskKickstart, plus StayAlert reframing for boredom
    let reframedStep: MicroStep;
    let hookText = "";
    if (lower.includes("bored") || lower.includes("uninterest") || lower.includes("tedious")) {
      const reframedData = injectInterest(intent || currentStep?.next_action || "this task");
      hookText = reframedData.hook;
      // Create a speed-run micro-step
      try {
        const base = getNextMicroStepSync(reframedData.starter || intent, 0);
        reframedStep = base;
        reframedStep.why = `${reframedData.hook} — ${reframedData.starter}`;
      } catch {
        reframedStep = getNextMicroStepSync(intent, 0);
      }
      setReframed({ text: reframedData.reframed, hook: hookText });
    } else {
      // Use TaskKickstart's reclassify hook if we have a step
      if (currentStep) {
        reframedStep = currentStep.reclassify(reason);
      } else {
        reframedStep = getNextMicroStepSync(`${intent} — stuck: ${reason}`, 0);
      }
      // Add advocate hint for overwhelm/perfectionism etc.
      if (lower.includes("overwhelm") || lower.includes("too many") || lower.includes("much")) {
        hookText = "PlannerPro: too many → shrink to 30-sec touch, Top 3 only.";
      } else if (lower.includes("perfect") || lower.includes("properly") || lower.includes("good enough")) {
        hookText = "Perfectionism → ugly first draft, 2 min only. Done beats perfect.";
      } else if (lower.includes("unsure") || lower.includes("don't know") || lower.includes("first step")) {
        hookText = "Unsure first step → open + 30-sec touch: just title or one bullet.";
      }
      if (hookText) setReframed({ text: reframedStep.next_action, hook: hookText });
    }

    setAdvocateHint(advocateId);
    setStuckReason("");

    if (onStuck) onStuck(reason, advocateId, reframedStep);
    else {
      // Uncontrolled: replace current step with reframed
      // We can't directly set currentStep (derived), so we set stepIndex to a large value and use reframed
      // Simpler: override via local state showing reframed next_action
      setReframed({ text: reframedStep.next_action, hook: reframedStep.why || hookText });
    }
  }, [stuckReason, intent, currentStep, onStuck]);

  const showIntentInput = !isControlled || !hasIntent;
  const displayStep = currentStep;

  return (
    <div className="w-full max-w-xl rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">System 1 — START · Activation Bridge</span>
        {activeTaskTitle && <span className="text-xs text-muted-foreground truncate max-w-[50%]">→ {activeTaskTitle.slice(0, 30)}</span>}
      </div>
      <h2 className="text-lg font-semibold leading-tight">ONE micro-step · 2 min</h2>

      {showIntentInput && !activeTaskTitle && (
        <div className="mt-4 flex gap-2">
          <input
            value={intentInput}
            onChange={(e) => setIntentInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleStart(); }}
            placeholder="What do you want to start? (e.g. Write QBR report, Clean house)"
            className="flex-1 rounded-xl border border-input bg-background px-3 py-3 text-sm"
            aria-label="Intent to start"
          />
          <button
            type="button"
            onClick={handleStart}
            disabled={!intentInput.trim()}
            className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-40"
          >
            Start
          </button>
        </div>
      )}

      {hasIntent && displayStep ? (
        <>
          <p className="mt-4 rounded-xl bg-muted p-4 text-sm leading-relaxed font-medium">{displayStep.next_action}</p>
          {displayStep.why ? <p className="mt-2 text-xs text-muted-foreground">{displayStep.why}</p> : null}
          {reframed && (
            <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 p-3">
              <p className="text-xs font-medium text-amber-800 dark:text-amber-200">{reframed.text}</p>
              {reframed.hook && <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">{reframed.hook}</p>}
              {advocateHint && <p className="mt-1 text-[11px] text-muted-foreground">Routed to {advocateHint} via classifier</p>}
            </div>
          )}
          <div className="mt-5 flex gap-3">
            <button
              type="button"
              onClick={handleDone}
              className="flex-1 rounded-xl bg-brand-600 px-4 py-3 text-sm font-medium text-white hover:bg-brand-700 transition-colors min-h-[44px]"
            >
              Done ✓ — next 2 min
            </button>
            <div className="flex flex-1 gap-2">
              <input
                value={stuckReason}
                onChange={(e) => setStuckReason(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleStuck(); }}
                placeholder="why stuck? overwhelm / perfectionism / boredom / unsure"
                className="flex-1 rounded-xl border border-input bg-background px-3 py-2.5 text-sm"
                aria-label="Reason stuck"
              />
              <button
                type="button"
                onClick={handleStuck}
                className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium hover:bg-accent transition-colors"
              >
                Stuck
              </button>
            </div>
          </div>
          <p className="mt-3 text-center text-[11px] leading-relaxed text-muted-foreground">
            Done marks actual time vs estimate for time-blindness training. Stuck shrinks step + reclassifies (no lectures).
          </p>
        </>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">Enter what you want to start above — you&apos;ll get ONE 2-min micro-step (Joshd #1: Task initiation).</p>
      )}
    </div>
  );
}

export default StartView;

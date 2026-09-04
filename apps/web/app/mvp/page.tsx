"use client";

import * as React from "react";
import Link from "next/link";
import { DumpBar } from "../../../../src/surfaces/DumpBar";
import { Top3View } from "../../../../src/surfaces/Top3View";
import { StartView } from "../../../../src/surfaces/StartView";
import { TimeBar } from "../../../../src/surfaces/TimeBar";
import { getNextMicroStepSync } from "../../../../src/advocates/07-taskKickstart";
import type { MicroStep } from "../../../../src/advocates/07-taskKickstart";
import type { TaskCandidate } from "../../../../src/advocates/09-plannerPro";
import type { DumpEntry } from "../../../../src/advocates/05-memoryMate";

// Keys per spec: nlt-mvp: prefix, localStorage persistence survives refresh
const K = {
  top3: "nlt-mvp:top3",
  later: "nlt-mvp:later",
  completed: "nlt-mvp:completedTop3",
  activeTask: "nlt-mvp:activeTask",
  activeMicro: "nlt-mvp:activeMicroStep",
  timeLogs: "nlt-mvp:timeLogs",
  stepIndex: "nlt-mvp:microStepIndex",
} as const;

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function load<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch { return fallback; }
}

function save(key: string, value: unknown) {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch { /* quota */ }
}

export default function MvpPage() {
  const [top3, setTop3] = React.useState<TaskCandidate[]>([]);
  const [later, setLater] = React.useState<TaskCandidate[]>([]);
  const [completedIds, setCompletedIds] = React.useState<Set<string>>(new Set());
  const [activeTask, setActiveTask] = React.useState<TaskCandidate | null>(null);
  const [microStep, setMicroStep] = React.useState<MicroStep | null>(null);
  const [stepIndex, setStepIndex] = React.useState(0);
  const [startedAt, setStartedAt] = React.useState<number | null>(null);
  const [timeLogs, setTimeLogs] = React.useState<Array<{ task: string; estimated: number; actual: number; delta: number; at: number }>>([]);
  const [hydrated, setHydrated] = React.useState(false);

  // Hydrate from localStorage on mount
  React.useEffect(() => {
    const t3 = load<TaskCandidate[]>(K.top3, []);
    const lt = load<TaskCandidate[]>(K.later, []);
    const comp = load<string[]>(K.completed, []);
    const at = load<TaskCandidate | null>(K.activeTask, null);
    const micro = load<{ intent: string; stepIndex: number; startedAt: number } | null>(K.activeMicro, null);
    const logs = load<typeof timeLogs>(K.timeLogs, []);
    const idx = load<number>(K.stepIndex, 0);
    setTop3(Array.isArray(t3) ? t3.slice(0, 3) : []);
    setLater(Array.isArray(lt) ? lt : []);
    setCompletedIds(new Set(Array.isArray(comp) ? comp : []));
    if (at) setActiveTask(at);
    if (micro && at) {
      setStepIndex(micro.stepIndex ?? idx ?? 0);
      setStartedAt(micro.startedAt ?? Date.now());
      try {
        const s = getNextMicroStepSync(at.title, micro.stepIndex ?? 0);
        setMicroStep(s);
      } catch { /* ignore */ }
    } else if (micro && !at && micro.intent) {
      // persisted free intent
      setStepIndex(micro.stepIndex ?? 0);
      setStartedAt(micro.startedAt ?? Date.now());
      try {
        const s = getNextMicroStepSync(micro.intent, micro.stepIndex ?? 0);
        setMicroStep(s);
      } catch { /* ignore */ }
    }
    setTimeLogs(Array.isArray(logs) ? logs : []);
    setHydrated(true);
  }, []);

  // Persist top3/later/completed/activeTask when they change (after hydration)
  React.useEffect(() => { if (hydrated) save(K.top3, top3); }, [top3, hydrated]);
  React.useEffect(() => { if (hydrated) save(K.later, later); }, [later, hydrated]);
  React.useEffect(() => { if (hydrated) save(K.completed, Array.from(completedIds)); }, [completedIds, hydrated]);
  React.useEffect(() => { if (hydrated) save(K.activeTask, activeTask); }, [activeTask, hydrated]);
  React.useEffect(() => { if (hydrated) save(K.stepIndex, stepIndex); }, [stepIndex, hydrated]);
  React.useEffect(() => { if (hydrated) save(K.timeLogs, timeLogs.slice(-20)); }, [timeLogs, hydrated]);

  const handleSelectTop3 = React.useCallback((task: TaskCandidate) => {
    setActiveTask(task);
    setStepIndex(0);
    const now = Date.now();
    setStartedAt(now);
    try {
      const s = getNextMicroStepSync(task.title, 0);
      setMicroStep(s);
      save(K.activeMicro, { intent: task.title, stepIndex: 0, startedAt: now });
    } catch {
      setMicroStep(null);
    }
    // scroll to StartView
    document.getElementById("mvp-start")?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  const handleDefer = React.useCallback((task: TaskCandidate) => {
    // Later → Top3 promotion (if slot)
    if (top3.length < 3) {
      setTop3((prev) => [...prev, task]);
      setLater((prev) => prev.filter((t) => t.id !== task.id));
    } else {
      // swap: move first Top3 to Later, promote selected Later to Top3
      const first = top3[0];
      if (first) {
        setTop3((prev) => [task, ...prev.slice(1)]);
        setLater((prev) => [...prev.filter((t) => t.id !== task.id), first]);
      }
    }
  }, [top3]);

  const handleDeferFromTop3 = React.useCallback((task: TaskCandidate) => {
    setTop3((prev) => prev.filter((t) => t.id !== task.id));
    setLater((prev) => [...prev, task]);
    if (activeTask?.id === task.id) {
      setActiveTask(null);
      setMicroStep(null);
      setStartedAt(null);
      if (isBrowser()) localStorage.removeItem(K.activeMicro);
    }
  }, [activeTask]);

  const handleAddTask = React.useCallback((task: TaskCandidate) => {
    if (top3.length < 3) {
      setTop3((prev) => [...prev, task]);
    } else {
      setLater((prev) => [...prev, task]);
    }
  }, [top3.length]);

  const handleToggleDone = React.useCallback((task: TaskCandidate, done: boolean) => {
    setCompletedIds((prev) => {
      const next = new Set(prev);
      if (done) next.add(task.id);
      else next.delete(task.id);
      return next;
    });
    if (done && activeTask?.id === task.id) {
      // optionally clear active
    }
  }, [activeTask]);

  const handleDumpMoveToTop3 = React.useCallback((dump: DumpEntry) => {
    const task: TaskCandidate = {
      id: `dump_${dump.id}`,
      title: dump.text.slice(0, 80),
      effort: 3,
      time_min: 30,
      interest: 5,
    };
    handleAddTask(task);
  }, [handleAddTask]);

  const handleStartDone = React.useCallback((nextStep: MicroStep | null, meta: { actualSec: number; estimatedSec: number; stepIndex: number }) => {
    // Log actual vs estimate for time blindness training
    const entry = {
      task: activeTask?.title ?? "free intent",
      estimated: meta.estimatedSec,
      actual: meta.actualSec,
      delta: meta.actualSec - meta.estimatedSec,
      at: Date.now(),
    };
    setTimeLogs((prev) => [...prev, entry].slice(-20));
    if (nextStep) {
      setMicroStep(nextStep);
      setStepIndex(meta.stepIndex);
      setStartedAt(Date.now());
      save(K.activeMicro, { intent: activeTask?.title ?? "free", stepIndex: meta.stepIndex, startedAt: Date.now() });
    } else {
      // no next step — try to generate next
      const intent = activeTask?.title ?? "continue";
      try {
        const s = getNextMicroStepSync(intent, meta.stepIndex);
        setMicroStep(s);
        setStepIndex(meta.stepIndex);
        setStartedAt(Date.now());
      } catch { /* ignore */ }
    }
  }, [activeTask]);

  const handleStuck = React.useCallback((reason: string, advocateId: string, reframedStep: MicroStep) => {
    // Show reframed step
    setMicroStep(reframedStep);
    // optionally switch active task if reclassified to MemoryMate etc.
    void reason; void advocateId;
  }, []);

  const totalEst = top3.reduce((s, t) => s + t.time_min, 0);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b border-border bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="mx-auto flex max-w-3xl flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm font-bold tracking-tight">NeuroLift — Personal OS v0.1 — <span className="text-brand-600">World&gt;&gt;Fusion&gt;&gt;App (1:20)</span></div>
            <div className="text-xs text-muted-foreground">ADHD support: START (2-min) · TIME (live) · TOP3 (not 20) · DumpBar · Interest injection</div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/" className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4">Home</Link>
            <span className="text-xs text-muted-foreground">·</span>
            <span className="text-xs font-medium text-brand-600">/mvp</span>
            <span className="ml-2 hidden rounded-full bg-brand-600 px-2 py-0.5 text-[11px] font-medium text-white sm:inline">Joshd profile</span>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-6">
        {/* DumpBar — always visible at top per spec */}
        <DumpBar onMoveToTop3={handleDumpMoveToTop3} />

        {/* Top3View — middle */}
        <Top3View
          top3={top3}
          later={later}
          onSelect={handleSelectTop3}
          onDefer={handleDefer}
          onToggleDone={handleToggleDone}
          completedIds={completedIds}
          onAddTask={handleAddTask}
        />

        {/* StartView — for selected task */}
        <div id="mvp-start">
          <StartView
            activeTaskTitle={activeTask?.title}
            intent={activeTask?.title}
            step={microStep}
            onDone={handleStartDone}
            onStuck={handleStuck}
          />
          {!activeTask && top3.length > 0 && (
            <p className="mt-2 text-center text-xs text-muted-foreground">Select a Top 3 task above to start, or type any intent in START.</p>
          )}
        </div>

        {/* TimeBar — when micro-step active */}
        {microStep && startedAt ? (
          <TimeBar startedAt={startedAt} estimatedSec={120} showCalibration />
        ) : (
          <div className="w-full max-w-xl rounded-2xl border border-dashed border-border bg-muted/20 p-5 text-center">
            <p className="text-sm text-muted-foreground">No active timer — start a micro-step to see live countdown + estimate vs actual.</p>
            <p className="mt-1 text-xs text-muted-foreground">Total Top3 est: {totalEst}m · Time logs: {timeLogs.length} · Last: {timeLogs.length ? `${timeLogs[timeLogs.length-1].actual}s vs ${timeLogs[timeLogs.length-1].estimated}s` : "—"}</p>
          </div>
        )}

        {/* Time logs — calibration training */}
        {timeLogs.length > 0 && (
          <div className="w-full max-w-xl rounded-xl border border-border bg-card p-4">
            <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Time blindness training — estimate vs actual (last 5)</div>
            <ul className="space-y-1 text-xs">
              {timeLogs.slice(-5).reverse().map((l) => (
                <li key={l.at} className="flex justify-between gap-2">
                  <span className="truncate text-muted-foreground">{l.task.slice(0, 40)}</span>
                  <span className={l.delta > 30 ? "text-amber-600 font-medium" : "text-muted-foreground"}>{l.actual}s / {l.estimated}s {l.delta > 0 ? `+${l.delta}s` : `${l.delta}s`}</span>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-[11px] text-muted-foreground">Stored in localStorage nlt-mvp:timeLogs — ADHD time calibration, not judgment.</p>
          </div>
        )}

        <div className="rounded-xl border border-border bg-card p-4 text-xs leading-relaxed text-muted-foreground">
          <span className="font-semibold text-foreground">How to use daily (30 sec):</span> Dump anything → pick Top 3 → Start one → Done / Stuck. TimeBar trains your time sense. Later park never loses. All persists locally (nlt-mvp:*) — refresh safe. Governance: ASFDK in every AI (human_led, recommendation_only).
        </div>
      </main>
    </div>
  );
}

/**
 * TimeBar — System 2 TIME (Timely) — time visibility + Hyperfocus Guard companion
 *
 * Live countdown bar + estimate vs actual + transition buffer.
 * Brain stays attached to previous thing → needs explicit detach window (createTransitionBuffer 2 min).
 * Hyperfocus Guard: when actual ≥ 1.5× estimated, nudge exit ramp (paired with StayAlert).
 * Functional MVP v0.1: live 1s ticker, estimate vs actual store (nlt-mvp:timeLogs), 2-min buffer button.
 * Tailwind + React, no external deps beyond apps/web stack.
 *
 * @see src/advocates/04-timely/index.ts — getLiveRemaining(), createTransitionBuffer(), shouldTriggerHyperfocusGuard()
 */
"use client";

import * as React from "react";
import { getLiveRemaining, createTransitionBuffer, shouldTriggerHyperfocusGuard, getTimeVisibility } from "../advocates/04-timely";

export interface TimeBarProps {
  /** Original estimate in minutes (legacy) or estimatedSec */
  estimated?: number;
  /** Elapsed / actual minutes (legacy) */
  actual?: number;
  /** Remaining minutes (legacy) */
  remaining?: number;
  /** MVP live: epoch ms when micro-step started */
  startedAt?: number | null;
  /** MVP live: estimate in seconds (default 120 for 2-min micro-step) */
  estimatedSec?: number;
  /** Called each tick (e.g. every 1s) with updated remaining seconds */
  onTick?: (remainingSec: number) => void;
  /** Optional: estimated vs actual delta label */
  showCalibration?: boolean;
}

function formatSec(totalSec: number): string {
  const sign = totalSec < 0 ? "-" : "";
  const abs = Math.abs(totalSec);
  const m = Math.floor(abs / 60);
  const s = Math.floor(abs % 60);
  return `${sign}${m}:${s.toString().padStart(2, "0")}`;
}

export function TimeBar({
  estimated = 2,
  actual = 0,
  remaining,
  startedAt = null,
  estimatedSec = 120,
  onTick,
  showCalibration = true,
}: TimeBarProps) {
  const isLive = startedAt !== null && startedAt !== undefined;
  const [liveRemainingSec, setLiveRemainingSec] = React.useState<number>(() => {
    if (isLive) return estimatedSec;
    return remaining !== undefined ? remaining * 60 : estimated * 60 - actual * 60;
  });
  const [actualSec, setActualSec] = React.useState<number>(() => isLive ? 0 : actual * 60);
  const [showBuffer, setShowBuffer] = React.useState(false);
  const [bufferRemaining, setBufferRemaining] = React.useState(120);
  const [bufferLabel, setBufferLabel] = React.useState("");

  // Determine initial remaining when props change
  React.useEffect(() => {
    if (!isLive) {
      const rem = remaining !== undefined ? remaining * 60 : estimated * 60 - actual * 60;
      setLiveRemainingSec(rem);
      setActualSec(actual * 60);
    }
  }, [estimated, actual, remaining, isLive]);

  // Live ticker: 1s interval
  React.useEffect(() => {
    if (!isLive || showBuffer) return;
    const tick = () => {
      const now = Date.now();
      const remMin = getLiveRemaining(startedAt!, estimatedSec / 60, now);
      const remSec = Math.round(remMin * 60);
      setLiveRemainingSec(remSec);
      setActualSec(Math.round((now - startedAt!) / 1000));
      if (onTick) onTick(remSec);
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [isLive, startedAt, estimatedSec, onTick, showBuffer]);

  // Transition buffer ticker
  React.useEffect(() => {
    if (!showBuffer) return;
    const id = window.setInterval(() => {
      setBufferRemaining((r) => {
        if (r <= 1) {
          window.clearInterval(id);
          setShowBuffer(false);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [showBuffer]);

  const handleSwitchBuffer = () => {
    const buf = createTransitionBuffer("switching tasks", 2);
    setBufferLabel(buf.label);
    setBufferRemaining(buf.buffer_min * 60);
    setShowBuffer(true);
  };

  const estimatedMin = isLive ? estimatedSec / 60 : estimated;
  const actualMin = isLive ? actualSec / 60 : actual;
  const remainingMin = liveRemainingSec / 60;
  const isOvertime = liveRemainingSec < 0;
  const guard = shouldTriggerHyperfocusGuard(estimatedMin, actualMin);
  const vis = getTimeVisibility(estimatedMin, actualMin);
  const pct = estimatedMin > 0 ? Math.max(0, Math.min(100, (actualMin / estimatedMin) * 100)) : 0;
  const barColor = isOvertime ? "bg-amber-500" : guard ? "bg-orange-500" : pct > 80 ? "bg-yellow-500" : "bg-brand-500";

  if (showBuffer) {
    return (
      <div className="w-full max-w-xl rounded-2xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 p-5">
        <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-widest text-amber-800 dark:text-amber-300">
          <span>Transition Buffer · 2 min</span>
          <span className="font-mono text-sm">{formatSec(bufferRemaining)}</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-amber-200 dark:bg-amber-900">
          <div className="h-full rounded-full bg-amber-500 transition-all" style={{ width: `${((120 - bufferRemaining) / 120) * 100}%` }} />
        </div>
        <p className="mt-3 text-sm font-medium text-amber-900 dark:text-amber-100">{bufferLabel || "Detaching — stand, breathe, ground."}</p>
        <p className="mt-2 text-xs leading-relaxed text-amber-800/80 dark:text-amber-200/80">
          Breathing: inhale 4, hold 2, exhale 6. Wiggle toes. Look at far wall. Brain detaching from previous thing — explicit buffer beats instant switch (time blindness).
        </p>
        <button
          type="button"
          onClick={() => setShowBuffer(false)}
          className="mt-3 rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-medium hover:bg-amber-100 dark:bg-amber-900 dark:text-amber-100"
        >
          Done — back to Start
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        <span>System 2 — TIME · Timely · Live</span>
        <span className={isOvertime ? "text-amber-600 font-bold" : "text-muted-foreground"}>
          {isLive ? formatSec(liveRemainingSec) : `${remainingMin.toFixed(1)}m`} {isOvertime ? "· overtime" : "· live"}
        </span>
      </div>

      <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${Math.min(100, pct)}%` }}
          role="progressbar"
          aria-valuenow={Math.round(pct)}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>

      <div className="mt-3 flex flex-wrap justify-between gap-2 text-sm">
        <span>
          <span className="text-muted-foreground">Est:</span> {estimatedMin}m
        </span>
        <span>
          <span className="text-muted-foreground">Actual:</span> {actualMin.toFixed(1)}m
        </span>
        <span className={isOvertime ? "font-semibold text-amber-600" : "font-medium"}>
          <span className="text-muted-foreground font-normal">Remaining:</span> {isLive ? formatSec(liveRemainingSec) : `${remainingMin.toFixed(1)}m`}
        </span>
      </div>

      {showCalibration && (
        <p className="mt-2 text-xs text-muted-foreground">
          Calibration: {vis.delta_min > 0 ? `+${vis.delta_min.toFixed(1)}m over` : `${Math.abs(vis.delta_min).toFixed(1)}m under`} — time blindness training (estimate vs actual). {isLive ? "Live 1s ticker." : ""}
        </p>
      )}

      {guard && (
        <div className="mt-3 rounded-lg bg-amber-500/10 p-3 text-xs leading-relaxed border border-amber-200/50">
          <span className="font-semibold text-amber-700">Hyperfocus Guard:</span> you&apos;ve been {actualMin.toFixed(1)}m on a {estimatedMin}m estimate (1.5×). Save point + 2-min buffer → next puzzle.
          <button type="button" onClick={handleSwitchBuffer} className="ml-2 underline underline-offset-4 text-amber-700">Buffer now</button>
        </div>
      )}

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={handleSwitchBuffer}
          className="rounded-xl border border-border bg-muted/50 px-4 py-2.5 text-sm font-medium hover:bg-accent transition-colors"
        >
          Switching tasks — 2-min buffer
        </button>
        <span className="flex items-center text-xs text-muted-foreground">Breathing + grounding for detach</span>
      </div>
    </div>
  );
}

export default TimeBar;

/**
 * TimeBar — System 2 TIME (Timely) — time visibility + Hyperfocus Guard companion
 *
 * Live countdown bar + estimate vs actual + transition buffer.
 * Brain stays attached to previous thing → needs explicit detach window (createTransitionBuffer).
 * Hyperfocus Guard: when actual ≥ 1.5× estimated, nudge exit ramp (paired with StayAlert).
 *
 * Tailwind + React, no external deps beyond apps/web stack.
 * @see src/advocates/04-timely/index.ts — getLiveRemaining(), createTransitionBuffer(), shouldTriggerHyperfocusGuard()
 * TODO: tick via rAF/useInterval; wire to nlt-world-engine time_manager via A2A
 */
import * as React from "react";

export interface TimeBarProps {
  /** Original estimate in minutes */
  estimated: number;
  /** Elapsed / actual minutes (live) */
  actual: number;
  /** Remaining minutes (may be negative → overtime) */
  remaining: number;
  /** Called each tick (e.g. every 1s) with updated remaining */
  onTick?: (remaining: number) => void;
  /** Optional: estimated vs actual delta label */
  showCalibration?: boolean;
}

export function TimeBar({ estimated, actual, remaining, onTick, showCalibration = true }: TimeBarProps) {
  const [liveRemaining, setLiveRemaining] = React.useState(remaining);

  React.useEffect(() => {
    setLiveRemaining(remaining);
  }, [remaining]);

  React.useEffect(() => {
    if (!onTick) return;
    const id = window.setInterval(() => {
      // Stub tick: decrement 1/60 min per second (real Timely uses getLiveRemaining(startedAt, estimated))
      setLiveRemaining((r) => {
        const next = r - 1 / 60;
        onTick(next);
        return next;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [onTick]);

  const isOvertime = liveRemaining < 0;
  const pct = estimated > 0 ? Math.max(0, Math.min(100, ((actual / estimated) * 100))) : 0;
  const barColor = isOvertime ? "bg-amber-500" : pct > 80 ? "bg-yellow-500" : "bg-brand-500";

  return (
    <div className="w-full max-w-xl rounded-2xl border border-border bg-card p-5">
      <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        <span>System 2 — TIME · Timely</span>
        <span className={isOvertime ? "text-amber-600" : "text-muted-foreground"}>
          {isOvertime ? "overtime" : "live"}
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
          <span className="text-muted-foreground">Est:</span> {estimated}m
        </span>
        <span>
          <span className="text-muted-foreground">Actual:</span> {actual.toFixed(1)}m
        </span>
        <span className={isOvertime ? "font-semibold text-amber-600" : "font-medium"}>
          <span className="text-muted-foreground font-normal">Remaining:</span> {liveRemaining.toFixed(1)}m
        </span>
      </div>

      {showCalibration && (
        <p className="mt-2 text-xs text-muted-foreground">
          Calibration: {actual > estimated ? `+${(actual - estimated).toFixed(1)}m over` : `${(estimated - actual).toFixed(1)}m under`} — time blindness training (estimate vs actual).
        </p>
      )}

      {isOvertime && (
        <div className="mt-3 rounded-lg bg-amber-500/10 p-3 text-xs leading-relaxed">
          <span className="font-semibold text-amber-700">Hyperfocus Guard:</span> overtime — save point + 5-min transition buffer → next puzzle.
          <span className="text-muted-foreground"> (StayAlert exit ramp)</span>
        </div>
      )}

      <p className="mt-3 text-[11px] text-muted-foreground">TODO: wire getLiveRemaining() + createTransitionBuffer(nextTask) via A2A.</p>
    </div>
  );
}

export default TimeBar;

/**
 * 04 — Timely — Time Visibility (System 2: TIME)
 *
 * ADHD trait: Time Blindness — ranked #3 very high for Joshd; brain stays attached to previous thing.
 * Provides live countdown + estimate vs actual + transition buffers.
 *
 * System mapping: System 2 TIME (Timely) — time visibility
 * - Live countdown bar (see src/surfaces/TimeBar.tsx)
 * - Estimate vs actual display to calibrate time blindness
 * - Transition buffers: brain needs explicit "detach → move" window
 * - Hyperfocus Guard companion: warns when focus locks past estimate (see StayAlert + TimeBar)
 *
 * @see https://github.com/NeuroLift-Technologies/neurolift-ai-fusion — trait catalog: Timely avatar/aide → Advocate 04
 * Archived: archive/pre-1-20-fullstack-2026-09-03/src/simulation/environment/time_manager.py
 *
 * TODO[A2A]: Wire to neurolift-ai-fusion Advocate 04 + nlt-world-engine time_manager via A2A.
 */

export interface TimeEstimate {
  /** User estimate in minutes (before starting) */
  estimated_min: number;
  /** Measured actual minutes (after / live) */
  actual_min: number;
  /** Remaining = estimated - actual (may go negative → overtime) */
  remaining_min: number;
  /** Over/under calibration delta */
  delta_min: number;
  /** Whether we are in overtime (actual > estimated) */
  isOvertime: boolean;
}

export interface TransitionBuffer {
  /** Buffer duration in minutes */
  buffer_min: number;
  /** Human label */
  label: string;
  /** When buffer should fire (epoch ms) */
  fireAt: number;
}

/**
 * Compute estimate vs actual snapshot.
 * @param estimated_min - original estimate
 * @param actual_min - elapsed/actual so far
 */
export function getTimeVisibility(estimated_min: number, actual_min: number): TimeEstimate {
  const remaining_min = estimated_min - actual_min;
  return {
    estimated_min,
    actual_min,
    remaining_min,
    delta_min: actual_min - estimated_min,
    isOvertime: actual_min > estimated_min,
  };
}

/**
 * Get live remaining minutes from start + estimate (pure helper; surfaces call onTick).
 * @param startedAt - epoch ms when task started
 * @param estimated_min - estimate in minutes
 * @param now - epoch ms now (default Date.now())
 */
export function getLiveRemaining(startedAt: number, estimated_min: number, now: number = Date.now()): number {
  const elapsedMin = (now - startedAt) / 60000;
  return estimated_min - elapsedMin;
}

/**
 * Create transition buffer — explicit detach window for "brain attached to previous thing".
 * Joshd's time blindness needs a named buffer between tasks, not instant switch.
 * @param nextTask - what we're transitioning to
 * @param buffer_min - default 5 minutes
 */
export function createTransitionBuffer(nextTask: string, buffer_min: number = 5): TransitionBuffer {
  const label = `Buffer → ${nextTask.slice(0, 40)}: stand, breathe, detach`;
  return {
    buffer_min,
    label,
    fireAt: Date.now() + buffer_min * 60 * 1000,
  };
}

/**
 * Hyperfocus Guard check — should we nudge to exit ramp?
 * If actual ≥ estimated * 1.5 and still focused, suggest exit ramp (paired with StayAlert reframing).
 */
export function shouldTriggerHyperfocusGuard(estimated_min: number, actual_min: number): boolean {
  if (estimated_min <= 0) return false;
  return actual_min >= estimated_min * 1.5;
}

export const advocateMeta = {
  id: "04-timely" as const,
  role: "Time Visibility — Time Blindness",
  trait: "Time Blindness (very high)",
  system: "System 2 TIME" as const,
  pipeline: "World >> Fusion >> App (1:20)" as const,
  upstream: "https://github.com/NeuroLift-Technologies/neurolift-ai-fusion",
};

/**
 * DumpBar — MemoryMate external dump — "I'll remember later"
 *
 * Capture bar that externalizes working memory so brain can detach and return to micro-step.
 * Supplements all 3 systems: START (dump intrusive idea), TIME (detach from previous thing), TOP3 (Later park).
 * Tailwind + React. Functional MVP v0.1 with local persistence (nlt-mvp:dumps) via MemoryMate.
 *
 * @see src/advocates/05-memoryMate/index.ts — captureDump(), hydrateDumps(), listDumps()
 */
"use client";

import * as React from "react";
import { captureDump, listDumps, hydrateDumps } from "../advocates/05-memoryMate";
import type { DumpEntry } from "../advocates/05-memoryMate";

export interface DumpBarProps {
  /** Optional: notify parent when a dump is captured (for MVP page coordination) */
  onCapture?: (entry: DumpEntry) => void;
  /** Optional: move dump to Top3 (MVP page will convert dump text → TaskCandidate) */
  onMoveToTop3?: (entry: DumpEntry) => void;
  placeholder?: string;
  /** Controlled dumps (if provided, component uses this instead of internal state) */
  dumps?: DumpEntry[];
}

export function DumpBar({
  onCapture,
  onMoveToTop3,
  placeholder = "Capture idea you'll lose — brain dump before you forget…",
  dumps: controlledDumps,
}: DumpBarProps) {
  const [text, setText] = React.useState("");
  const [justSaved, setJustSaved] = React.useState(false);
  const [internalDumps, setInternalDumps] = React.useState<DumpEntry[]>([]);

  const dumps = controlledDumps ?? internalDumps;

  const refresh = React.useCallback(() => {
    try {
      const list = listDumps(20);
      setInternalDumps(list);
    } catch {
      // storage unavailable — keep internal
    }
  }, []);

  React.useEffect(() => {
    // Hydrate from localStorage (MemoryMate encrypted at-rest) on mount
    try {
      hydrateDumps();
      refresh();
    } catch { /* ignore */ }
  }, [refresh]);

  const handleCapture = React.useCallback(() => {
    const v = text.trim();
    if (!v) return;
    try {
      const entry = captureDump(v, "manual");
      if (!controlledDumps) {
        setInternalDumps((prev) => [entry, ...prev].slice(0, 20));
      } else {
        refresh();
      }
      if (onCapture) onCapture(entry);
    } catch {
      // capture failed — still clear input to avoid double save
    }
    setText("");
    setJustSaved(true);
    window.setTimeout(() => setJustSaved(false), 1800);
  }, [text, onCapture, controlledDumps, refresh]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleCapture();
    if (e.key === "Escape") setText("");
  };

  return (
    <div className="w-full max-w-xl rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">MemoryMate · External Dump</span>
        <span className="text-[11px] text-muted-foreground">{dumps.length} captured</span>
      </div>
      <div className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          aria-label="Capture to remember later"
          className="flex-1 rounded-xl border border-input bg-background px-3 py-3 text-sm placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          type="button"
          onClick={handleCapture}
          disabled={!text.trim()}
          className="shrink-0 rounded-xl bg-brand-600 px-5 py-3 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-40 transition-colors min-h-[44px]"
        >
          Remember later
        </button>
      </div>
      {justSaved ? <p className="mt-2 text-xs text-green-600">Captured — I&apos;ll remember later. Back to your micro-step.</p> : null}
      {dumps.length > 0 && (
        <ul className="mt-4 space-y-2 max-h-[220px] overflow-auto pr-1">
          {dumps.slice(0, 8).map((d) => (
            <li key={d.id} className="flex items-start justify-between gap-2 rounded-lg border border-border/60 bg-muted/30 px-3 py-2">
              <span className="min-w-0 flex-1 truncate text-sm" title={d.text}>{d.text}</span>
              {onMoveToTop3 ? (
                <button
                  type="button"
                  onClick={() => onMoveToTop3(d)}
                  className="shrink-0 rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium hover:bg-accent transition-colors"
                >
                  Move to Top3
                </button>
              ) : null}
              <span className="shrink-0 text-[11px] text-muted-foreground">{new Date(d.capturedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-2 text-[11px] text-muted-foreground">Enter to save · Esc to clear · Persists to localStorage (nlt-mvp:dumps) for daily use.</p>
    </div>
  );
}

export default DumpBar;

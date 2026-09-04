/**
 * DumpBar — MemoryMate external dump — "I'll remember later"
 *
 * Capture bar that externalizes working memory so brain can detach and return to micro-step.
 * Supplements all 3 systems: START (dump intrusive idea), TIME (detach from previous thing), TOP3 (Later park).
 * Tailwind + React.
 *
 * @see src/advocates/05-memoryMate/index.ts — captureDump()
 * TODO: persist to D1/KV via A2A (currently in-memory stub) + surface Later count in Top3View
 */
import * as React from "react";

export interface DumpBarProps {
  onCapture: (text: string) => void;
  placeholder?: string;
}

export function DumpBar({ onCapture, placeholder = "Brain dump — I'll remember later… (idea, don't forget, later)" }: DumpBarProps) {
  const [text, setText] = React.useState("");
  const [justSaved, setJustSaved] = React.useState(false);

  const handleCapture = () => {
    const v = text.trim();
    if (!v) return;
    onCapture(v);
    setText("");
    setJustSaved(true);
    window.setTimeout(() => setJustSaved(false), 1800);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleCapture();
    if (e.key === "Escape") setText("");
  };

  return (
    <div className="w-full max-w-xl rounded-2xl border border-border bg-card p-4">
      <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">MemoryMate · External Dump</div>
      <div className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          aria-label="Capture to remember later"
          className="flex-1 rounded-xl border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground/70"
        />
        <button
          type="button"
          onClick={handleCapture}
          disabled={!text.trim()}
          className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-40 transition-colors"
        >
          Remember later
        </button>
      </div>
      {justSaved ? <p className="mt-2 text-xs text-green-600">Captured — I&apos;ll remember later. Back to your micro-step.</p> : null}
      <p className="mt-2 text-[11px] text-muted-foreground">Enter to save · Esc to clear · TODO: wire captureDump() → PlannerPro Later.</p>
    </div>
  );
}

export default DumpBar;

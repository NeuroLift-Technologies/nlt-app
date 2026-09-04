"use client";
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center">
      <h2 className="text-2xl font-semibold">Something went wrong</h2>
      <p className="text-sm text-muted-foreground mt-2">{error.message || "Unexpected error"}</p>
      <button type="button" onClick={reset} className="mt-4 rounded-lg bg-brand-600 px-4 py-2 text-sm text-white">Try again</button>
    </div>
  );
}

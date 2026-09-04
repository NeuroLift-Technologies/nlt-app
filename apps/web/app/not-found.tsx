export default function NotFound() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center">
      <h2 className="text-2xl font-semibold">Not found</h2>
      <p className="text-sm text-muted-foreground mt-2">The page you requested could not be found.</p>
      <a href="/" className="mt-4 text-sm text-brand-600 hover:underline">Go home</a>
    </div>
  );
}

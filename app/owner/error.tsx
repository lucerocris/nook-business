"use client";

export default function OwnerError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
      <h1 className="text-2xl font-semibold text-foreground">
        Something went wrong
      </h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        We couldn&apos;t load this page. Please try again — if it keeps
        happening, contact the Nook team.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
      >
        Try again
      </button>
    </div>
  );
}

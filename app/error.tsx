"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="nk-container flex min-h-[70vh] flex-col items-start justify-center bg-white pb-16 pt-32">
      <p className="text-[14px] font-medium text-[var(--nk-muted)]">
        Something went wrong
      </p>
      <h1 className="nk-h2 mt-4 max-w-[16ch] border-b border-[var(--nk-ink)] pb-6">
        We hit a snag.
      </h1>
      <p className="mt-6 max-w-[48ch] text-[16px] leading-relaxed text-[var(--nk-body)]">
        An unexpected error occurred. Please try again — if it keeps happening,
        contact the Nook team.
      </p>
      <button
        type="button"
        onClick={reset}
        className="nk-btn nk-btn-primary mt-8 min-h-11"
      >
        Try again
      </button>
    </main>
  );
}

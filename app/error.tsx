"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 pt-24 pb-12 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#3A5A40]">
        Something went wrong
      </p>
      <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
        We hit a snag
      </h1>
      <p className="mt-3 max-w-md text-sm text-gray-600">
        An unexpected error occurred. Please try again — if it keeps happening,
        contact the Nook team.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-7 inline-flex items-center justify-center min-h-11 rounded-full bg-[#3A5A40] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#2f4833]"
      >
        Try again
      </button>
    </div>
  );
}

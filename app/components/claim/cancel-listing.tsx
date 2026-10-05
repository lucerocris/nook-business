"use client";

import { useState, useTransition } from "react";
import { withdrawListing } from "@/actions/listings";

// Under a new listing on /claim/status: cancel it and start again, e.g. after
// a typo in the Instagram handle. Asks first, since the code stops working.
export function CancelListing({ claimId, cafeName }: { claimId: string; cafeName: string }) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const cancel = () => {
    setError(null);
    startTransition(async () => {
      // Redirects to the form on success; a value back means it didn't happen.
      const result = await withdrawListing(claimId);
      if (result?.error) {
        setConfirming(false);
        setError(result.error);
      }
    });
  };

  return (
    <div className="mt-5 text-[13px] leading-relaxed text-[var(--nk-muted)]">
      {confirming ? (
        <div className="rounded-xl border border-[var(--nk-line)] px-4 py-3">
          <p>
            Cancel <span className="font-semibold text-[var(--nk-ink)]">{cafeName}</span>? Its
            code stops working and you can add it again with the right details.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={cancel}
              disabled={pending}
              className="nk-btn min-h-10 border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending ? "Cancelling…" : "Yes, cancel and start again"}
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              disabled={pending}
              className="nk-btn nk-btn-secondary min-h-10 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Keep it
            </button>
          </div>
        </div>
      ) : (
        <p>
          Made a mistake, like the wrong Instagram handle?{" "}
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="min-h-6 font-semibold text-[var(--nk-ink)] underline underline-offset-4"
          >
            Cancel this listing
          </button>
        </p>
      )}
      {error ? (
        <p role="alert" className="mt-2 text-[#b94a48]">
          {error}
        </p>
      ) : null}
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { startClaim, withdrawClaim } from "@/actions/claims";

type ClaimRecord = {
  id: string;
  verification_code: string | null;
  status: string;
};

type ClaimFormProps = {
  cafeId: string;
  cafeName: string;
  initialClaim: ClaimRecord | null;
};

export function ClaimForm({ cafeId, cafeName, initialClaim }: ClaimFormProps) {
  const [claim, setClaim] = useState<ClaimRecord | null>(initialClaim);
  const [error, setError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const [isPending, startTransition] = useTransition();

  const codeValue = claim?.verification_code ?? "";

  const handleStart = async () => {
    setError(null);
    setIsStarting(true);
    try {
      const result = await startClaim({ cafeId, role: "owner" });
      if ("error" in result) {
        setError(result.error);
        return;
      }
      setClaim(result.claim);
    } finally {
      setIsStarting(false);
    }
  };

  const handleCopy = async () => {
    if (!codeValue || typeof navigator === "undefined") return;
    setIsCopying(true);
    try {
      await navigator.clipboard.writeText(codeValue);
    } finally {
      setIsCopying(false);
    }
  };

  const handleWithdraw = () => {
    if (!claim?.id) return;
    setError(null);
    startTransition(async () => {
      // On success this redirects; a returned value means it didn't happen
      // (e.g. the team already moved the claim to review, which RLS locks).
      const result = await withdrawClaim(claim.id);
      if (result && "error" in result) {
        setConfirmingCancel(false);
        setError(
          claim.status === "pending"
            ? result.error
            : "This claim is already being reviewed, so it can't be cancelled here. Message us on Instagram at @nook_cafefinder."
        );
      }
    });
  };

  // No claim yet — show an explicit confirm step (creating the claim is a
  // deliberate action, not a page-load side effect).
  if (!claim) {
    return (
      <div className="w-full max-w-3xl">
        <div className="border-t border-[var(--nk-ink)] pt-8">
          <p className="text-[14px] font-medium text-[var(--nk-muted)]">
            Claim verification
          </p>
          <h1 className="nk-h2 mt-4 max-w-[18ch]">
            Claim {cafeName}
          </h1>
          <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-[var(--nk-body)]">
            Confirm to generate a verification code. You&apos;ll then DM it to us
            on Instagram from{" "}
            <span className="font-semibold">{cafeName}</span>&apos;s official
            account so our team can approve your claim.
          </p>

          {error && (
            <p className="mt-4 text-sm font-semibold text-red-600">{error}</p>
          )}

          <button
            type="button"
            onClick={handleStart}
            disabled={isStarting}
            className="mt-7 inline-flex items-center justify-center min-h-11 rounded-full bg-[#3A5A40] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#2f4833] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isStarting ? "Setting up…" : "Confirm & get code"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl">
      <div className="border-t border-[var(--nk-ink)] pt-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[14px] font-medium text-[var(--nk-muted)]">
              Claim verification
            </p>
            <h1 className="nk-h2 mt-4 max-w-[18ch]">
              Your claim is being reviewed
            </h1>
            <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-[var(--nk-body)]">
              Send us a DM on Instagram with the verification code below to
              confirm ownership of{" "}
              <span className="font-semibold">{cafeName}</span>.
              <span className="block mt-2 font-semibold text-red-600">
                Important: The message must be sent from the cafe&apos;s official
                Instagram account. Personal accounts will not be accepted for
                verification.
              </span>
            </p>
          </div>
          <span className="inline-flex items-center rounded-full border border-[#3A5A40]/15 bg-[#e3ebe4]/40 px-3 py-1 text-xs font-semibold text-[#3A5A40]">
            Pending verification
          </span>
        </div>

        <div className="mt-9 flex flex-col gap-5">
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-[2px] border border-[var(--nk-line)] bg-[var(--nk-bg-2)] px-6 py-4 font-mono text-2xl font-semibold tracking-[0.3em] text-[var(--nk-ink)]">
              {codeValue || "----"}
            </div>
            <button
              type="button"
              onClick={handleCopy}
              disabled={!codeValue || isCopying}
              className="inline-flex items-center justify-center rounded-full border border-[#d4d4d0] px-5 py-3 text-sm font-semibold text-[#101514] transition hover:border-[#3A5A40] hover:text-[#3A5A40] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isCopying ? "Copied" : "Copy code"}
            </button>
          </div>

          <a
            href="https://instagram.com/nook_cafefinder"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center min-h-11 rounded-full bg-[#3A5A40] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#2f4833]"
          >
            DM us on Instagram @nook_cafefinder
          </a>

          <p className="text-sm text-[#6b6b6b]">
            This code expires in 7 days. Come back to this page anytime to check
            your status.
          </p>

          {confirmingCancel ? (
            <div className="flex flex-col gap-2">
              <p className="text-sm text-[#3b3b3b]">
                Cancel your claim for{" "}
                <span className="font-semibold">{cafeName}</span>? You&apos;ll
                have to start the claim over.
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleWithdraw}
                  disabled={isPending}
                  className="inline-flex items-center justify-center rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isPending ? "Cancelling…" : "Yes, cancel claim"}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmingCancel(false)}
                  disabled={isPending}
                  className="inline-flex items-center justify-center rounded-full border border-[#d4d4d0] px-5 py-2 text-sm font-semibold text-[#101514] transition hover:border-[#3A5A40] hover:text-[#3A5A40] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Keep my claim
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmingCancel(true)}
              className="text-left text-sm font-semibold text-[#6b6b6b] transition hover:text-[#3A5A40]"
            >
              Cancel this claim
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

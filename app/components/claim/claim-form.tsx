"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { startClaim, withdrawClaim } from "@/actions/claims";
import { FunnelSpread } from "@/app/components/funnel-shell";

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
  const [isCopied, setIsCopied] = useState(false);
  const copiedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
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

  useEffect(() => {
    return () => {
      if (copiedTimer.current) clearTimeout(copiedTimer.current);
    };
  }, []);

  const handleCopy = async () => {
    if (!codeValue || typeof navigator === "undefined") return;
    try {
      await navigator.clipboard.writeText(codeValue);
      setError(null);
      setIsCopied(true);
      if (copiedTimer.current) clearTimeout(copiedTimer.current);
      copiedTimer.current = setTimeout(() => setIsCopied(false), 2000);
    } catch {
      setError("Couldn't copy the code. Select it and copy it manually.");
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
      <FunnelSpread
        stage={1}
        title={`Claim ${cafeName}.`}
        lead={
          <>
            Confirm to get a verification code. You&apos;ll DM it to us on
            Instagram from <span className="font-semibold">{cafeName}</span>
            &apos;s official account, and we&apos;ll approve your claim.
          </>
        }
      >
        {error && (
          <p role="alert" className="mb-4 text-sm font-medium text-[#b94a48]">
            {error}
          </p>
        )}
        <button
          type="button"
          onClick={handleStart}
          disabled={isStarting}
          className="nk-btn nk-btn-primary min-h-11 w-full disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isStarting ? "Setting up…" : "Confirm & get code"}
        </button>
      </FunnelSpread>
    );
  }

  return (
    <FunnelSpread
      stage={2}
      title="Send us your code."
      lead={
        <>
          DM this code to @nook_cafefinder from{" "}
          <span className="font-semibold">{cafeName}</span>&apos;s official
          Instagram account. Messages from personal accounts can&apos;t verify
          a claim.
        </>
      }
      aside={
        confirmingCancel ? (
          <div className="flex flex-col items-center gap-3">
            <p>
              Cancel your claim for{" "}
              <span className="font-semibold text-[var(--nk-ink)]">{cafeName}</span>?
              You&apos;ll have to start over.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={handleWithdraw}
                disabled={isPending}
                className="nk-btn min-h-10 border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPending ? "Cancelling…" : "Yes, cancel claim"}
              </button>
              <button
                type="button"
                onClick={() => setConfirmingCancel(false)}
                disabled={isPending}
                className="nk-btn nk-btn-secondary min-h-10 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Keep my claim
              </button>
            </div>
          </div>
        ) : (
          <>
            The code expires in 7 days.{" "}
            <button
              type="button"
              onClick={() => setConfirmingCancel(true)}
              className="font-semibold text-[var(--nk-muted)] underline-offset-4 hover:text-[var(--nk-ink)] hover:underline"
            >
              Cancel this claim
            </button>
          </>
        )
      }
    >
      <div className="flex items-stretch gap-2">
        <div className="flex-1 rounded-xl bg-[var(--nk-bg-2)] px-4 py-4 text-center font-mono text-2xl font-semibold tracking-[0.3em] text-[var(--nk-ink)]">
          {codeValue || "------"}
        </div>
        <button
          type="button"
          onClick={handleCopy}
          disabled={!codeValue}
          aria-live="polite"
          className="nk-btn nk-btn-secondary h-auto shrink-0 rounded-xl disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isCopied ? "Copied" : "Copy"}
        </button>
      </div>

      {error && (
        <p role="alert" className="mt-4 text-sm font-medium text-[#b94a48]">
          {error}
        </p>
      )}

      <a
        href="https://instagram.com/nook_cafefinder"
        target="_blank"
        rel="noreferrer"
        className="nk-btn nk-btn-primary mt-4 min-h-11 w-full"
      >
        Open Instagram to send it
      </a>
      <p className="mt-3 text-center text-[13px] text-[var(--nk-muted)]">
        We&apos;ve emailed you this code too. We review claims within 1–2
        working days of your message.
      </p>
    </FunnelSpread>
  );
}

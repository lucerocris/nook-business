"use client";

import { useState, useTransition } from "react";
import { withdrawClaim } from "@/actions/claims";

type ClaimRecord = {
  id: string;
  verification_code: string | null;
  status: string;
};

type ClaimFormProps = {
  cafeName: string;
  claim: ClaimRecord | null;
  error: string | null;
};

export function ClaimForm({ cafeName, claim, error }: ClaimFormProps) {
  const [isCopying, setIsCopying] = useState(false);
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const [isPending, startTransition] = useTransition();

  const codeValue = claim?.verification_code ?? "";

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
    startTransition(() => {
      void withdrawClaim(claim.id);
    });
  };

  if (error || !claim) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="rounded-[2rem] border border-red-200 bg-red-50 p-8 text-red-700 shadow-[0_20px_60px_rgba(220,38,38,0.15)]">
          <p className="text-sm font-semibold">
            {error ?? "We couldn't set up your claim. Please try again."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="rounded-[2rem] border border-white/80 bg-white/90 p-7 shadow-[0_24px_80px_rgba(15,23,42,0.09)] backdrop-blur-sm sm:p-10">
        <div className="animate-funnel-fade flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#3A5A40]">
              Claim verification
            </p>
            <h1 className="mt-3 text-balance font-display text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
              Your claim is being reviewed
            </h1>
            <p className="mt-3 max-w-xl text-sm text-gray-600 sm:text-base">
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
          <span className="inline-flex items-center rounded-full border border-[#3A5A40]/15 bg-[#F7FAF7] px-3 py-1 text-xs font-semibold text-[#3A5A40]">
            Pending verification
          </span>
        </div>

        <div className="animate-funnel-rise funnel-delay-1 mt-9 flex flex-col gap-5">
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-2xl border border-[#3A5A40]/15 bg-[#F7FAF7] px-6 py-4 font-mono text-2xl font-semibold tracking-[0.3em] text-gray-900 shadow-inner shadow-[#3A5A40]/5">
              {codeValue || "----"}
            </div>
            <button
              type="button"
              onClick={handleCopy}
              disabled={!codeValue || isCopying}
              className="inline-flex items-center justify-center rounded-xl border border-[#3A5A40]/20 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:border-[#3A5A40] hover:text-[#3A5A40] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isCopying ? "Copied" : "Copy code"}
            </button>
          </div>

          <a
            href="https://instagram.com/nook_cafefinder"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-xl bg-[#3A5A40] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_16px_35px_rgba(58,90,64,0.3)] transition hover:-translate-y-0.5 hover:bg-[#2f4a35]"
          >
            DM us on Instagram @nook_cafefinder
          </a>

          <p className="text-sm text-gray-500">
            This code expires in 7 days. Come back to this page anytime to check
            your status.
          </p>

          {confirmingCancel ? (
            <div className="flex flex-col gap-2">
              <p className="text-sm text-gray-600">
                Cancel your claim for{" "}
                <span className="font-semibold">{cafeName}</span>? You&apos;ll
                have to start the claim over.
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleWithdraw}
                  disabled={isPending}
                  className="inline-flex items-center justify-center rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isPending ? "Cancelling…" : "Yes, cancel claim"}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmingCancel(false)}
                  disabled={isPending}
                  className="inline-flex items-center justify-center rounded-xl border border-[#3A5A40]/20 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-[#3A5A40] hover:text-[#3A5A40] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Keep my claim
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmingCancel(true)}
              className="text-left text-sm font-semibold text-gray-500 transition hover:text-[#3A5A40]"
            >
              Cancel this claim
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

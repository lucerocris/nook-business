"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { initiateClaim, withdrawClaim } from "@/actions/claims";

type ClaimFormProps = {
  cafeId: string;
  cafeName: string;
  userId: string;
  existingClaim?: {
    id: string;
    verification_code: string | null;
    status: string;
  } | null;
};

type ClaimRecord = {
  id: string;
  verification_code: string | null;
  status: string;
};

export function ClaimForm({
  cafeId,
  cafeName,
  userId: _userId,
  existingClaim = null,
}: ClaimFormProps) {
  const [claim, setClaim] = useState<ClaimRecord | null>(existingClaim);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(!existingClaim);
  const [isCopying, setIsCopying] = useState(false);
  const [isPending, startTransition] = useTransition();

  const codeValue = useMemo(() => claim?.verification_code ?? "", [claim]);

  const fetchClaim = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    const result = await initiateClaim({ cafeId, role: "owner" });

    if ("error" in result) {
      setErrorMessage(result.error);
      setIsLoading(false);
      return;
    }

    setClaim(result.claim);
    setIsLoading(false);
  }, [cafeId]);

  useEffect(() => {
    if (existingClaim) {
      setIsLoading(false);
      return;
    }

    void fetchClaim();
  }, [existingClaim, fetchClaim]);

  const handleCopy = async () => {
    if (!codeValue || typeof navigator === "undefined") {
      return;
    }

    setIsCopying(true);

    try {
      await navigator.clipboard.writeText(codeValue);
    } finally {
      setIsCopying(false);
    }
  };

  const handleWithdraw = () => {
    if (!claim?.id) {
      return;
    }

    startTransition(() => {
      void withdrawClaim(claim.id);
    });
  };

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-3xl px-6 py-16">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold text-gray-700">
            Setting up your claim...
          </p>
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="mx-auto w-full max-w-3xl px-6 py-16">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-red-700 shadow-sm">
          <p className="text-sm font-semibold">{errorMessage}</p>
          <button
            type="button"
            onClick={fetchClaim}
            className="mt-4 inline-flex items-center justify-center rounded-md bg-[#3A5A40] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#2b442f]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-16">
      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-[#3A5A40]">
              Claim verification
            </p>
            <h1 className="mt-2 text-3xl font-bold text-gray-900">
              Your claim is being reviewed
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Send us a DM on Instagram with the code below to verify you own
              {" "}
              {cafeName}.
            </p>
          </div>
          <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
            Pending verification
          </span>
        </div>

        <div className="mt-8 flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-6 py-4 font-mono text-2xl font-semibold tracking-[0.3em] text-gray-900">
              {codeValue || "----"}
            </div>
            <button
              type="button"
              onClick={handleCopy}
              disabled={!codeValue || isCopying}
              className="inline-flex items-center justify-center rounded-md border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:border-[#3A5A40] hover:text-[#3A5A40] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isCopying ? "Copied" : "Copy code"}
            </button>
          </div>

          <a
            href="https://instagram.com/nookcafeph"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-md bg-[#3A5A40] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#2b442f]"
          >
            DM us on Instagram @nookcafeph
          </a>

          <p className="text-sm text-gray-500">
            This code expires in 7 days. Come back to this page anytime to
            check your status.
          </p>

          <button
            type="button"
            onClick={handleWithdraw}
            disabled={isPending}
            className="text-left text-sm font-semibold text-gray-500 transition hover:text-[#3A5A40] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Wrong cafe?
          </button>
        </div>
      </div>
    </div>
  );
}

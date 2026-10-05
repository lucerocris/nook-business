"use client";

import { useEffect, useRef, useState } from "react";

// ig.me/m/<handle> opens a DM thread with the account straight away (in the
// Instagram app on a phone), instead of the profile, where the owner still has
// to find Message.
const DM_URL = "https://ig.me/m/nook_cafefinder";

// The pending step of a claim or new listing on /claim/status: the code with a
// Copy button, a link straight into the DM, and when the code runs out.
export function CodeHandoff({
  code,
  expiresAt,
}: {
  code: string;
  expiresAt: string | null;
}) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopyError(false);
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopyError(true);
    }
  };

  const expires = expiresAt
    ? new Date(expiresAt).toLocaleDateString("en-PH", {
        month: "short",
        day: "numeric",
        timeZone: "Asia/Manila",
      })
    : null;

  return (
    <>
      <p>
        Copy this code, switch to your cafe&apos;s Instagram account, and send
        it to us in a DM. Messages from personal accounts can&apos;t verify a
        cafe.
      </p>
      <div className="mt-3 flex items-stretch gap-2">
        <p className="flex-1 rounded-xl bg-[var(--nk-bg-2)] px-4 py-3 text-center font-mono text-xl font-semibold tracking-[0.3em] text-[var(--nk-ink)]">
          {code}
        </p>
        <button
          type="button"
          onClick={copy}
          aria-live="polite"
          className="nk-btn nk-btn-secondary h-auto min-w-[5.5rem] shrink-0 rounded-xl"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      {copyError ? (
        <p role="alert" className="mt-2 text-[13px] text-[#b94a48]">
          Couldn&apos;t copy it. Press and hold the code to copy it instead.
        </p>
      ) : null}
      <a
        href={DM_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="nk-btn nk-btn-primary mt-3 min-h-11 w-full"
      >
        Message @nook_cafefinder
      </a>
      <p className="mt-3 text-[13px]">
        {expires ? <>Send it by {expires}. </> : null}
        Once it&apos;s in, this step changes to &ldquo;Under review&rdquo; and
        we email you when you&apos;re approved.
      </p>
    </>
  );
}

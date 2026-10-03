"use client";

import { Spinner } from "@/components/ui/spinner";
import { useState } from "react";
import { verifySignupOtp, resendSignupOtp } from "@/actions/auth";

type OtpConfirmFormProps = {
  email: string;
  redirectTo: string;
};

export function OtpConfirmForm({ email, redirectTo }: OtpConfirmFormProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const handleVerify = async (event: React.FormEvent) => {
    event.preventDefault();
    if (code.length < 6) return;

    setError(null);
    setInfo(null);
    setIsVerifying(true);

    // On success verifySignupOtp redirects, so navigation happens automatically
    // and we never read a result. We only get a value back on failure.
    const result = await verifySignupOtp(email, code, redirectTo);
    if (result?.error) {
      setError(result.error);
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    setError(null);
    setInfo(null);
    setIsResending(true);
    try {
      const result = await resendSignupOtp(email, redirectTo);
      if (result?.error) {
        setError(result.error);
      } else {
        setInfo("We sent a new code.");
      }
    } finally {
      setIsResending(false);
    }
  };

  return (
    <form onSubmit={handleVerify} className="flex flex-col items-start gap-4">
      <input
        id="signup-otp"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={10}
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
        placeholder="Enter code"
        aria-label="Verification code"
        className="w-full max-w-xs rounded-[2px] border border-[#d4d4d0] bg-white px-4 py-3 text-center font-mono text-xl tracking-[0.25em] text-[var(--nk-ink)] outline-none transition placeholder:text-base placeholder:tracking-normal placeholder:text-[#8a8a87] focus:border-[var(--nk-green)] focus:ring-2 focus:ring-[var(--nk-green)]/25"
      />

      {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
      {info && !error && <p className="text-sm font-medium text-[#3A5A40]">{info}</p>}

      <button
        type="submit"
        disabled={isVerifying || code.length < 6}
        className="inline-flex min-h-11 w-full max-w-xs items-center justify-center rounded-full bg-[var(--nk-green)] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--nk-green-hover)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isVerifying ? "Verifying..." : "Verify & continue"}
      </button>

      <button
        type="button"
        onClick={handleResend}
        disabled={isResending}
        className="text-sm font-semibold text-gray-500 transition hover:text-[#3A5A40] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isResending ? (
          <span className="inline-flex items-center gap-2">
            <Spinner className="size-3.5" />
            Sending…
          </span>
        ) : (
          "Didn't get a code? Resend"
        )}
      </button>
    </form>
  );
}

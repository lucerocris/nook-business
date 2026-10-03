import type { Metadata } from "next";
import { FunnelShell } from "@/app/components/funnel-shell";
import { OtpConfirmForm } from "@/components/auth/otp-confirm-form";
import { getSafeRedirect } from "@/lib/safe-redirect";

type RegisterConfirmPageProps = {
  searchParams?: Promise<{
    email?: string;
    redirect?: string;
  }>;
};

export const metadata: Metadata = { title: "Confirm your account" };

export default async function RegisterConfirmPage({
  searchParams,
}: RegisterConfirmPageProps) {
  const { email, redirect } = (await searchParams) ?? {};
  const trimmedEmail = email?.trim() ?? "";
  const redirectTo = getSafeRedirect(redirect);

  return (
    <FunnelShell contentClassName="max-w-4xl">
      <div className="mx-auto w-full max-w-2xl rounded-2xl bg-white p-6 text-center shadow-[0_12px_28px_rgba(0,0,0,0.08)] ring-1 ring-zinc-200/70 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#3A5A40]">
          Confirm your account
        </p>

        <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-[#101514] sm:text-4xl">
          Enter your code
        </h1>

        <p className="mx-auto mt-4 max-w-xl text-sm text-[#3b3b3b] sm:text-base">
          {trimmedEmail ? (
            <>
              We sent a verification code to{" "}
              <span className="font-semibold text-[#101514] break-words">{trimmedEmail}</span>.
            </>
          ) : (
            <>We sent a verification code to your email.</>
          )}{" "}
          Enter it below to finish setting up your account.
        </p>

        <OtpConfirmForm email={trimmedEmail} redirectTo={redirectTo} />
      </div>
    </FunnelShell>
  );
}

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
      <div className="mx-auto w-full max-w-2xl rounded-[2rem] border border-white/80 bg-white/90 p-8 text-center shadow-[0_24px_80px_rgba(15,23,42,0.09)] backdrop-blur-sm sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#3A5A40] animate-funnel-fade">
          Confirm your account
        </p>

        <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-gray-900 animate-funnel-rise funnel-delay-1 sm:text-4xl">
          Enter your code
        </h1>

        <p className="mx-auto mt-4 max-w-xl text-sm text-gray-600 animate-funnel-fade funnel-delay-2 sm:text-base">
          {trimmedEmail ? (
            <>
              We sent a verification code to{" "}
              <span className="font-semibold text-gray-900 break-words">{trimmedEmail}</span>.
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

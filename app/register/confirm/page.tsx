import type { Metadata } from "next";
import { FunnelShell, FunnelSpread } from "@/app/components/funnel-shell";
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
    <FunnelShell>
      <FunnelSpread
        label="Confirm your account"
        title="Enter your code."
        lead={
          <>
            {trimmedEmail ? (
              <>
                We sent a verification code to{" "}
                <span className="break-words font-semibold text-[var(--nk-ink)]">{trimmedEmail}</span>.
              </>
            ) : (
              <>We sent a verification code to your email.</>
            )}{" "}
            Enter it to finish setting up your account.
          </>
        }
      >
        <OtpConfirmForm email={trimmedEmail} redirectTo={redirectTo} />
      </FunnelSpread>
    </FunnelShell>
  );
}

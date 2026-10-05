import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LoginForm } from "@/components/auth/login-form";
import { GoogleAuthButton } from "@/components/auth/google-auth-button";
import { FunnelShell, FunnelSpread } from "@/app/components/funnel-shell";
import { getSafeRedirect } from "@/lib/safe-redirect";

type LoginPageProps = {
  searchParams?: Promise<{
    redirect?: string;
    error?: string;
  }>;
};

// app/auth/confirm/route.ts redirects here with ?error=confirmation_failed when
// an email confirmation link is expired or already used. Nothing read the param,
// so the owner landed on a blank login form, tried their password, and got
// "Invalid email or password" because the account was never confirmed.
const ERROR_MESSAGES: Record<string, string> = {
  confirmation_failed:
    "That confirmation link has expired or was already used. Log in below and we'll send you a new one.",
  oauth_failed:
    "Google sign-in didn't complete. Please try again.",
};

export const metadata: Metadata = { title: "Log in" }

export default async function LoginPage({
  searchParams,
}: LoginPageProps) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { redirect: redirectParam, error: errorParam } =
    (await searchParams) ?? {};
  const redirectTo = getSafeRedirect(redirectParam);
  const errorMessage = errorParam ? ERROR_MESSAGES[errorParam] : undefined;

  if (user) {
    redirect(redirectTo);
  }

  return (
    <FunnelShell>
      <FunnelSpread
        stage={
          redirectTo.startsWith("/claim/") && !redirectTo.startsWith("/claim/status")
            ? 1
            : undefined
        }
        firstStageLabel={redirectTo.startsWith("/claim/new") ? "Add your cafe" : undefined}
        title="Welcome back."
        lead={
          redirectTo.startsWith("/claim/new")
            ? "Log in, then add your cafe's address and Instagram."
            : "Log in to manage your cafe's listing and check on your claims."
        }
      >
        <div>
          {errorMessage ? (
            <p role="alert" className="mb-6 rounded-lg border border-[#E0AB38]/60 bg-[#E0AB38]/10 px-4 py-3 text-sm text-[#5c3d00]">
              {errorMessage}
            </p>
          ) : null}
          <GoogleAuthButton redirectTo={redirectTo} label="Log in with Google" />
          <LoginForm redirectTo={redirectTo} />
        </div>
      </FunnelSpread>
    </FunnelShell>
  );
}

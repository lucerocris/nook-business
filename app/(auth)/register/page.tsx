import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RegisterForm } from "@/components/auth/register-form";
import { GoogleAuthButton } from "@/components/auth/google-auth-button";
import { FunnelShell, FunnelSpread } from "@/app/components/funnel-shell";
import { getSafeRedirect } from "@/lib/safe-redirect";

type RegisterPageProps = {
  searchParams?: Promise<{
    redirect?: string;
  }>;
};

export const metadata: Metadata = { title: "Create account" }

export default async function RegisterPage({
  searchParams,
}: RegisterPageProps) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { redirect: redirectParam } = (await searchParams) ?? {};
  const redirectTo = getSafeRedirect(redirectParam);

  if (user) {
    redirect(redirectTo);
  }

  // Mid-funnel (sent here from /claim/new or a claim), keep the strip and say
  // what comes after the account, so sign-up reads as a step, not a detour.
  const addingCafe = redirectTo.startsWith("/claim/new");
  const claiming =
    !addingCafe &&
    redirectTo.startsWith("/claim/") &&
    !redirectTo.startsWith("/claim/status");

  return (
    <FunnelShell>
      <FunnelSpread
        stage={addingCafe || claiming ? 1 : undefined}
        firstStageLabel={addingCafe ? "Add your cafe" : undefined}
        title="Create your account."
        lead={
          addingCafe
            ? "Free for cafe owners. Next, you'll add your cafe's address and Instagram."
            : "Free for cafe owners. You'll use it to claim your cafe and keep its hours, menu and photos right."
        }
      >
        <div>
          <GoogleAuthButton redirectTo={redirectTo} label="Sign up with Google" />
          <RegisterForm redirectTo={redirectTo} />
        </div>
      </FunnelSpread>
    </FunnelShell>
  );
}

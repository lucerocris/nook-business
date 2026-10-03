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

  return (
    <FunnelShell>
      <FunnelSpread
        label="New owner account"
        title="Create your account."
        lead="Free for cafe owners. You'll use it to claim your cafe and keep its hours, menu and photos right."
      >
        <div className="max-w-md">
          <GoogleAuthButton redirectTo={redirectTo} label="Sign up with Google" />
          <RegisterForm redirectTo={redirectTo} />
        </div>
      </FunnelSpread>
    </FunnelShell>
  );
}

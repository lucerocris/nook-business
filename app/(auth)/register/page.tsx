import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RegisterForm } from "@/components/auth/register-form";
import { GoogleAuthButton } from "@/components/auth/google-auth-button";
import { FunnelShell } from "@/app/components/funnel-shell";
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
    <FunnelShell contentClassName="max-w-4xl">
      <div className="mx-auto w-full max-w-2xl rounded-2xl bg-white p-6 shadow-[0_12px_28px_rgba(0,0,0,0.08)] ring-1 ring-zinc-200/70 sm:p-8">
        <div className="flex justify-center">
          <img src="https://lucerocris.sgp1.cdn.digitaloceanspaces.com/nook-sites/logo.svg" alt="Nook" className="h-9 w-auto" />
        </div>

        <p className="mt-6 text-center text-xs font-semibold uppercase tracking-[0.3em] text-[#3A5A40]">
          New owner profile
        </p>

        <h1 className="mt-3 text-center font-display text-3xl font-semibold tracking-tight text-[#101514] sm:text-4xl">
          Create your account
        </h1>

        <p className="mx-auto mt-3 max-w-lg text-center text-sm text-[#3b3b3b] sm:text-base">
          Manage your cafe and stay connected with customers on Nook.
        </p>

        <GoogleAuthButton redirectTo={redirectTo} label="Sign up with Google" />

        <RegisterForm redirectTo={redirectTo} />
      </div>
    </FunnelShell>
  );
}

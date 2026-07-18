import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LoginForm } from "@/components/auth/login-form";
import { FunnelShell } from "@/app/components/funnel-shell";
import { getSafeRedirect } from "@/lib/safe-redirect";

type LoginPageProps = {
  searchParams?: Promise<{
    redirect?: string;
  }>;
};

export const metadata: Metadata = { title: "Log in" }

export default async function LoginPage({
  searchParams,
}: LoginPageProps) {
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
      <div className="mx-auto w-full max-w-2xl rounded-[2rem] border border-white/80 bg-white/90 p-7 shadow-[0_24px_80px_rgba(15,23,42,0.09)] backdrop-blur-sm sm:p-10">
        <div className="flex justify-center animate-funnel-fade">
          <img src="https://lucerocris.sgp1.cdn.digitaloceanspaces.com/nook-sites/logo.svg" alt="Nook" className="h-9 w-auto" />
        </div>

        <p className="mt-6 text-center text-xs font-semibold uppercase tracking-[0.3em] text-[#3A5A40] animate-funnel-fade funnel-delay-1">
          Owner account
        </p>

        <h1 className="mt-3 text-center font-display text-3xl font-semibold tracking-tight text-gray-900 animate-funnel-rise funnel-delay-2 sm:text-4xl">
          Welcome back
        </h1>

        <p className="mx-auto mt-3 max-w-lg text-center text-sm text-gray-600 animate-funnel-fade funnel-delay-3 sm:text-base">
          Log in to manage your listings and respond to claims.
        </p>

        <LoginForm redirectTo={redirectTo} />
      </div>
    </FunnelShell>
  );
}

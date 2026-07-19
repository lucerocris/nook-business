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
      {/* Card chrome now matches the webapp: rounded-2xl (16px, not 32px), a
          hairline zinc ring instead of a translucent white border, and the
          standard 0_12px_28px card shadow instead of an 80px-blur drop. */}
      <div className="mx-auto w-full max-w-md rounded-2xl bg-white p-6 shadow-[0_12px_28px_rgba(0,0,0,0.08)] ring-1 ring-zinc-200/70 sm:max-w-lg sm:p-8">
        <div className="flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://lucerocris.sgp1.cdn.digitaloceanspaces.com/nook-sites/logo.svg"
            alt="Nook"
            className="h-8 w-auto sm:h-9"
          />
        </div>

        <p className="mt-5 text-center text-[11px] font-semibold uppercase tracking-[0.3em] text-[#3A5A40] sm:mt-6 sm:text-xs">
          Owner account
        </p>

        <h1 className="mt-3 text-center font-display text-2xl font-semibold tracking-[-0.02em] text-[#101514] sm:text-3xl">
          Welcome back
        </h1>

        <p className="mx-auto mt-2 max-w-sm text-center text-sm text-[#3b3b3b] sm:mt-3">
          Log in to manage your listings and respond to claims.
        </p>

        <LoginForm redirectTo={redirectTo} />
      </div>
    </FunnelShell>
  );
}

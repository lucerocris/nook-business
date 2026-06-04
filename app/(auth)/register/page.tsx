import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RegisterForm } from "@/components/auth/register-form";
import { FunnelShell } from "@/app/components/funnel-shell";

type RegisterPageProps = {
  searchParams?: Promise<{
    redirect?: string;
  }>;
};

const getSafeRedirect = (value?: string) =>
  value?.startsWith("/") ? value : "/";

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
      <div className="mx-auto w-full max-w-2xl rounded-[2rem] border border-white/80 bg-white/90 p-7 shadow-[0_24px_80px_rgba(15,23,42,0.09)] backdrop-blur-sm sm:p-10">
        <div className="flex justify-center animate-funnel-fade">
          <img src="/logo.svg" alt="Nook" className="h-9 w-auto" />
        </div>

        <p className="mt-6 text-center text-xs font-semibold uppercase tracking-[0.3em] text-[#3A5A40] animate-funnel-fade funnel-delay-1">
          New owner profile
        </p>

        <h1 className="mt-3 text-center font-display text-3xl font-semibold tracking-tight text-gray-900 animate-funnel-rise funnel-delay-2 sm:text-4xl">
          Create your account
        </h1>

        <p className="mx-auto mt-3 max-w-lg text-center text-sm text-gray-600 animate-funnel-fade funnel-delay-3 sm:text-base">
          Manage your cafe and stay connected with customers on Nook.
        </p>

        <RegisterForm redirectTo={redirectTo} />
      </div>
    </FunnelShell>
  );
}

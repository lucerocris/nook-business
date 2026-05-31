import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LoginForm } from "@/components/auth/login-form";

type LoginPageProps = {
  searchParams?: Promise<{
    redirect?: string;
  }>;
};

const getSafeRedirect = (value?: string) => {
  if (value?.startsWith("/")) {
    return value;
  }

  return "/";
};

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
    <div className="flex min-h-[calc(100vh-72px)] items-center justify-center bg-white px-6 py-16">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-10 shadow-sm">
        <div className="flex justify-center">
          <img src="/logo.svg" alt="Nook" className="h-10 w-auto" />
        </div>

        <h1 className="mt-6 text-2xl font-bold text-gray-900">
          Welcome back
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Log in to manage your listings and respond to claims.
        </p>

        <LoginForm redirectTo={redirectTo} />
      </div>
    </div>
  );
}
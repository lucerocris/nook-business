import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RegisterForm } from "@/components/auth/register-form";

type RegisterPageProps = {
  searchParams?: Promise<{ redirect?: string }>;
};

const getSafeRedirect = (value?: string) => (value?.startsWith("/") ? value : "/dashboard");

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();
  const { redirect: redirectParam } = (await searchParams) ?? {};
  const redirectTo = getSafeRedirect(redirectParam);

  if (user) redirect(redirectTo);

  return (
    <div className="flex min-h-[calc(100vh-72px)] items-center justify-center bg-white px-6 py-16">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-10 shadow-sm">
 
        <h1 className="mt-6 text-2xl font-bold text-gray-900 text-center">Create your account</h1>
        <p className="mt-2 text-sm text-gray-500 text-center">
          Manage your cafe and stay connected with customers on Nook.
        </p>
        <RegisterForm redirectTo={redirectTo} />
      </div>
    </div>
  );
}
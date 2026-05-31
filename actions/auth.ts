"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type AuthResult =
  | {
      error: string;
    }
  | null;

const getSafeRedirect = (redirectTo?: string) => {
  return redirectTo?.startsWith("/") ? redirectTo : "/";
};

export async function signUp(
  formData: FormData,
  redirectTo?: string
): Promise<AuthResult> {
  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!fullName || !email || !password) {
    return { error: "Please fill out all required fields." };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm`,
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) {
    return {
      error: error.message || "Unable to create account.",
    };
  }

  const emailParam = email
    ? `?email=${encodeURIComponent(email)}`
    : "";

  redirect(`/register/confirm${emailParam}`);
}

export async function signIn(
  formData: FormData,
  redirectTo?: string
): Promise<AuthResult> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return {
      error: "Please enter your email and password.",
    };
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return {
      error: "Invalid email or password.",
    };
  }

  redirect(getSafeRedirect(redirectTo));
}
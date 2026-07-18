"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { getSafeRedirect } from "@/lib/safe-redirect";

type AuthResult =
  | {
      error: string;
    }
  | null;

// Absolute base URL for email links: prefer the configured site URL, fall back
// to the request's own origin so confirmation links aren't "undefined/..." when
// NEXT_PUBLIC_SITE_URL is unset.
async function getBaseUrl(): Promise<string> {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (envUrl) return envUrl.replace(/\/+$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  return host ? `${proto}://${host}` : "";
}

export async function signUp(
  formData: FormData,
  redirectTo?: string
): Promise<AuthResult> {
  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!fullName || !email || !password) {
    return {
      error: "Please fill out all required fields.",
    };
  }

  if (password.length < 8) {
    return {
      error: "Password must be at least 8 characters.",
    };
  }

  const supabase = await createClient();

  // Thread the post-confirmation destination (e.g. /claim/{cafeId}) through the
  // confirmation email so a new owner who registers mid-claim lands back on
  // their claim page after verifying, instead of the homepage.
  const safeRedirect = getSafeRedirect(redirectTo);
  const confirmUrl = new URL("/auth/confirm", await getBaseUrl());
  if (safeRedirect !== "/") {
    confirmUrl.searchParams.set("next", safeRedirect);
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: confirmUrl.toString(),
      data: {
        full_name: fullName,
        // Signals the shared "Confirm signup" email template to show the OTP
        // code block. Only nook-business has a code-entry screen; the other
        // apps (mobile/admin/webapp) omit the code and use the link.
        otp_signup: true,
      },
    },
  });

  if (error) {
    return {
      error: error.message || "Unable to create account.",
    };
  }

  // Carry the email (to prefill/verify) and the post-verification destination
  // to the OTP entry page.
  const params = new URLSearchParams({ email });
  if (safeRedirect !== "/") params.set("redirect", safeRedirect);

  redirect(`/register/confirm?${params.toString()}`);
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

  const supabase = await createClient();

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

// Confirms a new account with the 6-digit code from the confirmation email.
// On success verifyOtp establishes the session (cookies), then we send the
// owner on to their destination (e.g. back to the cafe they were claiming).
export async function verifySignupOtp(
  email: string,
  token: string,
  redirectTo?: string
): Promise<AuthResult> {
  const cleanEmail = email.trim().toLowerCase();
  const code = token.trim();

  // OTP length is configurable in Supabase (6–10 digits); this project uses 8.
  // Don't pin it to 6.
  if (!cleanEmail || !/^\d{6,10}$/.test(code)) {
    return { error: "Enter the code we emailed you." };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.verifyOtp({
    email: cleanEmail,
    token: code,
    type: "signup",
  });

  if (error) {
    return { error: "That code is incorrect or has expired." };
  }

  redirect(getSafeRedirect(redirectTo));
}

// Re-sends the signup confirmation code.
export async function resendSignupOtp(email: string): Promise<AuthResult> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail) return { error: "Missing email address." };

  const supabase = await createClient();

  const { error } = await supabase.auth.resend({
    type: "signup",
    email: cleanEmail,
    options: {
      emailRedirectTo: new URL("/auth/confirm", await getBaseUrl()).toString(),
    },
  });

  if (error) {
    return { error: "Couldn't resend the code. Please try again." };
  }

  return null;
}
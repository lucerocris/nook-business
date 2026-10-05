"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { getSafeRedirect } from "@/lib/safe-redirect";
import { landingForUser } from "@/lib/auth-landing";

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

  const { data: signUpData, error } = await supabase.auth.signUp({
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
    // Supabase's raw messages ("email rate limit exceeded", …) read like a
    // crash to an owner. Map the ones people actually hit.
    const code = error.code ?? ""
    if (code === "over_email_send_rate_limit" || error.status === 429) {
      return { error: "Too many attempts. Wait a minute, then try again." };
    }
    if (code === "weak_password") {
      return { error: "Choose a stronger password: at least 8 characters, not a common one." };
    }
    if (code === "email_address_invalid") {
      return { error: "That email address doesn't look right. Check it and try again." };
    }
    return { error: "We couldn't create your account. Please try again." };
  }

  // With email confirmation on, signing up with an email that already has an
  // account returns success with no identities and sends no email. Without
  // this check the owner waited on the code screen for a code that never came.
  // Common for owners who already use the Nook app, or signed up with Google.
  if (signUpData.user && (signUpData.user.identities?.length ?? 0) === 0) {
    return {
      error:
        "You already have a Nook account with this email. Log in instead, or use Continue with Google if that's how you signed up.",
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

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // Right password, unconfirmed email: this used to read as "Invalid email
    // or password", a dead end for an owner who closed the code screen. Send a
    // fresh code and put them back on it.
    if (error.code === "email_not_confirmed") {
      const safeRedirect = getSafeRedirect(redirectTo);
      const confirmUrl = new URL("/auth/confirm", await getBaseUrl());
      if (safeRedirect !== "/") confirmUrl.searchParams.set("next", safeRedirect);
      await supabase.auth.resend({
        type: "signup",
        email,
        options: { emailRedirectTo: confirmUrl.toString() },
      });
      const params = new URLSearchParams({ email });
      if (safeRedirect !== "/") params.set("redirect", safeRedirect);
      redirect(`/register/confirm?${params.toString()}`);
    }
    if (error.status === 429) {
      return { error: "Too many attempts. Wait a minute, then try again." };
    }
    return {
      error: "Invalid email or password.",
    };
  }

  let destination = getSafeRedirect(redirectTo);

  // Logging in from the landing page carries no ?redirect, so destination is
  // "/" — and middleware then bounces owners on to /owner/dashboard. That
  // second hop happens *during* the client-side transition the Server Action
  // redirect started, which leaves the shared root layout rendering the state
  // it had for the previous route (the marketing navbar stayed on screen over
  // the dashboard until a manual reload). Resolve the real destination here so
  // the navigation is a single hop.
  if (destination === "/" && data.user) {
    destination = await landingForUser(supabase, data.user.id);
  }

  redirect(destination);
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
export async function resendSignupOtp(
  email: string,
  redirectTo?: string
): Promise<AuthResult> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail) return { error: "Missing email address." };

  const supabase = await createClient();

  // Rebuild the same destination signUp threads through. Without this, an owner
  // who registers mid-claim and then hits "Resend" loses the /claim/{cafeId}
  // destination and lands on the homepage after confirming.
  const safeRedirect = getSafeRedirect(redirectTo);
  const confirmUrl = new URL("/auth/confirm", await getBaseUrl());
  if (safeRedirect !== "/") {
    confirmUrl.searchParams.set("next", safeRedirect);
  }

  const { error } = await supabase.auth.resend({
    type: "signup",
    email: cleanEmail,
    options: {
      emailRedirectTo: confirmUrl.toString(),
    },
  });

  if (error) {
    return { error: "Couldn't resend the code. Please try again." };
  }

  return null;
}

// Starts Google OAuth. Owners who found Nook through the mobile app sign up
// with Google there, which leaves them with no password at all — signInWithPassword
// then fails with "Invalid email or password", which is both wrong and a dead
// end because this app has no password-reset flow. The provider is already
// enabled on the shared Supabase project for mobile, so this only needs the
// callback URL allow-listed.
//
// Returns only on failure: the success path redirects to Google.
export async function signInWithGoogle(
  redirectTo?: string
): Promise<AuthResult> {
  const supabase = await createClient();

  // Thread the post-login destination through the callback the same way signUp
  // threads it through the confirmation email, so an owner who starts a claim,
  // signs in with Google, and comes back lands on /claim/{cafeId}.
  const safeRedirect = getSafeRedirect(redirectTo);
  const callbackUrl = new URL("/auth/callback", await getBaseUrl());
  if (safeRedirect !== "/") {
    callbackUrl.searchParams.set("next", safeRedirect);
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: callbackUrl.toString() },
  });

  if (error || !data?.url) {
    return { error: "Couldn't start Google sign-in. Please try again." };
  }

  // signInWithOAuth only builds the URL and stores the PKCE verifier in a
  // cookie; the browser still has to be sent to Google.
  redirect(data.url);
}

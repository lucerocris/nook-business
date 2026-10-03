"use client";

import Link from "next/link";
import { Spinner } from "@/components/ui/spinner";
import { useState } from "react";
import { signIn } from "@/actions/auth";

type LoginFormProps = {
  redirectTo: string;
};

type FieldErrors = {
  email?: string;
  password?: string;
};

export function LoginForm({ redirectTo }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const nextErrors: FieldErrors = {};

    if (!email.trim()) {
      nextErrors.email = "Email is required.";
    }

    if (!password) {
      nextErrors.password = "Password is required.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const result = await signIn(formData, redirectTo);

    if (result?.error) {
      setFormError(result.error);
    }

    setIsSubmitting(false);
  };

  const redirectParam = encodeURIComponent(redirectTo);

  return (
    <form className="mt-6 space-y-4 sm:mt-7" onSubmit={handleSubmit}>
      {formError ? (
        <p role="alert" className="rounded-lg border border-[#b94a48]/25 bg-[#b94a48]/5 px-4 py-3 text-sm text-[#b94a48]">
          {formError}
        </p>
      ) : null}
      <div>
        <label className="text-sm font-medium text-[#101514]" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="mt-1.5 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-base text-[#101514] outline-none transition-colors placeholder:text-zinc-400 focus:border-[#3A5A40] sm:text-sm"
          aria-invalid={Boolean(fieldErrors.email)}
          aria-describedby={fieldErrors.email ? "email-error" : undefined}
        />
        {fieldErrors.email ? (
          <p id="email-error" className="mt-2 text-xs text-[#b94a48]">
            {fieldErrors.email}
          </p>
        ) : null}
      </div>
      <div>
        <label className="text-sm font-medium text-[#101514]" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-1.5 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-base text-[#101514] outline-none transition-colors placeholder:text-zinc-400 focus:border-[#3A5A40] sm:text-sm"
          aria-invalid={Boolean(fieldErrors.password)}
          aria-describedby={fieldErrors.password ? "password-error" : undefined}
        />
        {fieldErrors.password ? (
          <p id="password-error" className="mt-2 text-xs text-[#b94a48]">
            {fieldErrors.password}
          </p>
        ) : null}
      </div>
      <button
        type="submit"
        className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[#3A5A40] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#2f4833] disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Spinner className="mr-2 size-4" />
            Logging in…
          </>
        ) : (
          "Log in"
        )}
      </button>
      <p className="text-center text-sm text-[#6b6b6b]">
        Don&apos;t have an account?{" "}
        <Link
          href={`/register?redirect=${redirectParam}`}
          className="font-semibold text-[#3A5A40] hover:text-[#2b442f]"
        >
          Create one
        </Link>
      </p>
    </form>
  );
}

"use client";

import Link from "next/link";
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
    <form className="mt-8 space-y-5 animate-funnel-rise funnel-delay-3" onSubmit={handleSubmit}>
      {formError ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm">
          {formError}
        </p>
      ) : null}
      <div>
        <label className="text-sm font-medium text-gray-700" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="mt-2 w-full rounded-xl border border-[#3A5A40]/20 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm transition placeholder:text-gray-400 focus:border-[#3A5A40]/45 focus:outline-none focus:ring-4 focus:ring-[#3A5A40]/12"
          aria-invalid={Boolean(fieldErrors.email)}
          aria-describedby={fieldErrors.email ? "email-error" : undefined}
        />
        {fieldErrors.email ? (
          <p id="email-error" className="mt-2 text-xs text-red-600">
            {fieldErrors.email}
          </p>
        ) : null}
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-2 w-full rounded-xl border border-[#3A5A40]/20 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm transition placeholder:text-gray-400 focus:border-[#3A5A40]/45 focus:outline-none focus:ring-4 focus:ring-[#3A5A40]/12"
          aria-invalid={Boolean(fieldErrors.password)}
          aria-describedby={fieldErrors.password ? "password-error" : undefined}
        />
        {fieldErrors.password ? (
          <p id="password-error" className="mt-2 text-xs text-red-600">
            {fieldErrors.password}
          </p>
        ) : null}
      </div>
      <button
        type="submit"
        className="inline-flex w-full items-center justify-center rounded-xl bg-[#3A5A40] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_16px_35px_rgba(58,90,64,0.3)] transition hover:-translate-y-0.5 hover:bg-[#2f4a35] disabled:cursor-not-allowed disabled:opacity-70"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Logging in..." : "Log in"}
      </button>
      <p className="text-center text-sm text-gray-500">
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

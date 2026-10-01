"use client";

import Link from "next/link";
import { Spinner } from "@/components/ui/spinner";
import { useState } from "react";
import { signUp } from "@/actions/auth";

type RegisterFormProps = {
  redirectTo: string;
};

type FieldErrors = {
  fullName?: string;
  email?: string;
  password?: string;
};

export function RegisterForm({ redirectTo }: RegisterFormProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const nextErrors: FieldErrors = {};

    if (!fullName.trim()) nextErrors.fullName = "Full name is required.";
    if (!email.trim()) nextErrors.email = "Email is required.";
    if (!password) nextErrors.password = "Password is required.";
    else if (password.length < 8) nextErrors.password = "Password must be at least 8 characters.";

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const result = await signUp(formData, redirectTo);

    if (result?.error) setFormError(result.error);
    
    setIsSubmitting(false);
  };

  const redirectParam = encodeURIComponent(redirectTo);

  return (
    <form className="mt-6 space-y-4 sm:mt-7" onSubmit={handleSubmit}>
      {formError && (
        <p role="alert" className="rounded-lg border border-nk-danger/25 bg-nk-danger/5 px-4 py-3 text-sm text-nk-danger">
          {formError}
        </p>
      )}
      <div>
        <label className="text-sm font-medium text-nk-ink" htmlFor="fullName">
          Full name
        </label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          autoComplete="name"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          className="mt-1.5 w-full rounded-lg border border-nk-line bg-nk-surface px-3 py-2.5 text-base text-nk-ink outline-none transition-colors placeholder:text-zinc-400 focus:border-nk-green sm:text-sm"
          aria-invalid={Boolean(fieldErrors.fullName)}
          aria-describedby={fieldErrors.fullName ? "fullName-error" : undefined}
        />
        {fieldErrors.fullName && (
          <p id="fullName-error" className="mt-2 text-xs text-nk-danger">
            {fieldErrors.fullName}
          </p>
        )}
      </div>
      <div>
        <label className="text-sm font-medium text-nk-ink" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="mt-1.5 w-full rounded-lg border border-nk-line bg-nk-surface px-3 py-2.5 text-base text-nk-ink outline-none transition-colors placeholder:text-zinc-400 focus:border-nk-green sm:text-sm"
          aria-invalid={Boolean(fieldErrors.email)}
          aria-describedby={fieldErrors.email ? "email-error" : undefined}
        />
        {fieldErrors.email && (
          <p id="email-error" className="mt-2 text-xs text-nk-danger">
            {fieldErrors.email}
          </p>
        )}
      </div>
      <div>
        <label className="text-sm font-medium text-nk-ink" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-1.5 w-full rounded-lg border border-nk-line bg-nk-surface px-3 py-2.5 text-base text-nk-ink outline-none transition-colors placeholder:text-zinc-400 focus:border-nk-green sm:text-sm"
          aria-invalid={Boolean(fieldErrors.password)}
          aria-describedby={fieldErrors.password ? "password-error" : undefined}
        />
        {fieldErrors.password && (
          <p id="password-error" className="mt-2 text-xs text-nk-danger">
            {fieldErrors.password}
          </p>
        )}
      </div>
      <button
        type="submit"
        className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-nk-green-fill px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-nk-green-hover disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Spinner className="mr-2 size-4" />
            Creating account…
          </>
        ) : (
          "Create account"
        )}
      </button>
      <p className="text-center text-sm text-nk-muted">
        Already have an account?{" "}
        <Link
          href={`/login?redirect=${redirectParam}`}
          className="font-semibold text-nk-green hover:text-nk-green-strong"
        >
          Log in
        </Link>
      </p>
    </form>
  );
}

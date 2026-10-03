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
        <p role="alert" className="rounded-lg border border-[#b94a48]/25 bg-[#b94a48]/5 px-4 py-3 text-sm text-[#b94a48]">
          {formError}
        </p>
      )}
      <div>
        <label className="text-sm font-medium text-[#101514]" htmlFor="fullName">
          Full name
        </label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          autoComplete="name"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          className="mt-1.5 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-base text-[#101514] outline-none transition-colors placeholder:text-zinc-400 focus:border-[#3A5A40] sm:text-sm"
          aria-invalid={Boolean(fieldErrors.fullName)}
          aria-describedby={fieldErrors.fullName ? "fullName-error" : undefined}
        />
        {fieldErrors.fullName && (
          <p id="fullName-error" className="mt-2 text-xs text-[#b94a48]">
            {fieldErrors.fullName}
          </p>
        )}
      </div>
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
        {fieldErrors.email && (
          <p id="email-error" className="mt-2 text-xs text-[#b94a48]">
            {fieldErrors.email}
          </p>
        )}
      </div>
      <div>
        <label className="text-sm font-medium text-[#101514]" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-1.5 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-base text-[#101514] outline-none transition-colors placeholder:text-zinc-400 focus:border-[#3A5A40] sm:text-sm"
          aria-invalid={Boolean(fieldErrors.password)}
          aria-describedby={fieldErrors.password ? "password-error" : undefined}
        />
        {fieldErrors.password && (
          <p id="password-error" className="mt-2 text-xs text-[#b94a48]">
            {fieldErrors.password}
          </p>
        )}
      </div>
      <button
        type="submit"
        className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[#3A5A40] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#2f4833] disabled:cursor-not-allowed disabled:opacity-60"
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
      <p className="text-center text-sm text-[#6b6b6b]">
        Already have an account?{" "}
        <Link
          href={`/login?redirect=${redirectParam}`}
          className="font-semibold text-[#3A5A40] hover:text-[#2b442f]"
        >
          Log in
        </Link>
      </p>
    </form>
  );
}

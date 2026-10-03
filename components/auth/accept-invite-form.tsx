"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { acceptInviteAction } from "@/app/accept-invite/actions"

const MIN_PASSWORD_LENGTH = 8

export function AcceptInviteForm() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError(null)

    if (password.length < MIN_PASSWORD_LENGTH) {
      setFormError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`)
      return
    }
    if (password !== confirmPassword) {
      setFormError("Passwords do not match.")
      return
    }

    setIsSubmitting(true)
    const result = await acceptInviteAction(password)

    if (!result.ok) {
      setFormError(result.error)
      setIsSubmitting(false)
      return
    }

    // The owner->cafe link already exists (invite-owner creates it), so the
    // dashboard is reachable as soon as the password is set.
    router.replace("/owner/dashboard")
  }

  return (
    <form className="mt-6 space-y-4 sm:mt-7" onSubmit={handleSubmit}>
      {formError ? (
        <p role="alert" className="rounded-[2px] border border-[#b94a48]/30 bg-[#b94a48]/5 px-4 py-3 text-sm text-[#b94a48]">
          {formError}
        </p>
      ) : null}

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium text-[var(--nk-ink)]">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded-[2px] border border-[#d4d4d0] bg-white px-3 py-2.5 text-base text-[var(--nk-ink)] outline-none transition-colors placeholder:text-[#8a8a87] focus:border-[var(--nk-green)] focus-visible:ring-2 focus-visible:ring-[var(--nk-green)]/25 sm:text-sm"
          placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="confirmPassword" className="text-sm font-medium text-[var(--nk-ink)]">
          Confirm password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          className="w-full rounded-[2px] border border-[#d4d4d0] bg-white px-3 py-2.5 text-base text-[var(--nk-ink)] outline-none transition-colors placeholder:text-[#8a8a87] focus:border-[var(--nk-green)] focus-visible:ring-2 focus-visible:ring-[var(--nk-green)]/25 sm:text-sm"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[var(--nk-green)] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--nk-green-hover)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Setting password…" : "Set password and continue"}
      </button>
    </form>
  )
}

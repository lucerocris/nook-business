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
        <p role="alert" className="rounded-lg border border-nk-danger/25 bg-nk-danger/5 px-4 py-3 text-sm text-nk-danger">
          {formError}
        </p>
      ) : null}

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium text-nk-ink">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded-xl border border-nk-line bg-nk-surface px-4 py-3 text-base sm:text-sm text-nk-ink shadow-sm outline-none transition focus:border-nk-muted"
          placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="confirmPassword" className="text-sm font-medium text-nk-ink">
          Confirm password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          className="w-full rounded-xl border border-nk-line bg-nk-surface px-4 py-3 text-base sm:text-sm text-nk-ink shadow-sm outline-none transition focus:border-nk-muted"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-xl bg-nk-ink px-4 py-3 text-sm font-medium text-nk-bg shadow-sm transition hover:bg-nk-ink/90 disabled:opacity-60"
      >
        {isSubmitting ? "Setting password…" : "Set password and continue"}
      </button>
    </form>
  )
}

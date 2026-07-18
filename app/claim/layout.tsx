import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { SELF_SERVE_CLAIM_ENABLED } from "@/lib/features"

export const metadata: Metadata = { title: "Claim your cafe" }

export default function ClaimLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Self-serve claiming is disabled while onboarding is manual (invite-only).
  // Guard the whole /claim/* subtree in one place so direct visits/bookmarks
  // don't reach the (currently dead-end) claim flow.
  if (!SELF_SERVE_CLAIM_ENABLED) redirect("/")

  return children
}

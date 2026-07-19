"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { createClient } from "@/lib/supabase/client"

/**
 * Refreshes a stale access token after a claim is approved.
 *
 * Approval grants the role via `auth.admin.updateUserById({ app_metadata:
 * { role: "cafe_owner" } })`, and app_metadata is baked into the JWT. A browser
 * holding a token minted before approval keeps the OLD claims until that token
 * expires (up to an hour), which produces two confusing symptoms:
 *
 *   1. Navigating to the dashboard appears broken until a manual reload.
 *   2. Worse and silent: the `owners_update_own_cafe` RLS policy on `cafes`
 *      requires the cafe_owner role IN THE JWT, so the dashboard renders (reads
 *      use the cafe_owner_cafe link, not the JWT) but every save is rejected.
 *
 * Middleware already proved this user owns a cafe by the time this renders, so
 * a JWT without the role means only one thing: the token predates approval.
 * Refresh it once and re-render the server tree with the new claims.
 */
export function SessionRoleSync() {
  const router = useRouter()
  // Guards against a refresh loop if the role never appears (e.g. approval
  // wrote the ownership row but not the metadata).
  const attemptedRef = React.useRef(false)

  React.useEffect(() => {
    if (attemptedRef.current) return
    attemptedRef.current = true

    const supabase = createClient()

    void (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) return
      if (session.user.app_metadata?.role === "cafe_owner") return

      const { data, error } = await supabase.auth.refreshSession()
      if (error) {
        console.error("[SessionRoleSync] refresh failed", error)
        return
      }

      // Only re-render if the refresh actually changed anything, so a user
      // whose metadata is genuinely missing doesn't get a pointless reload.
      if (data.session?.user.app_metadata?.role === "cafe_owner") {
        router.refresh()
      }
    })()
  }, [router])

  return null
}

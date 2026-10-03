import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { FunnelShell, FunnelSpread } from "@/app/components/funnel-shell"
import { AcceptInviteForm } from "@/components/auth/accept-invite-form"

export const metadata: Metadata = { title: "Set your password" }

type PageProps = {
  searchParams?: Promise<{ error?: string }>
}

const LINK_ERRORS: Record<string, string> = {
  link_expired: "That invite link has expired or was already used.",
  missing_code: "That invite link is incomplete.",
}

export default async function AcceptInvitePage({ searchParams }: PageProps) {
  const { error } = (await searchParams) ?? {}

  // /accept-invite exchanges the emailed code for a session before redirecting
  // here, so a session is the proof the invite is genuine.
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const linkError = error ? (LINK_ERRORS[error] ?? "That invite link is not valid.") : null

  // Greeting only — the invite is already valid by virtue of the session, so a
  // missing name just degrades the copy.
  let cafeName: string | null = null
  if (user) {
    const { data: link } = await supabase
      .from("cafe_owner_cafe")
      .select("cafes(name)")
      .eq("owner_id", user.id)
      .limit(1)
      .maybeSingle()

    // PostgREST returns an embedded row as either an object or a single-element
    // array depending on the relationship it infers.
    const joined = link?.cafes as { name: string } | { name: string }[] | null | undefined
    const cafe = Array.isArray(joined) ? joined[0] : joined
    cafeName = cafe?.name ?? null
  }

  return (
    <FunnelShell>
      {!user ? (
        <FunnelSpread
          label="Owner invite"
          title="This invite link isn't valid."
          lead={linkError ?? "Invite links can only be used once, and expire after 24 hours."}
          aside="Ask the Nook team to send you a new one."
        />
      ) : (
        <FunnelSpread
          label="Owner invite"
          title="Set your password."
          lead={
            cafeName
              ? `You've been invited to manage ${cafeName} on Nook.`
              : "You've been invited to manage your cafe on Nook."
          }
        >
          <div className="max-w-md">
            <AcceptInviteForm />
          </div>
        </FunnelSpread>
      )}
    </FunnelShell>
  )
}

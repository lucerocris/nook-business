import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { FunnelShell } from "@/app/components/funnel-shell"
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
    <FunnelShell contentClassName="max-w-4xl">
      <div className="mx-auto w-full max-w-2xl rounded-[2rem] border border-white/80 bg-white/90 p-7 shadow-[0_24px_80px_rgba(15,23,42,0.09)] backdrop-blur-sm sm:p-10">
        <div className="flex justify-center animate-funnel-fade">
          <img
            src="https://lucerocris.sgp1.cdn.digitaloceanspaces.com/nook-sites/logo.svg"
            alt="Nook"
            className="h-9 w-auto"
          />
        </div>

        {!user ? (
          <div className="mt-8 space-y-4 text-center animate-funnel-rise">
            <h1 className="text-xl font-semibold text-slate-900">
              This invite link isn&apos;t valid
            </h1>
            <p className="text-sm text-slate-600">
              {linkError ?? "Invite links can only be used once, and expire after 24 hours."}
            </p>
            <p className="text-sm text-slate-600">
              Ask the Nook team to send you a new one.
            </p>
          </div>
        ) : (
          <>
            <div className="mt-8 space-y-2 text-center animate-funnel-rise">
              <h1 className="text-xl font-semibold text-slate-900">
                Set your password
              </h1>
              <p className="text-sm text-slate-600">
                {cafeName
                  ? `You've been invited to manage ${cafeName} on Nook.`
                  : "You've been invited to manage your cafe on Nook."}
              </p>
            </div>
            <AcceptInviteForm />
          </>
        )}
      </div>
    </FunnelShell>
  )
}

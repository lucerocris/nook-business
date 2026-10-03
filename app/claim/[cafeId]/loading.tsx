import { FunnelShell } from "@/app/components/funnel-shell";

/**
 * Route-level pending UI for the claim page.
 *
 * Selecting a cafe from the search dropdown navigates to this server-rendered
 * route, which has to resolve the cafe and the session before it can paint.
 * Without a loading state the browser sat on the previous screen with nothing
 * happening, so the tap felt ignored. This skeleton mirrors the real card's
 * layout (avatar, eyebrow, title, body, two buttons) so the transition into the
 * loaded page doesn't jump.
 */
export default function ClaimCafeLoading() {
  return (
    <FunnelShell contentClassName="max-w-4xl">
      <div
        role="status"
        aria-label="Loading claim details"
        className="mx-auto w-full max-w-2xl rounded-2xl bg-white p-6 text-center shadow-[0_12px_28px_rgba(0,0,0,0.08)] ring-1 ring-zinc-200/70 sm:p-8"
      >
        <div className="mx-auto mb-6 size-24 rounded-2xl bg-zinc-100 motion-safe:animate-pulse" />
        <div className="mx-auto h-3 w-40 rounded-full bg-zinc-100 motion-safe:animate-pulse" />
        <div className="mx-auto mt-4 h-8 w-3/4 rounded-lg bg-zinc-100 motion-safe:animate-pulse sm:h-9" />
        <div className="mx-auto mt-4 h-4 w-full max-w-xl rounded-full bg-zinc-100 motion-safe:animate-pulse" />
        <div className="mx-auto mt-2 h-4 w-2/3 rounded-full bg-zinc-100 motion-safe:animate-pulse" />
        <div className="mt-8 flex flex-col items-center gap-3">
          <div className="h-11 w-full rounded-full bg-zinc-100 motion-safe:animate-pulse" />
          <div className="h-4 w-48 rounded-full bg-zinc-100 motion-safe:animate-pulse" />
        </div>
        <span className="sr-only">Loading claim details…</span>
      </div>
    </FunnelShell>
  );
}

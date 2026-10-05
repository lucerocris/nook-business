import { FunnelShell } from "@/app/components/funnel-shell";

/**
 * Route-level pending UI for the claim page.
 *
 * Selecting a cafe from the search dropdown navigates to this server-rendered
 * route, which has to resolve the cafe and the session before it can paint.
 * Without a loading state the browser sat on the previous screen with nothing
 * happening, so the tap felt ignored. This skeleton mirrors the real card's
 * layout (progress strip, title, two lines, a button) so the transition into the
 * loaded page doesn't jump.
 */
export default function ClaimCafeLoading() {
  return (
    <FunnelShell>
      <div
        role="status"
        aria-label="Loading claim details"
        className="rounded-2xl bg-white p-5 shadow-[var(--nk-shadow-card)] sm:p-8"
      >
        <div className="mb-7 grid grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="size-6 rounded-full bg-zinc-100 motion-safe:animate-pulse" />
              <div className="h-3 w-14 rounded-full bg-zinc-100 motion-safe:animate-pulse" />
            </div>
          ))}
        </div>
        <div className="h-7 w-3/4 rounded-lg bg-zinc-100 motion-safe:animate-pulse" />
        <div className="mt-3 h-4 w-full rounded-full bg-zinc-100 motion-safe:animate-pulse" />
        <div className="mt-2 h-4 w-2/3 rounded-full bg-zinc-100 motion-safe:animate-pulse" />
        <div className="mt-6 h-11 w-full rounded-full bg-zinc-100 motion-safe:animate-pulse" />
        <span className="sr-only">Loading claim details…</span>
      </div>
    </FunnelShell>
  );
}

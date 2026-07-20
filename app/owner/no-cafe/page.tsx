import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "No cafe linked" };

// Reached when an owner is signed in and gated into /owner (they have an owner
// link row) but no cafe resolves for them — e.g. their cafe was removed. This
// is a dedicated screen so the owner-cafe helpers don't redirect to /login,
// which middleware would bounce straight back into a loop.
export default function NoCafePage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
      <span className="inline-flex items-center rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
        Account not linked
      </span>
      <h1 className="mt-4 text-2xl font-semibold text-foreground">
        No cafe is linked to your account yet
      </h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        Your owner account isn&apos;t connected to a cafe right now. If you
        recently claimed a cafe, it may still be under review. Otherwise, reach
        out and we&apos;ll get you set up.
      </p>
      <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row">
        <Link
          href="/claim/status"
          className="inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
        >
          Check your claim status
        </Link>
        <a
          href="https://instagram.com/nook_cafefinder"
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-11 items-center justify-center rounded-md border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted"
        >
          Message the Nook team
        </a>
      </div>
    </div>
  );
}

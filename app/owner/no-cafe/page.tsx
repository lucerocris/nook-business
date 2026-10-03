import type { Metadata } from "next"
import Link from "next/link"
import { CaretRightIcon, InstagramLogoIcon, StorefrontIcon } from "@phosphor-icons/react/dist/ssr"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = { title: "No café linked" }

// Reached when an owner is signed in and gated into /owner (they have an owner
// link row) but no cafe resolves for them — e.g. their cafe was removed. This
// is a dedicated screen so the owner-cafe helpers don't redirect to /login,
// which middleware would bounce straight back into a loop.
export default function NoCafePage() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="border-b bg-sidebar px-4 py-6 sm:px-6 sm:py-8">
        <div className="mx-auto w-full max-w-6xl">
          <h1 className="text-2xl font-semibold tracking-tight">Your café</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Edit your Nook listing, photos, menu and reviews once a café is linked to this
            account.
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-4 py-16">
        <div className="w-full max-w-md rounded-xl border bg-card px-6 py-8 text-center">
          <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted">
            <StorefrontIcon className="size-5" aria-hidden />
          </span>
          <h2 className="mt-4 text-base font-semibold">No café is linked to your account yet</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            If you recently claimed a café, it may still be under review. Otherwise, message us
            and we’ll get you set up.
          </p>
          <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
            <Button asChild>
              <Link href="/claim/status">Check your claim status</Link>
            </Button>
            <Button asChild variant="outline">
              <a href="https://instagram.com/nook_cafefinder" target="_blank" rel="noopener noreferrer">
                <InstagramLogoIcon aria-hidden />
                Message the Nook team
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </Button>
          </div>
        </div>
        <Link
          href="/#how-it-works"
          className="mt-4 inline-flex min-h-9 items-center gap-1 rounded-md text-[13px] text-muted-foreground outline-hidden hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          How claiming a café works
          <CaretRightIcon className="size-3.5" aria-hidden />
        </Link>
      </div>
    </div>
  )
}

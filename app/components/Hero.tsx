import Link from "next/link";
import { CafeSearchInput } from "./claim/cafe-search-input";
import { SELF_SERVE_CLAIM_ENABLED } from "@/lib/features";
import { HoursCard, InsightsCard, ListingCard } from "./landing/drawn-ui";

const INSTAGRAM_URL = "https://instagram.com/nook_cafefinder";

export function Hero() {
  return (
    <section
      id="hero"
      className="relative isolate overflow-hidden pt-28 sm:pt-36 lg:pt-40"
    >
      {/* Same backdrop as the webapp hero: brand-green radial over the
          page's dot grid. */}
      <div
        aria-hidden="true"
        className="hero-glow pointer-events-none absolute inset-x-0 top-0 -z-10 h-[560px]"
      />

      {/* Left-aligned on phones, centered from sm up. */}
      <div className="nk-container flex flex-col items-start text-left sm:items-center sm:text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-[var(--nk-line)] bg-nk-surface px-3 py-1 text-[13px] font-medium text-[var(--nk-body)]">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--nk-green)]" />
          Nook for Business · free for cafe owners
        </span>

        <h1 className="nk-h1 mt-5 max-w-4xl sm:mt-6">
          Claim your cafe on Nook.
          <br className="hidden sm:block" />{" "}
          <span className="text-[var(--nk-green)]">Keep every detail right.</span>
        </h1>

        <p className="nk-lead mt-5 max-w-2xl">
          People use Nook to find a cafe with{" "}
          <span className="whitespace-nowrap">Wi-Fi</span>, outlets or a late
          closing time. Claim your listing to keep your hours, menu and photos
          accurate, and see how often people find you.
        </p>

        <div id="find-your-cafe" className="mt-8 w-full max-w-xl scroll-mt-32">
          {SELF_SERVE_CLAIM_ENABLED ? (
            <CafeSearchInput />
          ) : (
            <div className="flex flex-wrap gap-2 sm:justify-center">
              <Link href="/login" className="nk-btn nk-btn-primary">
                Owner sign in
              </Link>
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="nk-btn nk-btn-secondary"
              >
                Get your cafe listed
              </a>
            </div>
          )}
        </div>

        <p className="mt-4 text-[14px] text-[var(--nk-muted)]">
          Can&apos;t find your cafe?{" "}
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="nk-link"
          >
            Ask us to add it →
          </a>
        </p>
      </div>

      {/* Drawn product UI: what customers see beside what the owner edits. */}
      <div className="nk-container mt-14 sm:mt-20">
        <div
          role="img"
          aria-label="Illustration: a cafe's listing as customers see it in Nook, next to the owner portal where its opening hours are edited and its 30-day traffic is shown."
          className="nk-panel relative overflow-hidden rounded-xl px-4 pb-0 pt-8 sm:px-10 sm:pt-12 lg:px-14"
        >
          <div className="mx-auto grid max-w-[1040px] grid-cols-1 items-end gap-6 sm:grid-cols-2 lg:grid-cols-[1fr_1.05fr_0.9fr] lg:gap-8">
            <figure>
              <figcaption className="nk-meta mb-3 text-white/70">
                What customers see
              </figcaption>
              <ListingCard className="rounded-b-none border-b-0" />
            </figure>

            <figure className="hidden sm:block">
              <figcaption className="nk-meta mb-3 text-white/70">
                What you edit
              </figcaption>
              <HoursCard className="rounded-b-none border-b-0 pb-6" />
            </figure>

            <figure className="hidden lg:block">
              <figcaption className="nk-meta mb-3 text-white/70">
                What you learn
              </figcaption>
              <InsightsCard className="rounded-b-none border-b-0 pb-8" />
            </figure>
          </div>
        </div>
      </div>
    </section>
  );
}

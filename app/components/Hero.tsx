"use client";
import Link from "next/link";
import { CafeSearchInput } from "./claim/cafe-search-input";
import { SELF_SERVE_CLAIM_ENABLED } from "@/lib/features";

export function Hero() {
  return (
    <section
      id="hero"
      className="relative isolate flex flex-col items-center overflow-hidden pt-28 sm:pt-36 lg:pt-40"
    >
      {/* Same hero backdrop as the webapp: brand-green radial anchored at
          top-center over the page's dot grid. The section is transparent so the
          dots show through, rather than being covered by a flat mint panel. */}
      <div
        aria-hidden="true"
        className="hero-glow pointer-events-none absolute inset-x-0 top-0 -z-10 h-[560px]"
      />

      {/* Top Content */}
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-center px-5 text-center sm:px-6">
        <span className="rounded-full border border-[#3A5A40]/20 bg-white px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-[#3A5A40] sm:text-xs">
          Nook for Business
        </span>
        {/* Heading scale + tracking match the webapp hero. */}
        <h1 className="mt-5 text-balance font-display text-[2rem] font-semibold leading-[1.1] tracking-[-0.02em] text-[#101514] sm:mt-6 sm:text-5xl lg:text-6xl">
          The discovery platform for PH&apos;s finest cafes.
        </h1>
        <p className="mt-4 max-w-2xl text-sm text-[#3b3b3b] sm:mt-5 sm:text-lg">
          Claim your free profile, update your amenities, and control your
          digital storefront in minutes.
        </p>
        <div className="mt-8 w-full max-w-xl">
          {SELF_SERVE_CLAIM_ENABLED ? (
            <CafeSearchInput />
          ) : (
            // Pill buttons with colour-only transitions — the webapp's button
            // recipe. No translate-y lift.
            <div className="flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
              <Link
                href="/login"
                className="rounded-full bg-[#3A5A40] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#2f4833]"
              >
                Owner sign in
              </Link>
              <a
                href="https://instagram.com/nook_cafefinder"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-zinc-300 bg-white px-6 py-3 text-sm font-medium text-[#3b3b3b] transition-colors hover:bg-zinc-50"
              >
                Get your cafe listed
              </a>
            </div>
          )}
        </div>
        {/* #6b6b6b rather than gray-400 (2.9:1, fails AA). */}
        <div className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6b6b6b] sm:mt-8 sm:gap-6 sm:text-xs">
          <span>Verified listings</span>
          <span className="hidden h-1 w-1 rounded-full bg-zinc-300 sm:inline-block" />
          <span>Free forever</span>
          <span className="hidden h-1 w-1 rounded-full bg-zinc-300 sm:inline-block" />
          <span>Designed for local growth</span>
        </div>
      </div>

      {/* Mockups. The floating circles/rounded-squares that used to sit behind
          these were removed — the webapp has no such decorative shapes, and
          they competed visually with the dot grid. */}
      <div className="relative mt-12 flex w-full flex-col items-center sm:mt-16">
        <div className="relative z-10 w-full max-w-6xl px-4 sm:px-8">
          <div className="relative">
            {/* Desktop Dashboard */}
            <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_12px_28px_rgba(0,0,0,0.08)]">
              <img
                src="https://lucerocris.sgp1.cdn.digitaloceanspaces.com/nook-sites/dashboardScreen.png"
                alt="Dashboard interface"
                className="h-auto w-full object-cover"
              />
            </div>

            {/* Mobile Preview */}
            <div
              className="
                absolute
                bottom-[-1rem]
                right-2
                z-20
                w-[28%]
                max-w-[120px]
                overflow-hidden
                rounded-[1rem]
                border-[2px]
                border-white
                shadow-[0_20px_50px_rgba(15,23,42,0.18)]
                sm:bottom-[-3rem]
                sm:right-[-1rem]
                sm:w-[30%]
                sm:max-w-[320px]
                sm:rounded-[2rem]
                sm:border-[6px]
              "
            >
              <img
                src="https://lucerocris.sgp1.cdn.digitaloceanspaces.com/nook-sites/phoneScreen.png"
                alt="Mobile interface"
                className="h-auto w-full object-cover"
              />
            </div>
          </div>
        </div>

        <div className="h-8 sm:h-28 w-full" />
      </div>
    </section>
  );
}

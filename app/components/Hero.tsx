
'use client'

import { CafeSearchInput } from "./claim/cafe-search-input";

export function Hero() {
  return (
    <section
      id="hero"
      className="relative isolate flex flex-col items-center overflow-hidden bg-[#F7FAF7] pt-40 sm:pt-44"
    >
      <div className="pointer-events-none absolute left-1/2 top-24 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,_rgba(58,90,64,0.22),_transparent_65%)] blur-2xl" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[linear-gradient(180deg,_rgba(247,250,247,0.95),_rgba(247,250,247,0))]" />
      {/* Top Content */}
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-center px-6 text-center">
        <span className="rounded-full border border-[#3A5A40]/20 bg-white px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-[#3A5A40] shadow-sm">
          Nook for Business
        </span>
        <h1 className="mt-6 text-balance font-display text-4xl font-semibold text-gray-900 sm:text-5xl lg:text-6xl">
          The discovery platform for PH&apos;s finest cafes.
        </h1>
        <p className="mt-5 max-w-2xl text-base text-gray-600 sm:text-lg">
          Claim your free profile, update your amenities, and control your
          digital storefront in minutes.
        </p>
        <div className="mt-8 w-full max-w-xl">
          <CafeSearchInput />
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
          <span>Verified listings</span>
          <span className="hidden h-1 w-1 rounded-full bg-gray-300 sm:inline-block" />
          <span>Free forever</span>
          <span className="hidden h-1 w-1 rounded-full bg-gray-300 sm:inline-block" />
          <span>Designed for local growth</span>
        </div>
      </div>

      {/* Mockups + Background */}
      <div className="relative mt-16 flex w-full flex-col items-center">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-10 top-0 h-20 w-20 rounded-full border border-[#3A5A40]/20" />
          <div className="absolute right-16 top-16 h-32 w-32 rounded-[32px] border border-[#3A5A40]/15" />
          <div className="absolute bottom-0 left-1/2 h-24 w-[70%] -translate-x-1/2 rounded-[32px] bg-white/60" />
        </div>

        {/* Mockups */}
        <div
          style={{ position: "relative", zIndex: 10 }}
          className="w-full max-w-6xl px-8"
        >
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.15)]">
            <img
              src="/dashboardScreen.png"
              alt="Dashboard interface"
              className="h-auto w-full object-cover"
            />
          </div>

          <div
            style={{ position: "absolute", zIndex: 20 }}
            className="bottom-[-2rem] right-0 w-[30%] min-w-[150px] max-w-[320px] overflow-hidden rounded-[2rem] border-[6px] border-white shadow-[0_20px_50px_rgba(15,23,42,0.18)] sm:bottom-[-3rem] sm:right-[-1rem]"
          >
            <img
              src="/phoneScreen.png"
              alt="Mobile interface"
              className="h-auto w-full object-cover"
            />
          </div>
        </div>

        <div className="h-28 w-full" style={{ zIndex: 5 }} />
      </div>

    </section>
  );
}

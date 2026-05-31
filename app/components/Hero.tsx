'use client'

import { CafeSearchInput } from "./claim/cafe-search-input";

export function Hero() {
  return (
    <section className="flex flex-col items-center overflow-hidden bg-[#F7FAF7] pt-48">
      {/* Top Content */}
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-center px-6 text-center">
        <h1 className="text-balance text-4xl font-bold text-gray-900 sm:text-5xl">
          The discovery platform for PH's finest cafes.
        </h1>
        <p className="mt-4 max-w-2xl text-base text-gray-500 sm:text-lg">
          Claim your free profile, update your amenities, and control your
          digital storefront in minutes.
        </p>
        <div className="mt-8 w-full max-w-xl">
          <CafeSearchInput />
        </div>
      </div>

      {/* Mockups + Background */}
      <div className="relative mt-16 flex w-full flex-col items-center">
        

        {/* Mockups */}
        <div
          style={{ position: "relative", zIndex: 10 }}
          className="w-full max-w-6xl px-8"
        >
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
            <img
              src="/dashboardScreen.png"
              alt="Dashboard interface"
              className="h-auto w-full object-cover"
            />
          </div>

          <div
            style={{ position: "absolute", zIndex: 20 }}
            className="bottom-[-2rem] right-0 w-[30%] min-w-[150px] max-w-[320px] overflow-hidden rounded-[2rem] border-[6px] border-white shadow-2xl sm:bottom-[-3rem] sm:right-[-1rem]"
          >
            <img
              src="/phoneScreen.png"
              alt="Mobile interface"
              className="h-auto w-full object-cover"
            />
          </div>
        </div>

        <div className="h-24 w-full" style={{ zIndex: 5 }} />
      </div>

    </section>
  );
}
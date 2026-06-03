'use client'

import React, { useEffect } from 'react'
import { FunnelShell } from '../components/funnel-shell'
import { CafeSearchInput } from '../components/claim/cafe-search-input'

export default function ClaimSearchPage() {
  useEffect(() => {
    document.body.classList.add('navbar-bordered')
    return () => document.body.classList.remove('navbar-bordered')
  }, [])

  return (
    <FunnelShell contentClassName="max-w-4xl">
      <main className="mx-auto w-full max-w-3xl rounded-[2rem] border border-white/80 bg-white/90 px-6 py-10 shadow-[0_24px_80px_rgba(15,23,42,0.09)] backdrop-blur-sm sm:px-10 sm:py-14">
        <div className="animate-funnel-fade w-full text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#3A5A40]">
            Start claim flow
          </p>
          <h1 className="mt-4 text-balance font-display text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl md:text-[2.7rem]">
            Let&apos;s find your cafe listing.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-gray-600 sm:text-lg">
            Select your cafe from our directory to start verification and unlock your Nook business dashboard.
          </p>
        </div>

        <div className="animate-funnel-rise funnel-delay-1 relative z-20 mt-10 w-full">
          <CafeSearchInput />
        </div>

        <div className="animate-funnel-fade funnel-delay-2 relative z-0 mt-8 grid gap-3 text-sm text-gray-500 sm:grid-cols-3">
          <p className="rounded-2xl border border-[#3A5A40]/10 bg-[#F7FAF7] px-4 py-3 text-center">
            Search by cafe name
          </p>
          <p className="rounded-2xl border border-[#3A5A40]/10 bg-[#F7FAF7] px-4 py-3 text-center">
            Choose the right listing
          </p>
          <p className="rounded-2xl border border-[#3A5A40]/10 bg-[#F7FAF7] px-4 py-3 text-center">
            Continue to verification
          </p>
        </div>
      </main>
    </FunnelShell>
  )
}

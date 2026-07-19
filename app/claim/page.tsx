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
      <main className="mx-auto w-full max-w-3xl rounded-2xl bg-white px-5 py-8 shadow-[0_12px_28px_rgba(0,0,0,0.08)] ring-1 ring-zinc-200/70 sm:px-8 sm:py-10">
        <div className="w-full text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#3A5A40]">
            Start claim flow
          </p>
          <h1 className="mt-4 text-balance font-display text-3xl font-semibold tracking-tight text-[#101514] sm:text-4xl md:text-[2.7rem]">
            Let&apos;s find your cafe listing.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-[#3b3b3b] sm:text-lg">
            Select your cafe from our directory to start verification and unlock your Nook business dashboard.
          </p>
        </div>

        <div className="relative z-20 mt-10 w-full">
          <CafeSearchInput />
        </div>

        <div className="relative z-0 mt-8 grid gap-3 text-sm text-[#6b6b6b] sm:grid-cols-3">
          <p className="rounded-2xl border border-zinc-200 bg-[#e3ebe4]/40 px-4 py-3 text-center">
            Search by cafe name
          </p>
          <p className="rounded-2xl border border-zinc-200 bg-[#e3ebe4]/40 px-4 py-3 text-center">
            Choose the right listing
          </p>
          <p className="rounded-2xl border border-zinc-200 bg-[#e3ebe4]/40 px-4 py-3 text-center">
            Continue to verification
          </p>
        </div>
      </main>
    </FunnelShell>
  )
}

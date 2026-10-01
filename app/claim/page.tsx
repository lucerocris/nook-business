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
      <div className="mx-auto w-full max-w-3xl rounded-2xl bg-nk-surface px-5 py-8 shadow-[0_12px_28px_rgba(0,0,0,0.08)] ring-1 ring-nk-line sm:px-8 sm:py-10">
        <div className="w-full text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-nk-green">
            Start claim flow
          </p>
          <h1 className="mt-4 text-balance font-display text-3xl font-semibold tracking-tight text-nk-ink sm:text-4xl md:text-[2.7rem]">
            Let&apos;s find your cafe listing.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-nk-body sm:text-lg">
            Select your cafe from our directory to start verification and unlock your Nook business dashboard.
          </p>
        </div>

        <div className="relative z-20 mt-10 w-full">
          <CafeSearchInput />
        </div>

        <div className="relative z-0 mt-8 grid gap-3 text-sm text-nk-muted sm:grid-cols-3">
          <p className="rounded-2xl border border-nk-line bg-nk-tint/40 px-4 py-3 text-center">
            Search by cafe name
          </p>
          <p className="rounded-2xl border border-nk-line bg-nk-tint/40 px-4 py-3 text-center">
            Choose the right listing
          </p>
          <p className="rounded-2xl border border-nk-line bg-nk-tint/40 px-4 py-3 text-center">
            Continue to verification
          </p>
        </div>
      </div>
    </FunnelShell>
  )
}

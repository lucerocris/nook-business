'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'
import { FunnelShell, FunnelSpread } from '../components/funnel-shell'
import { CafeSearchInput } from '../components/claim/cafe-search-input'

export default function ClaimSearchPage() {
  useEffect(() => {
    document.body.classList.add('navbar-bordered')
    return () => document.body.classList.remove('navbar-bordered')
  }, [])

  return (
    <FunnelShell>
      <FunnelSpread
        stage={1}
        title="Find your cafe on Nook."
        lead="Search by name, then pick your cafe to start verifying it's yours."
      >
        <div className="relative z-20">
          <CafeSearchInput />
        </div>
        <p className="mt-5 text-[14px] text-[var(--nk-muted)]">
          Cafe not on Nook yet?{" "}
          <Link href="/claim/new" className="font-semibold text-[var(--nk-green)] hover:underline">
            Add it
          </Link>
        </p>
      </FunnelSpread>
    </FunnelShell>
  )
}

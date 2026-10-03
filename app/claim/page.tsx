'use client'

import React, { useEffect } from 'react'
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
        label="Claim your cafe · step 1 of 3"
        title="Let's find your cafe listing."
        lead="Pick your cafe from the Nook directory to start verification and open your owner portal."
        aside={
          <ol className="border-t border-[var(--nk-line)]">
            {["Search by cafe name", "Choose the right listing", "Continue to verification"].map((step, i) => (
              <li key={step} className="flex gap-4 border-b border-[var(--nk-line)] py-3">
                <span className="tabular-nums text-[var(--nk-green)]">{i + 1}</span>
                <span className="text-[var(--nk-body)]">{step}</span>
              </li>
            ))}
          </ol>
        }
      >
        <div className="relative z-20">
          <CafeSearchInput />
        </div>
      </FunnelSpread>
    </FunnelShell>
  )
}

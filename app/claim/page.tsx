'use client'

import React, { useEffect } from 'react'
import { CafeSearchInput } from '../components/claim/cafe-search-input'

export default function ClaimSearchPage() {

  useEffect(() => {
    document.body.classList.add('navbar-bordered')
    return () => document.body.classList.remove('navbar-bordered')
  }, [])

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Minimal Onboarding Navbar */}
 

      {/* Centered Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 w-full max-w-2xl mx-auto -mt-20">
        
        <div className="w-full text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 tracking-tight">
            Hello! Let&apos;s start with your cafe name!
          </h1>
          <p className="text-lg text-gray-500">
            Search or add your business name below.
          </p>
        </div>

        {/* Search Input Container */}
        <div className="w-full max-w-lg mx-auto">
          <CafeSearchInput />
        </div>

      </main>
    </div>
  )
}
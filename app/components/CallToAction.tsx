import React from 'react'
import Link from 'next/link'

export default function CallToAction() {
  return (
    <section className="bg-[#3A5A40] py-20 lg:py-28 relative overflow-hidden">
      {/* Optional subtle background pattern or gradient overlay could go here */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
      
      <div className="relative max-w-4xl mx-auto px-6 text-center z-10">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 tracking-tight">
          Ready to put your cafe on the map?
        </h2>
        
        <p className="text-green-50 text-lg md:text-xl mb-10 max-w-2xl mx-auto font-light">
          Join Cebu&apos;s finest independent cafes. Claim your free profile and take control of your digital storefront today.
        </p>
        
        {/* Link this href to the ID of your hero search section */}
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href="#hero"
            className="inline-flex items-center justify-center px-8 py-4 text-base md:text-lg font-bold text-[#3A5A40] bg-white rounded-md shadow-lg hover:bg-gray-50 hover:scale-105 transition-all duration-200"
          >
            Search for your cafe
          </a>
          <Link
            href="/claim"
            className="inline-flex items-center justify-center px-8 py-4 text-base md:text-lg font-semibold text-white/90 border border-white/40 rounded-md hover:bg-white/10 transition-colors"
          >
            Preview dashboard
          </Link>
        </div>
      </div>
    </section>
  )
}

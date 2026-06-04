import Link from 'next/link'
import React from 'react'

export default function Footer() {
  return (
    <footer className="bg-[#3A5A40] border-t border-white/10 pt-8 pb-12">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 items-center gap-8 md:gap-6">
        {/* Left Side: Logo */}
        <div className="flex items-center justify-center md:justify-start">
          <Link href="/" className="flex items-center">
            <img
              src="https://lucerocris.sgp1.cdn.digitaloceanspaces.com/nook-sites/logo.svg"
              alt="Nook for Business"
              className="h-8 w-auto opacity-90 hover:opacity-100 transition-opacity filter brightness-0 invert"
            />
          </Link>
        </div>

        {/* Center: Copyright */}
        <p className="text-white/60 text-sm text-center md:justify-self-center">
          © 2026 Nook. All rights reserved.
        </p>

        {/* Right Side: Links */}
        <nav className="flex items-center justify-center md:justify-end flex-wrap gap-6 text-sm text-white/60">
          <Link href="/privacy" className="hover:text-white transition-colors">
            Privacy Policy
          </Link>
          <Link href="/support" className="hover:text-white transition-colors">
            Merchant Support
          </Link>
        </nav>
      </div>
    </footer>
  )
}
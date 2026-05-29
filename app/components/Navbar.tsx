'use client'

import Link from 'next/link'
import React, { useState } from 'react'

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <>
      <nav className={`navbar${isMobileMenuOpen ? ' is-menu-open' : ''} bg-white py-4 border-b border-gray-100`}>
        <div className="navbar-content flex justify-between items-center max-w-7xl mx-auto w-full">
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex w-full items-center justify-between">
            
            {/* Left side: Logo & Navigation Links */}
            <div className="flex items-center gap-10">
              <Link href="/" className="navbar-logo flex items-center shrink-0">
                <img src="/logo.svg" alt="Nook for Business" className="w-20" />
              </Link>

              <ul className="navbar-links flex items-center gap-6 text-sm lg:text-base font-medium text-gray-700">
                <li>
                  <Link href="/" className="hover:text-[#3A5A40] transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="#features" className="hover:text-[#3A5A40] transition-colors">
                    Features
                  </Link>
                </li>
              </ul>
            </div>

            {/* Right side: Auth & CTA Buttons */}
            <div className="flex items-center gap-4">
              {/* Log in Skeleton (Ghost) Button */}
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-6 py-2.5 border border-[#3A5A40] text-[#3A5A40] bg-transparent rounded-md text-sm font-medium hover:bg-[#3A5A40]/10 transition-colors"
              >
                Log in
              </Link>

              {/* Claim Your Cafe Solid Button */}
              <Link
                href="/claim"
                className="inline-flex items-center justify-center px-6 py-2.5 border border-[#3A5A40] bg-[#3A5A40] text-white rounded-md text-sm font-medium hover:bg-[#2b442f] transition-colors shadow-sm"
              >
                Claim Your Cafe
              </Link>
            </div>
          </div>

          {/* Mobile Navigation Header */}
          <div className="flex md:hidden w-full h-full items-center justify-between">
            <Link href="/" className="navbar-logo flex items-center">
              <img src="/logo.svg" alt="Nook for Business" className="w-24" />
            </Link>
            <button
              className={`navbar-hamburger p-2 flex flex-col gap-1.5 ${isMobileMenuOpen ? 'open' : ''}`}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {/* Simple CSS Hamburger lines if you aren't using an icon library */}
              <span className={`block w-6 h-0.5 bg-gray-800 transition-transform ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block w-6 h-0.5 bg-gray-800 transition-opacity ${isMobileMenuOpen ? 'opacity-0' : ''}`} />
              <span className={`block w-6 h-0.5 bg-gray-800 transition-transform ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      <div className={`mobile-menu-wrapper block md:hidden fixed inset-0 z-50 bg-white transform transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`} style={{ top: '72px' }}>
        <div className="flex flex-col gap-8 w-full p-6 h-full border-t border-gray-100">
          
          <ul className="flex flex-col gap-6 text-2xl font-medium text-gray-800">
            <li>
              <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
                Home
              </Link>
            </li>
            <li>
              <Link href="#features" onClick={() => setIsMobileMenuOpen(false)}>
                Features
              </Link>
            </li>
          </ul>

          <div className="flex flex-col gap-4 mt-auto pb-12">
            <Link
              href="/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full inline-flex items-center justify-center px-6 py-3 border border-[#3A5A40] text-[#3A5A40] bg-transparent rounded-md text-lg font-medium"
            >
              Log in
            </Link>
            <Link
              href="/claim"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full inline-flex items-center justify-center px-6 py-3 border border-[#3A5A40] bg-[#3A5A40] text-white rounded-md text-lg font-medium"
            >
              Claim Your Cafe
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
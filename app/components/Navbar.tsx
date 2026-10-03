"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { User } from "@supabase/supabase-js";
import { useSupabase } from "@/lib/supabase/context";
import { SELF_SERVE_CLAIM_ENABLED } from "@/lib/features";

// Absolute (/#…) so they also work from /login and /claim, where the navbar
// is shown too.
const SECTION_LINKS = [
  { label: "Features", href: "/#features" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "FAQ", href: "/#faq" },
];

type NavbarProps = {
  initialUser: User | null;
};

export function Navbar({ initialUser }: NavbarProps) {
  const supabase = useSupabase();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const [user, setUser] = useState<User | null>(initialUser);

  const avatarUrl = user?.user_metadata?.avatar_url ?? null;

  const displayName =
    user?.user_metadata?.full_name || user?.email || "Account";

  const initials = useMemo(() => {
    const raw = displayName.trim();

    if (!raw) return "A";

    const parts = raw.split(" ").filter(Boolean);

    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }

    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }, [displayName]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 8);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadUser = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (isMounted) {
        setUser(data.user ?? null);
      }
    };

    void loadUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (isMounted) {
          setUser(session?.user ?? null);
          setIsUserMenuOpen(false);
        }
      },
    );

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [supabase, initialUser]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();

    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <nav
        className={`navbar${isMobileMenuOpen ? " bg-white" : ""}${isScrolled ? " is-scrolled" : ""} py-4 transition-colors`}
      >
        <div className="navbar-content flex justify-between items-center max-w-7xl mx-auto w-full">
          {/* Desktop Navigation */}
          <div className="hidden md:flex w-full items-center justify-between">
            {/* Left side: Logo & Navigation Links */}
            <div className="flex items-center gap-10">
              <Link href="/" className="navbar-logo flex items-center shrink-0">
                <img src="https://lucerocris.sgp1.cdn.digitaloceanspaces.com/nook-sites/logo.svg" alt="Nook for Business" className="w-20" />
              </Link>
              <ul className="flex items-center gap-7">
                {SECTION_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm font-medium text-[var(--nk-body)] transition-colors hover:text-[var(--nk-green)]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right side: Auth & CTA Buttons */}
            <div className="flex items-center gap-2">
              {user ? (
                <div className="relative">
                  <button
                    type="button"
                    className="flex items-center gap-2 rounded-full border border-gray-200 px-2 py-1.5 transition-colors hover:bg-gray-50"
                    onClick={() => setIsUserMenuOpen((open) => !open)}
                    aria-haspopup="menu"
                    aria-expanded={isUserMenuOpen}
                    aria-label="Account menu"
                  >
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={displayName}
                        className="h-9 w-9 rounded-full object-cover"
                      />
                    ) : (
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#3A5A40]/10 text-sm font-semibold text-[#3A5A40]">
                        {initials}
                      </span>
                    )}
                    <span className="hidden text-sm font-medium text-gray-700 sm:inline">
                      {displayName}
                    </span>
                  </button>

                  <div
                    className={`absolute right-0 mt-2 w-40 rounded-xl border border-gray-200 bg-white p-2 transition-opacity ${
                      isUserMenuOpen
                        ? "pointer-events-auto opacity-100"
                        : "pointer-events-none opacity-0"
                    }`}
                    role="menu"
                    // opacity-0 only hides it visually; inert keeps the closed
                    // menu's items out of the tab order and accessibility tree.
                    inert={!isUserMenuOpen}
                  >
                    {/* A signed-in user with a pending claim has no owner row
                        yet, so /owner/* redirects them away. Without this link
                        there was no way back to their claim. */}
                    <Link
                      href="/claim/status"
                      className="block w-full rounded-lg px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsUserMenuOpen(false)}
                      role="menuitem"
                    >
                      Claim status
                    </Link>
                    <button
                      type="button"
                      className="w-full rounded-lg px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                      onClick={handleSignOut}
                      role="menuitem"
                    >
                      Log out
                    </button>
                  </div>
                </div>
              ) : (
                <Link href="/login" className="nk-btn nk-btn-secondary">
                  Log in
                </Link>
              )}

              {SELF_SERVE_CLAIM_ENABLED && (
                <Link href="/claim" className="nk-btn nk-btn-primary">
                  Claim your cafe
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Navigation Header */}
          <div className="flex md:hidden w-full h-full items-center justify-between relative">
            <Link href="/" className="navbar-logo flex items-center">
              <img src="https://lucerocris.sgp1.cdn.digitaloceanspaces.com/nook-sites/logo.svg" alt="Nook for Business" className="w-24" />
            </Link>
            <div className="flex items-center gap-3">
              {user ? (
                <button
                  type="button"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200"
                  onClick={() => setIsUserMenuOpen((open) => !open)}
                  aria-label="Account menu"
                  aria-haspopup="menu"
                  aria-expanded={isUserMenuOpen}
                >
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={displayName}
                      className="h-9 w-9 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-semibold text-[#3A5A40]">
                      {initials}
                    </span>
                  )}
                </button>
              ) : null}

              <button
                className={`navbar-hamburger p-2 flex flex-col gap-1.5 ${isMobileMenuOpen ? "open" : ""}`}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {/* Simple CSS Hamburger lines if you aren't using an icon library */}
                <span
                  className={`block w-6 h-0.5 bg-gray-800 transition-transform ${isMobileMenuOpen ? "rotate-45 translate-y-2" : ""}`}
                />
                <span
                  className={`block w-6 h-0.5 bg-gray-800 transition-opacity ${isMobileMenuOpen ? "opacity-0" : ""}`}
                />
                <span
                  className={`block w-6 h-0.5 bg-gray-800 transition-transform ${isMobileMenuOpen ? "-rotate-45 -translate-y-2" : ""}`}
                />
              </button>
            </div>

            {user ? (
              <div
                className={`absolute right-0 top-14 w-40 rounded-xl border border-gray-200 bg-white p-2 transition-opacity ${
                  isUserMenuOpen
                    ? "pointer-events-auto opacity-100"
                    : "pointer-events-none opacity-0"
                }`}
                role="menu"
                inert={!isUserMenuOpen}
              >
                <button
                  type="button"
                  className="w-full rounded-lg px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                  onClick={handleSignOut}
                  role="menuitem"
                >
                  Log out
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      <div
        className={`mobile-menu-wrapper block md:hidden fixed inset-0 z-40 bg-white transform transition-transform duration-300 ${isMobileMenuOpen ? "translate-x-0" : "translate-x-full"}`}
        // Off-canvas but still in the DOM: without inert its links stayed
        // focusable and announced while the drawer was closed.
        inert={!isMobileMenuOpen}
      >
        <div className="flex flex-col gap-8 w-full p-6 pt-28 h-full">
          <ul className="flex flex-col border-t border-[var(--nk-line)]">
            {SECTION_LINKS.map((link) => (
              <li key={link.href} className="border-b border-[var(--nk-line)]">
                <Link
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-4 text-2xl font-semibold tracking-[-0.02em] text-[var(--nk-ink)]"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-3">
            {user ? (
              <>
                <Link
                  href="/claim/status"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="nk-btn nk-btn-secondary w-full"
                >
                  Claim status
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="nk-btn nk-btn-secondary w-full"
                >
                  Log out
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="nk-btn nk-btn-secondary w-full"
              >
                Log in
              </Link>
            )}

            {SELF_SERVE_CLAIM_ENABLED && (
              <Link
                href="/claim"
                onClick={() => setIsMobileMenuOpen(false)}
                className="nk-btn nk-btn-primary w-full"
              >
                Claim your cafe
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

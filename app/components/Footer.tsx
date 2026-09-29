import Link from "next/link";

const LOGO_URL =
  "https://lucerocris.sgp1.cdn.digitaloceanspaces.com/nook-sites/logo.svg";

type FooterLink = { label: string; href: string; external?: boolean };

// Privacy and support live in the separate nook-privacy site; relative hrefs
// to them 404 here.
const columns: { heading: string; links: FooterLink[] }[] = [
  {
    heading: "For owners",
    links: [
      { label: "Claim your cafe", href: "/claim" },
      { label: "Owner log in", href: "/login" },
      { label: "Claim status", href: "/claim/status" },
    ],
  },
  {
    heading: "Nook",
    links: [
      { label: "Find a cafe", href: "https://www.nookph.app", external: true },
      {
        label: "Instagram",
        href: "https://instagram.com/nook_cafefinder",
        external: true,
      },
    ],
  },
  {
    heading: "Help",
    links: [
      {
        label: "Merchant support",
        href: "https://privacy.nookph.app/support.html",
        external: true,
      },
      {
        label: "Privacy policy",
        href: "https://privacy.nookph.app/",
        external: true,
      },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-[var(--nk-green)] text-white">
      <div className="nk-container grid gap-12 pb-10 pt-16 sm:pt-20 lg:grid-cols-[1.2fr_2fr]">
        <div>
          <Link href="/" className="inline-flex rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
            <img
              src={LOGO_URL}
              alt="Nook for Business"
              className="h-8 w-auto brightness-0 invert"
            />
          </Link>
          <p className="mt-6 max-w-sm text-[22px] font-semibold leading-snug tracking-[-0.01em]">
            Skip the search. Find nook.
          </p>
          <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-white/80">
            Nook for Business is where cafe owners claim and manage their
            Nook listing.
          </p>
        </div>

        <nav
          aria-label="Footer"
          className="grid grid-cols-2 gap-10 sm:grid-cols-3"
        >
          {columns.map((column) => (
            <div key={column.heading}>
              <p className="nk-meta text-white/65">{column.heading}</p>
              <ul className="mt-4 space-y-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[15px] text-white/90 transition-colors hover:text-white hover:underline hover:underline-offset-4"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-[15px] text-white/90 transition-colors hover:text-white hover:underline hover:underline-offset-4"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      <div className="nk-container flex flex-col gap-2 border-t border-white/15 py-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="nk-meta text-white/65">© 2026 Nook. All rights reserved.</p>
        <p className="nk-meta text-white/65">business.nookph.app</p>
      </div>
    </footer>
  );
}

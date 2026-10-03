import Link from "next/link";
import { SELF_SERVE_CLAIM_ENABLED } from "@/lib/features";
import { ListingCard } from "./landing/drawn-ui";

export default function CallToAction() {
  return (
    <section className="bg-white pb-20 sm:pb-28">
      <div className="nk-container">
        <div className="nk-panel grid items-center gap-10 overflow-hidden rounded-xl px-6 pt-12 sm:px-12 sm:pt-16 lg:grid-cols-[1.3fr_1fr] lg:gap-16 lg:px-16 lg:py-20">
          <div className="text-white">
            <p className="nk-meta text-white/70">
              You&apos;ve reached the end, so now…
            </p>
            <h2 className="nk-h2 mt-4 !text-white">
              Find your cafe.
              <br />
              <span className="text-[var(--nk-timberwolf)]">
                Make the listing yours.
              </span>
            </h2>
            <p className="nk-lead mt-5 max-w-xl !text-white/85">
              Search for your cafe, get your verification code, and send it
              from your cafe&apos;s Instagram. That&apos;s the whole process.
            </p>
            <div className="mt-8 flex flex-wrap gap-2">
              {SELF_SERVE_CLAIM_ENABLED ? (
                <Link
                  href="/claim"
                  className="nk-btn bg-white text-[var(--nk-green)] hover:bg-[var(--nk-tint)]"
                >
                  Claim my cafe
                </Link>
              ) : null}
              <Link
                href="/login"
                className="nk-btn border border-white/35 text-white hover:bg-white/10"
              >
                Owner log in
              </Link>
            </div>
          </div>

          {/* Echoes the hero: the listing card, bleeding off the bottom. */}
          <div aria-hidden="true" className="mx-auto w-full max-w-sm self-end lg:-mb-20">
            <ListingCard className="rounded-b-none border-b-0" />
          </div>
        </div>
      </div>
    </section>
  );
}

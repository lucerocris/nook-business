import Link from "next/link";
import { SELF_SERVE_CLAIM_ENABLED } from "@/lib/features";

// The page's one dark band (design.md, Emphasis): text only, no photo.
export default function CallToAction() {
  return (
    <section className="nk-panel text-white">
      <div className="nk-container grid gap-10 py-20 sm:py-28 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:items-end lg:gap-20">
        <div>
          <h2 className="nk-h2 !text-white">
            Find your cafe.{" "}
            <span className="text-[var(--nk-timberwolf)]">Make the listing yours.</span>
          </h2>
          <p className="mt-6 max-w-[52ch] text-[17px] leading-relaxed text-white/85">
            Search for your cafe, get your verification code, and send it from
            your cafe&apos;s Instagram. That&apos;s the whole process.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 lg:justify-end">
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
    </section>
  );
}

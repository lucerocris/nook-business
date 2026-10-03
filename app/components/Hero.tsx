import Image from "next/image";
import Link from "next/link";
import { CafeSearchInput } from "./claim/cafe-search-input";
import { SELF_SERVE_CLAIM_ENABLED } from "@/lib/features";

const INSTAGRAM_URL = "https://instagram.com/nook_cafefinder";

// A hairline drawing of a listing with callouts naming what the owner controls
// (structure after Raycast's drawn product object; its background grid was tried and removed). The one photograph on the
// landing sits in its image slot: Flavour Coffee Station's own hero photo from
// its Nook listing (cafes/25fb8e47-…/hero.webp), chosen 2026-10-03. Swap the
// file to change it; keep it a real listed cafe, no people in frame.
const CALLOUTS = [
  { top: "14%", label: "Photos you choose" },
  { top: "53%", label: "Hours you keep current" },
  { top: "68%", label: "Tags people filter by" },
  { top: "87%", label: "Menu and prices" },
] as const;

function HeroListing() {
  return (
    <div className="relative mx-auto w-full max-w-[340px] xl:mx-0">
      <div className="overflow-hidden rounded-[2px] border border-[var(--nk-ink)]/15 bg-white">
        <div className="relative aspect-[16/10] border-b border-[var(--nk-line)] bg-[var(--nk-bg-2)]">
          <Image
            src="/landing/hero-flavour-coffee-station.webp"
            alt=""
            fill
            priority
            sizes="(min-width: 1280px) 340px, 90vw"
            className="object-cover"
          />
        </div>
        <div className="space-y-4 p-5">
          <div>
            <p className="text-[17px] font-semibold text-[var(--nk-ink)]">Your cafe</p>
            <p className="mt-1 flex items-center gap-1.5 text-[13px] text-[var(--nk-body)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#0F893E]" />
              Open until 10:00 PM
            </p>
          </div>
          <div className="border-y border-[var(--nk-line)] py-3 text-[13px]">
            <div className="flex justify-between">
              <span className="text-[var(--nk-muted)]">Today</span>
              <span className="tabular-nums text-[var(--nk-ink)]">8:00 AM – 10:00 PM</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {["Free WiFi", "Power Outlets", "Open Late"].map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-[var(--nk-fern)] px-2.5 py-1 text-[11px] font-medium text-[var(--nk-green)]"
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="space-y-2 border-t border-[var(--nk-line)] pt-3 text-[13px]">
            {[
              ["Spanish Latte", "₱160"],
              ["Iced Americano", "₱130"],
            ].map(([name, price]) => (
              <div key={name} className="flex justify-between">
                <span className="text-[var(--nk-body)]">{name}</span>
                <span className="font-medium tabular-nums text-[var(--nk-ink)]">{price}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {CALLOUTS.map((c) => (
        <span
          key={c.label}
          style={{ top: c.top }}
          className="absolute left-full hidden items-center gap-2 whitespace-nowrap text-[12px] font-medium text-[var(--nk-muted)] xl:flex"
        >
          <span className="h-px w-6 bg-[var(--nk-ink)]/25" />
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--nk-fern)]" />
          {c.label}
        </span>
      ))}
    </div>
  );
}

export function Hero() {
  return (
    <section id="hero" className="border-b border-[var(--nk-line)] pb-16 pt-28 sm:pb-24 sm:pt-36 lg:pb-28 lg:pt-44">
      <div className="nk-container grid grid-cols-1 gap-14 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:items-center lg:gap-16 [&>*]:min-w-0">
        <div>
          <p className="text-[14px] font-medium text-[var(--nk-muted)]">
            Nook for Business · free for cafe owners
          </p>

          <h1 className="nk-h1 mt-6 max-w-[15ch]">
            Claim your cafe on Nook. Keep every detail right.
          </h1>

          <p className="mt-8 max-w-[52ch] text-[17px] leading-relaxed text-[var(--nk-body)] sm:text-[18px]">
            People use Nook to find a cafe with{" "}
            <span className="whitespace-nowrap">Wi-Fi</span>, outlets or a late
            closing time. Claim your listing to keep your hours, menu and
            photos accurate, and see how often people find you.
          </p>

          <div id="find-your-cafe" className="mt-10 w-full max-w-xl scroll-mt-32">
            {SELF_SERVE_CLAIM_ENABLED ? (
              <CafeSearchInput />
            ) : (
              <div className="flex flex-wrap gap-2">
                <Link href="/login" className="nk-btn nk-btn-primary">
                  Owner sign in
                </Link>
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="nk-btn nk-btn-secondary"
                >
                  Get your cafe listed
                </a>
              </div>
            )}
          </div>

          <p className="mt-4 text-[14px] text-[var(--nk-muted)]">
            Can&apos;t find your cafe?{" "}
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="nk-link"
            >
              Ask us to add it
            </a>
          </p>
        </div>

        <figure
          aria-label="Illustration: a cafe listing on Nook, with labels for the parts the owner controls: photos, hours, tags, and the menu with prices."
          className="relative"
        >
          <HeroListing />
        </figure>
      </div>
    </section>
  );
}

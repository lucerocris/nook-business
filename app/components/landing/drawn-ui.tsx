// Product UI drawn as illustration rather than screenshots: skeleton cards
// with one or two real labels each. They stay sharp at any width, never go
// stale when the portal changes, and carry no customer data.
//
// Everything here is decorative. Callers wrap a composition in a single
// element with role="img" and an aria-label that says what it shows.
// Numbers are deliberately absent from the stats cards: an illustration is no
// place for a traffic figure a reader could mistake for a real one.

import Image from "next/image";
import {
  Check,
  Coffee,
  InstagramLogo,
  MagnifyingGlass,
  MapPin,
  SealCheck,
} from "@phosphor-icons/react/dist/ssr";

function Card({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-[2px] border border-[var(--nk-line)] bg-white ${className}`}
    >
      {children}
    </div>
  );
}

function Chip({
  children,
  active = true,
}: {
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium ${
        active
          ? "bg-[var(--nk-tint)] text-[var(--nk-green)]"
          : "border border-[var(--nk-line)] text-[var(--nk-muted)]"
      }`}
    >
      {children}
    </span>
  );
}

/** What a customer sees: the cafe's listing in the Nook app. */
export function ListingCard({ className = "" }: { className?: string }) {
  return (
    <Card className={`overflow-hidden ${className}`}>
      <div className="relative flex aspect-[16/9] items-center justify-center bg-[var(--nk-timberwolf)]">
        <Coffee size={44} weight="light" className="text-[var(--nk-fern)]" />
        <span className="absolute left-3 top-3 rounded-full bg-white px-2 py-0.5 text-[10px] font-medium text-[var(--nk-green)]">
          Your photos
        </span>
      </div>
      <div className="space-y-3 p-4">
        <div>
          <p className="text-[15px] font-semibold text-[var(--nk-ink)]">
            Your Cafe
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-[12px] text-[var(--nk-muted)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#0F893E]" />
            Open until 10:00 PM
            <span aria-hidden="true">·</span>
            <MapPin size={12} />
            Cebu City
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Chip>Free WiFi</Chip>
          <Chip>Power Outlets</Chip>
          <Chip>Specialty Coffee</Chip>
        </div>
        <div className="space-y-2 border-t border-[var(--nk-line)] pt-3 text-[12px]">
          <MenuRow name="Spanish Latte" price="₱160" />
          <MenuRow name="Iced Americano" price="₱130" />
        </div>
      </div>
    </Card>
  );
}

function MenuRow({ name, price }: { name: string; price: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[var(--nk-body)]">{name}</span>
      <span className="font-medium tabular-nums text-[var(--nk-ink)]">
        {price}
      </span>
    </div>
  );
}

const HOURS = [
  ["Mon", "8:00 AM", "10:00 PM"],
  ["Tue", "8:00 AM", "10:00 PM"],
  ["Wed", "8:00 AM", "10:00 PM"],
  ["Thu", "8:00 AM", "10:00 PM"],
  ["Fri", "8:00 AM", "12:00 AM"],
  ["Sat", "9:00 AM", "12:00 AM"],
  ["Sun", null, null],
] as const;

/** What the owner edits: the hours section of Edit Listing. */
export function HoursCard({
  className = "",
  showToast = true,
  rows = 7,
}: {
  className?: string;
  showToast?: boolean;
  rows?: number;
}) {
  return (
    <Card className={`p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-semibold text-[var(--nk-ink)]">
          Opening hours
        </p>
        <span className="text-[11px] text-[var(--nk-muted)]">Edit listing</span>
      </div>
      <ul className="mt-3 space-y-1.5">
        {HOURS.slice(0, rows).map(([day, open, close]) => (
          <li
            key={day}
            className="flex items-center gap-2 text-[12px] text-[var(--nk-body)]"
          >
            <span className="w-8 font-medium text-[var(--nk-ink)]">{day}</span>
            {open ? (
              <>
                <span className="flex-1 rounded-[2px] border border-[var(--nk-line)] px-2 py-1 tabular-nums">
                  {open}
                </span>
                <span className="flex-1 rounded-[2px] border border-[var(--nk-line)] px-2 py-1 tabular-nums">
                  {close}
                </span>
              </>
            ) : (
              <span className="flex-1 rounded-[2px] bg-[var(--nk-bg-2)] px-2 py-1 text-[var(--nk-muted)]">
                Closed
              </span>
            )}
          </li>
        ))}
      </ul>
      {showToast ? (
        <div className="mt-3 flex items-center gap-2 rounded-[2px] bg-[var(--nk-tint)] px-3 py-2 text-[12px] font-medium text-[var(--nk-green)]">
          <Check size={14} weight="bold" />
          Hours updated
        </div>
      ) : null}
    </Card>
  );
}

const INSIGHTS = [
  ["Profile views", "88%"],
  ["Route requests", "46%"],
  ["Times saved", "62%"],
  ["Hours checked", "74%"],
] as const;

/** The dashboard's 30-day traffic card, without numbers (see file note). */
export function InsightsCard({ className = "" }: { className?: string }) {
  return (
    <Card className={`p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-semibold text-[var(--nk-ink)]">
          App traffic
        </p>
        <span className="text-[11px] text-[var(--nk-muted)]">Last 30 days</span>
      </div>
      <ul className="mt-3 space-y-3">
        {INSIGHTS.map(([label, width]) => (
          <li key={label}>
            <p className="text-[12px] text-[var(--nk-body)]">{label}</p>
            <span className="mt-1.5 block h-2 rounded-full bg-[var(--nk-bg-2)]">
              <span
                className="block h-2 rounded-full bg-[var(--nk-fern)]"
                style={{ width }}
              />
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

/** Menu editor: categories and items with prices. */
export function MenuCard({ className = "" }: { className?: string }) {
  return (
    <Card className={`p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-semibold text-[var(--nk-ink)]">Menu</p>
        <span className="rounded-full bg-[var(--nk-green)] px-2.5 py-1 text-[11px] font-medium text-white">
          + Add item
        </span>
      </div>
      <div className="mt-3 flex gap-1.5">
        <Chip>Coffee</Chip>
        <Chip active={false}>Non-coffee</Chip>
        <Chip active={false}>Pastries</Chip>
      </div>
      <div className="mt-3 space-y-2.5 text-[12px]">
        {[
          ["Spanish Latte", "₱160"],
          ["Iced Americano", "₱130"],
          ["Sea Salt Latte", "₱175"],
        ].map(([name, price]) => (
          <div key={name} className="flex items-center gap-3">
            <span className="h-8 w-8 shrink-0 rounded-[2px] bg-[var(--nk-timberwolf)]" />
            <span className="flex-1 text-[var(--nk-body)]">{name}</span>
            <span className="font-medium tabular-nums text-[var(--nk-ink)]">
              {price}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

/** Photos page: a hero photo plus a gallery grid. */
// Filled with Flavour Coffee Station's own listing photos (hero plus three of
// its gallery shots, cropped square), the same cafe as the landing hero.
const GALLERY = [
  "/landing/flavour-pour-over.webp",
  "/landing/flavour-latte.webp",
  "/landing/flavour-exterior.webp",
];

export function PhotosCard({ className = "" }: { className?: string }) {
  return (
    <Card className={`p-4 ${className}`}>
      <p className="text-[13px] font-semibold text-[var(--nk-ink)]">Photos</p>
      <div className="relative mt-3 aspect-[16/8] overflow-hidden rounded-[2px] bg-[var(--nk-timberwolf)]">
        <Image
          src="/landing/hero-flavour-coffee-station.webp"
          alt=""
          fill
          sizes="352px"
          className="object-cover"
        />
        <span className="absolute left-2 top-2 rounded-full bg-[var(--nk-green)] px-2 py-0.5 text-[10px] font-medium text-white">
          Hero
        </span>
      </div>
      <div className="mt-2 grid grid-cols-4 gap-2">
        {GALLERY.map((src) => (
          <span
            key={src}
            className="relative aspect-square overflow-hidden rounded-[2px] bg-[var(--nk-bg-2)]"
          >
            <Image src={src} alt="" fill sizes="88px" className="object-cover" />
          </span>
        ))}
        <span className="flex aspect-square items-center justify-center rounded-[2px] border border-dashed border-[var(--nk-sage)] text-[16px] text-[var(--nk-green)]">
          +
        </span>
      </div>
    </Card>
  );
}

// Real tag names from the shared `tags` table.
const TAGS: [string, boolean][] = [
  ["Free WiFi", true],
  ["Power Outlets", true],
  ["Air Conditioned", true],
  ["Solo Work / Study", true],
  ["Late Night", false],
  ["Outdoor Seating", false],
  ["Specialty Coffee", true],
  ["Pet Friendly", false],
  ["Parking Available", false],
  ["Group Hangout", true],
  ["E-wallet", true],
  ["Date Spot", false],
];

export function TagsCard({ className = "" }: { className?: string }) {
  return (
    <Card className={`p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-semibold text-[var(--nk-ink)]">Tags</p>
        <span className="text-[11px] text-[var(--nk-muted)]">7 selected</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {TAGS.map(([name, active]) => (
          <Chip key={name} active={active}>
            {name}
          </Chip>
        ))}
      </div>
    </Card>
  );
}

/** Reviews list with the report action owners actually have. */
export function ReviewsCard({ className = "" }: { className?: string }) {
  return (
    <Card className={`p-4 ${className}`}>
      <p className="text-[13px] font-semibold text-[var(--nk-ink)]">Reviews</p>
      <ul className="mt-3 space-y-3">
        {[0, 1].map((i) => (
          <li key={i} className="flex gap-3">
            <span className="h-7 w-7 shrink-0 rounded-full bg-[var(--nk-timberwolf)]" />
            <span className="flex-1 space-y-1.5 pt-1">
              <span className="nk-bar w-1/3" />
              <span className="nk-bar w-full" />
              <span className="nk-bar w-4/5" />
            </span>
            {i === 1 ? (
              <span className="self-start rounded-full border border-[var(--nk-line)] px-2 py-0.5 text-[10px] font-medium text-[var(--nk-muted)]">
                Report
              </span>
            ) : null}
          </li>
        ))}
      </ul>
    </Card>
  );
}

/* ---------- Step visuals for "How claiming works" ---------- */

export function SearchStepVisual() {
  return (
    <Card className="p-3">
      <div className="flex items-center gap-2 rounded-full border border-[var(--nk-line)] px-3 py-2 text-[12px] text-[var(--nk-ink)]">
        <MagnifyingGlass size={14} />
        Your Caf
        <span className="-ml-2 h-3.5 w-px bg-[var(--nk-ink)]" />
      </div>
      <div className="mt-2 rounded-[2px] bg-[var(--nk-tint)]/60 px-3 py-2">
        <p className="text-[12px] font-semibold text-[var(--nk-ink)]">
          Your Cafe
        </p>
        <p className="text-[11px] text-[var(--nk-muted)]">Cebu City</p>
      </div>
    </Card>
  );
}

export function CodeStepVisual() {
  return (
    <Card className="p-3">
      <div className="flex items-center gap-2 text-[12px] font-medium text-[var(--nk-ink)]">
        <InstagramLogo size={16} />
        @nook_cafefinder
      </div>
      <div className="mt-2 flex justify-end">
        <span className="rounded-[2px] rounded-br-[2px] bg-[var(--nk-green)] px-3 py-2 font-mono text-[12px] tracking-[0.2em] text-white">
          ••••••
        </span>
      </div>
      <p className="mt-1.5 text-right text-[10px] text-[var(--nk-muted)]">
        Sent from your cafe&apos;s account
      </p>
    </Card>
  );
}

export function ApprovedStepVisual() {
  return (
    <Card className="flex items-center gap-3 p-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--nk-tint)] text-[var(--nk-green)]">
        <SealCheck size={20} weight="fill" />
      </span>
      <div>
        <p className="text-[12px] font-semibold text-[var(--nk-ink)]">
          Claim approved
        </p>
        <p className="text-[11px] text-[var(--nk-muted)]">
          Owner portal unlocked
        </p>
      </div>
    </Card>
  );
}

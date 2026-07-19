"use client";

import {
  useEffect,
  useRef,
  useState,
  useTransition,
  type ChangeEvent,
} from "react";
import { useRouter } from "next/navigation";
import { useCafeSearch } from "@/hooks/use-cafe-search";
import { Spinner } from "@/components/ui/spinner";

type CafeResult = {
  id?: string | number | null;
  name?: string | null;
  address?: string | null;
  city?: string | null;
  has_pending_claim?: boolean | null;
};

const normalizeCafeResult = (result: unknown): CafeResult | null => {
  if (!result || typeof result !== "object") return null;
  const data = result as Record<string, unknown>;
  return {
    id: (data.id as string | number | null) ?? null,
    name: typeof data.name === "string" ? data.name : null,
    address: typeof data.address === "string" ? data.address : null,
    city: typeof data.city === "string" ? data.city : null,
    has_pending_claim: Boolean(data.has_pending_claim),
  };
};

export function CafeSearchInput() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedCafeId, setSelectedCafeId] = useState<string | null>(null);
  const debounceRef = useRef<number | null>(null);
  const { results, loading, error, search } = useCafeSearch();

  // /claim/[cafeId] is a server-rendered route, so router.push can take a
  // noticeable moment with no visual change — the row looked unresponsive and
  // invited double-clicks. useTransition surfaces that wait; `navigatingId`
  // tracks WHICH row was chosen so the spinner appears on that row.
  const [isNavigating, startNavigation] = useTransition();
  const [navigatingId, setNavigatingId] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, []);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value;
    const trimmedValue = nextValue.trim();

    setSearchQuery(nextValue);
    setSelectedCafeId(null);

    if (debounceRef.current) window.clearTimeout(debounceRef.current);

    if (!trimmedValue) {
      setHasSearched(false);
      return;
    }

    debounceRef.current = window.setTimeout(() => {
      setHasSearched(true);
      search(trimmedValue);
    }, 300);
  };

  const handleSelect = (cafeId: string) => {
    if (isNavigating) return; // ignore repeat taps while a claim is opening
    setSelectedCafeId(cafeId);
    setNavigatingId(cafeId);
    startNavigation(() => {
      router.push(`/claim/${cafeId}`);
    });
  };

  const handleVerifyClaim = () => {
    if (!selectedCafeId || isNavigating) return;
    setNavigatingId(selectedCafeId);
    startNavigation(() => {
      router.push(`/claim/${selectedCafeId}`);
    });
  };

  const normalizedResults = Array.isArray(results) ? results : [];
  const cafes = normalizedResults
    .map(normalizeCafeResult)
    .filter((cafe): cafe is CafeResult => Boolean(cafe && cafe.id));

  const hasQuery = searchQuery.trim().length > 0;
  const showDropdown = hasQuery && (loading || hasSearched || cafes.length > 0 || error);

  return (
    <div className="relative w-full">
      {/* Mirrors the webapp's HeroSearch: a single rounded-full form with the
          magnifier inline, the action as a pill on the right, and the focus
          indicator on the wrapper via :focus-within (the input itself has no
          outline, so without this there'd be no visible focus state). */}
      <div className="flex w-full items-center gap-2 rounded-full border border-zinc-200 bg-white p-2 transition-shadow focus-within:border-[#3A5A40] focus-within:ring-2 focus-within:ring-[#3A5A40]/40">
        <span
          aria-hidden="true"
          className="flex h-5 w-5 shrink-0 items-center justify-center pl-2 text-[#3b3b3b] sm:pl-3"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle
              cx="9"
              cy="9"
              r="6.25"
              stroke="currentColor"
              strokeWidth="1.8"
            />
            <line
              x1="13.5"
              y1="13.5"
              x2="17.5"
              y2="17.5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={handleChange}
          aria-label="Search for your cafe"
          placeholder="Search for your cafe..."
          className="min-w-0 flex-1 bg-transparent text-sm text-[#101514] outline-none placeholder:text-zinc-400 focus:ring-0"
        />
        <button
          type="button"
          disabled={!selectedCafeId || isNavigating}
          onClick={handleVerifyClaim}
          aria-busy={isNavigating}
          className="flex shrink-0 items-center gap-2 rounded-full bg-[#3A5A40] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#2f4833] disabled:cursor-not-allowed disabled:opacity-40 sm:px-5"
        >
          {isNavigating ? (
            <>
              <Spinner className="size-3.5" />
              <span>Opening…</span>
            </>
          ) : (
            <>
              <span className="hidden sm:inline">Verify &amp; Claim</span>
              <span className="sm:hidden">Claim</span>
            </>
          )}
        </button>
      </div>

      {/* Dropdown chrome matches the webapp's SearchDropdown: rounded-2xl,
          hairline ring, the standard card shadow. */}
      {showDropdown && (
        <div className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-2xl bg-white shadow-[0_12px_28px_rgba(0,0,0,0.08)] ring-1 ring-zinc-200/70">
          <ul className="max-h-80 overflow-auto py-2 text-left text-sm text-[#3b3b3b]">
            {loading ? (
              <li className="px-4 py-3 text-sm text-zinc-500">Searching…</li>
            ) : error ? (
              <li className="px-4 py-3 text-sm text-[#b94a48]">
                Couldn&apos;t load results — check your connection and try
                again.
              </li>
            ) : cafes.length === 0 ? (
              <li className="px-4 py-3 text-sm text-zinc-500">
                No cafes found. Try a different name.
              </li>
            ) : (
              cafes.map((cafe, index) => {
                const cafeId = String(cafe.id ?? "");
                const addressLine = [cafe.address, cafe.city].filter(Boolean).join(", ");
                const isLast = index === cafes.length - 1;

                return (
                  <li
                    key={cafeId}
                    className={`px-2 ${isLast ? "" : "border-b border-zinc-100"}`}
                  >
                    <button
                      type="button"
                      onClick={() => handleSelect(cafeId)}
                      disabled={isNavigating}
                      aria-busy={navigatingId === cafeId}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-[#e3ebe4]/50 disabled:cursor-default"
                    >
                      <span className="flex min-w-0 flex-1 flex-col items-start gap-0.5">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-[#101514]">
                            {cafe.name?.trim() || "Unnamed cafe"}
                          </span>
                          {cafe.has_pending_claim && (
                            <span className="inline-flex items-center rounded-full bg-[#e3ebe4] px-2 py-0.5 text-[11px] font-medium text-[#3A5A40]">
                              Claim pending
                            </span>
                          )}
                        </span>
                        <span className="text-xs text-[#6b6b6b]">
                          {addressLine || "Address unavailable"}
                        </span>
                      </span>
                      {/* Spinner sits on the row the user actually tapped, so
                          the feedback is unambiguous when several are listed. */}
                      {navigatingId === cafeId ? (
                        <span className="flex shrink-0 items-center gap-1.5 text-xs font-medium text-[#3A5A40]">
                          <Spinner className="size-3.5" />
                          Opening…
                        </span>
                      ) : null}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
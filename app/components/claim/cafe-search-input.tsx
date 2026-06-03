"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { useCafeSearch } from "@/hooks/use-cafe-search";

type CafeResult = {
  id?: string | number | null;
  name?: string | null;
  address?: string | null;
  city?: string | null;
  has_pending_claim?: boolean | null;
};

const normalizeCafeResult = (result: unknown): CafeResult | null => {
  if (!result || typeof result !== "object") {
    return null;
  }

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

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value;
    const trimmedValue = nextValue.trim();

    setSearchQuery(nextValue);
    setSelectedCafeId(null);

    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }

    if (!trimmedValue) {
      setHasSearched(false);
      return;
    }

    debounceRef.current = window.setTimeout(() => {
      setHasSearched(true);
      search(trimmedValue);
    }, 300);
  };

  const handleVerifyClaim = () => {
    if (!selectedCafeId) {
      return;
    }

    router.push(`/claim/${selectedCafeId}`);
  };

  const normalizedResults = Array.isArray(results) ? results : [];
  const cafes = normalizedResults
    .map(normalizeCafeResult)
    .filter((cafe): cafe is CafeResult => Boolean(cafe && cafe.id));

  const hasQuery = searchQuery.trim().length > 0;
  const showDropdown =
    hasQuery && (loading || hasSearched || cafes.length > 0 || error);

  return (
    <div className="relative w-full">
      <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="text"
          value={searchQuery}
          onChange={handleChange}
          placeholder="Search for your cafe..."
          className="w-full rounded-2xl border border-[#3A5A40]/15 bg-white px-5 py-4 text-base text-gray-900 shadow-[0_12px_35px_rgba(15,23,42,0.08)] outline-none transition placeholder:text-gray-400 focus:border-[#3A5A40]/40 focus:ring-4 focus:ring-[#3A5A40]/12"
        />
        <button
          type="button"
          disabled={!selectedCafeId}
          onClick={handleVerifyClaim}
          className="w-full shrink-0 rounded-2xl bg-[#3A5A40] px-6 py-4 text-base font-semibold text-white shadow-[0_14px_30px_rgba(58,90,64,0.32)] transition hover:-translate-y-0.5 hover:bg-[#2f4a35] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          Verify &amp; Claim
        </button>
      </div>

      {showDropdown ? (
        <div className="absolute left-0 right-0 top-full z-30 mt-3 overflow-hidden rounded-2xl border border-[#3A5A40]/15 bg-white shadow-[0_24px_50px_rgba(15,23,42,0.12)]">
          <ul className="max-h-80 overflow-auto py-2 text-left text-sm text-gray-700">
            {loading ? (
              <li className="px-4 py-3 text-sm text-gray-500">
                Searching...
              </li>
            ) : error ? (
              <li className="px-4 py-3 text-sm text-red-600">
                Search failed. Please try again.
              </li>
            ) : cafes.length === 0 ? (
              <li className="px-4 py-3 text-sm text-gray-500">
                No cafes found. Try a different name.
              </li>
            ) : (
              cafes.map((cafe, index) => {
                const cafeId = String(cafe.id ?? "");
                const addressLine = [cafe.address, cafe.city]
                  .filter(Boolean)
                  .join(", ");
                const isLast = index === cafes.length - 1;

                return (
                  <li
                    key={cafeId}
                    className={`px-4 ${isLast ? "" : "border-b border-[#3A5A40]/10"}`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCafeId(cafeId);
                        router.push(`/claim/${cafeId}`);
                      }}
                      className="flex w-full flex-col items-start gap-1 rounded-xl px-3 py-3 text-left transition-colors hover:bg-[#F7FAF7]"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">
                          {cafe.name?.trim() || "Unnamed cafe"}
                        </span>
                        {cafe.has_pending_claim ? (
                          <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                            Claim pending
                          </span>
                        ) : null}
                      </div>
                      <span className="text-xs text-gray-500">
                        {addressLine || "Address unavailable"}
                      </span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

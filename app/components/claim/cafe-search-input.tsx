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
          className="w-full rounded-md border border-gray-200 bg-white px-5 py-4 text-base text-gray-900 shadow-sm outline-none transition focus:border-gray-300 focus:ring-2 focus:ring-[#3A5A40]/20"
        />
        <button
          type="button"
          disabled={!selectedCafeId}
          onClick={handleVerifyClaim}
          className="w-full shrink-0 rounded-md bg-[#3A5A40] px-6 py-4 text-base font-semibold text-white shadow-sm transition hover:bg-[#2b442f] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          Verify &amp; Claim
        </button>
      </div>

      {showDropdown ? (
        <div className="absolute left-0 right-0 top-full z-30 mt-2 rounded-md border border-gray-200 bg-white shadow-lg">
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
                    className={`px-4 ${isLast ? "" : "border-b border-gray-100"}`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCafeId(cafeId);
                        router.push(`/claim/${cafeId}`);
                      }}
                      className="flex w-full flex-col items-start gap-1 rounded-md px-2 py-2 text-left transition-colors hover:bg-gray-50"
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

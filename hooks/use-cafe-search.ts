"use client";

import { useCallback, useRef, useState } from "react";
import type { PostgrestError } from "@supabase/supabase-js";
import { useSupabase } from "@/lib/supabase/context";
import type { Database } from "@/types/database.types";

type CafeSearchResults =
  Database["public"]["Functions"]["search_unclaimed_cafes"]["Returns"];

type UseCafeSearchResult = {
  results: CafeSearchResults | null;
  loading: boolean;
  error: PostgrestError | null;
  search: (query: string) => Promise<void>;
  reset: () => void;
};

export function useCafeSearch(
  pageLimit: number = 20,
  pageOffset: number = 0
): UseCafeSearchResult {
  const supabase = useSupabase();
  const [results, setResults] = useState<CafeSearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<PostgrestError | null>(null);
  // Bumped on every search and reset. A response is applied only if it
  // belongs to the latest request, so a slow earlier query can't overwrite
  // newer results, and clearing the input discards whatever is in flight.
  const requestIdRef = useRef(0);

  const search = useCallback(
    async (query: string) => {
      const requestId = ++requestIdRef.current;
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.rpc("search_unclaimed_cafes", {
        search_query: query,
        page_limit: pageLimit,
        page_offset: pageOffset,
      });

      if (requestId !== requestIdRef.current) return;

      if (error) {
        setError(error);
        setResults(null);
        setLoading(false);
        return;
      }

      setResults(data);
      setLoading(false);
    },
    [supabase, pageLimit, pageOffset]
  );

  const reset = useCallback(() => {
    requestIdRef.current += 1;
    setResults(null);
    setError(null);
    setLoading(false);
  }, []);

  return { results, loading, error, search, reset };
}

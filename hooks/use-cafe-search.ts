"use client";

import { useCallback, useState } from "react";
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
};

export function useCafeSearch(
  pageLimit: number = 20,
  pageOffset: number = 0
): UseCafeSearchResult {
  const supabase = useSupabase();
  const [results, setResults] = useState<CafeSearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<PostgrestError | null>(null);

  const search = useCallback(
    async (query: string) => {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.rpc("search_unclaimed_cafes", {
        search_query: query,
        page_limit: pageLimit,
        page_offset: pageOffset,
      });

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

  return { results, loading, error, search };
}

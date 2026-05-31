"use client";

import React, { createContext, useContext, useRef } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database.types";

type SupabaseContextValue = SupabaseClient<Database>;

const SupabaseContext = createContext<SupabaseContextValue | null>(null);

type SupabaseProviderProps = {
  children: React.ReactNode;
};

export function SupabaseProvider({ children }: SupabaseProviderProps) {
  const clientRef = useRef<SupabaseContextValue | null>(null);

  if (!clientRef.current) {
    clientRef.current = createClient() as SupabaseContextValue;
  }

  return (
    <SupabaseContext.Provider value={clientRef.current}>
      {children}
    </SupabaseContext.Provider>
  );
}

export function useSupabase() {
  const supabase = useContext(SupabaseContext);

  if (!supabase) {
    throw new Error("useSupabase must be used within SupabaseProvider");
  }

  return supabase;
}

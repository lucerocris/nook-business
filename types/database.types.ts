export type Database = {
  public: {
    Tables: Record<string, never>;
    Views: Record<string, never>;
    Functions: {
      search_unclaimed_cafes: {
        Args: {
          search_query: string;
          page_limit: number;
          page_offset: number;
        };
        Returns: unknown[];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

"use client";

import { useMemo, useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";

export function useSearchFilter<T>(
  items: T[],
  getSearchValues: (item: T) => Array<string | null | undefined>,
  debounceDelay = 300
) {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, debounceDelay);

  const normalizedQuery = debouncedSearchQuery.trim().toLowerCase();

  const filteredItems = useMemo(() => {
    if (!normalizedQuery) return items;

    return items.filter((item) =>
      getSearchValues(item).some((value) =>
        value?.toLowerCase().includes(normalizedQuery)
      )
    );
  }, [getSearchValues, items, normalizedQuery]);

  return {
    debouncedSearchQuery,
    searchQuery,
    setSearchQuery,
    filteredItems,
  };
}

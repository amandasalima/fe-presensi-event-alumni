"use client";

import { useCallback } from "react";
import { useSearchFilter } from "@/hooks/useSearchFilter";
import type { PresenceHistoryItem } from "./queries/presences";

export function usePresenceHistoryFilters(presences: PresenceHistoryItem[]) {
  const getSearchValues = useCallback(
    (presence: PresenceHistoryItem) => [
      presence.event?.event_title,
      presence.event?.location,
    ],
    []
  );

  const { filteredItems, searchQuery, setSearchQuery } = useSearchFilter(
    presences,
    getSearchValues
  );

  return {
    filteredPresences: filteredItems,
    searchQuery,
    setSearchQuery,
  };
}

"use client";

import { useCallback } from "react";
import { useSearchFilter } from "@/hooks/useSearchFilter";

export interface PresenceHistoryItem {
  id: number;
  event_id: number;
  scanned_at: string;
  event?: {
    id?: number;
    event_title: string;
    location?: string;
    event_date?: string;
    event_datetime?: string;
    start_time?: string;
    end_time?: string;
    status_event?: string;
  };
}

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

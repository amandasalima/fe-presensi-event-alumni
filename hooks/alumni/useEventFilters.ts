"use client";

import { useMemo, useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";

export interface AlumniEvent {
  id: number;
  event_title: string;
  event_description?: string;
  description?: string;
  event_date: string;
  start_time: string;
  end_time: string;
  location: string;
  quota: number;
  remaining_quota: number;
  is_registered: boolean;
  poster_url?: string;
  category?: {
    id: number;
    category_name: string;
  };
}

const ALL_CATEGORIES = "Semua";

export function useEventFilters(events: AlumniEvent[]) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(ALL_CATEGORIES);
  const debouncedSearchQuery = useDebounce(searchQuery);

  const categories = useMemo<string[]>(
    () => [
      ALL_CATEGORIES,
      ...Array.from(
        new Set(
          events
            .map((event) => event.category?.category_name)
            .filter((name): name is string => Boolean(name))
        )
      ),
    ],
    [events]
  );

  const filteredEvents = useMemo(() => {
    const normalizedQuery = debouncedSearchQuery.trim().toLowerCase();

    return events.filter((event) => {
      const matchesSearch =
        !normalizedQuery ||
        event.event_title.toLowerCase().includes(normalizedQuery) ||
        event.location.toLowerCase().includes(normalizedQuery);

      const matchesCategory =
        selectedCategory === ALL_CATEGORIES ||
        event.category?.category_name === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [debouncedSearchQuery, events, selectedCategory]);

  return {
    categories,
    debouncedSearchQuery,
    filteredEvents,
    searchQuery,
    selectedCategory,
    setSearchQuery,
    setSelectedCategory,
  };
}

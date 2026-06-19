"use client";

import { useMemo, useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";

export interface AlumniEvent {
  id: number;
  event_title?: string;
  title?: string;
  nama_event?: string;

  event_description?: string;
  description?: string;

  event_date?: string;
  start_time?: string;
  end_time?: string;

  location?: string;
  lokasi?: string;

  quota?: number;
  remaining_quota?: number;
  is_registered?: boolean;
  poster_url?: string;

  category?: {
    id: number;
    category_name?: string;
    name?: string;
  };

  category_name?: string;
}

const ALL_CATEGORIES = "Semua";

function normalizeEvents(value: unknown): AlumniEvent[] {
  if (Array.isArray(value)) {
    return value as AlumniEvent[];
  }

  if (value && typeof value === "object") {
    const response = value as {
      data?: unknown;
      events?: unknown;
      items?: unknown;
    };

    if (Array.isArray(response.data)) {
      return response.data as AlumniEvent[];
    }

    if (Array.isArray(response.events)) {
      return response.events as AlumniEvent[];
    }

    if (Array.isArray(response.items)) {
      return response.items as AlumniEvent[];
    }
  }

  return [];
}

function getEventTitle(event: AlumniEvent) {
  return event.event_title ?? event.title ?? event.nama_event ?? "";
}

function getEventLocation(event: AlumniEvent) {
  return event.location ?? event.lokasi ?? "";
}

function getCategoryName(event: AlumniEvent) {
  return (
    event.category?.category_name ??
    event.category?.name ??
    event.category_name ??
    ""
  );
}

export function useEventFilters(eventsInput: unknown) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(ALL_CATEGORIES);
  const debouncedSearchQuery = useDebounce(searchQuery);

  const events = useMemo(() => normalizeEvents(eventsInput), [eventsInput]);

  const categories = useMemo<string[]>(
    () => [
      ALL_CATEGORIES,
      ...Array.from(
        new Set(
          events
            .map((event) => getCategoryName(event))
            .filter((name): name is string => Boolean(name))
        )
      ),
    ],
    [events]
  );

  const filteredEvents = useMemo(() => {
    const normalizedQuery = debouncedSearchQuery.trim().toLowerCase();

    return events.filter((event) => {
      const title = getEventTitle(event).toLowerCase();
      const location = getEventLocation(event).toLowerCase();
      const categoryName = getCategoryName(event);

      const matchesSearch =
        !normalizedQuery ||
        title.includes(normalizedQuery) ||
        location.includes(normalizedQuery);

      const matchesCategory =
        selectedCategory === ALL_CATEGORIES ||
        categoryName === selectedCategory;

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
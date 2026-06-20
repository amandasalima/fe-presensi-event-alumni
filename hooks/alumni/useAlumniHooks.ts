"use client";

import { useQuery } from "@tanstack/react-query";

export interface AlumniEvent {
  id: number;
  event_title: string;
  event_datetime: string;
  event_date?: string;
  start_time?: string;
  end_time?: string;
  location: string;
  status_event?: string;
  category?: {
    id: number;
    category_name?: string;
    name?: string;
  };
}

export interface AlumniPresence {
  id: number;
  event_id: number;
  user_id?: number;
  scanned_at: string;
  event?: AlumniEvent;
}

export interface AlumniProfile {
  id: number;
  first_name: string;
  last_name?: string | null;
  email: string;
  role: "admin" | "alumni";
  phone?: string | null;
  graduation_year?: string | null;
}

export interface AlumniNotification {
  id: number;
  title: string;
  message?: string | null;
  body?: string | null;
  is_read?: boolean;
  created_at?: string;
}

type ApiResponse<T> = {
  success?: boolean;
  message?: string;
  data?: T;
};

function getToken() {
  if (typeof window === "undefined") return null;

  return (
    localStorage.getItem("token") ??
    localStorage.getItem("auth_token") ??
    localStorage.getItem("access_token")
  );
}

async function apiGet<T>(path: string): Promise<T> {
  const token = getToken();

  const response = await fetch(`/api${path}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    throw new Error(`Gagal mengambil data: ${path}`);
  }

  return response.json();
}

function extractArray<T>(response: unknown): T[] {
  if (Array.isArray(response)) {
    return response as T[];
  }

  if (response && typeof response === "object") {
    const objectResponse = response as {
      data?: unknown;
      events?: unknown;
      items?: unknown;
      notifications?: unknown;
      presences?: unknown;
    };

    if (Array.isArray(objectResponse.data)) return objectResponse.data as T[];
    if (Array.isArray(objectResponse.events)) return objectResponse.events as T[];
    if (Array.isArray(objectResponse.items)) return objectResponse.items as T[];
    if (Array.isArray(objectResponse.notifications)) {
      return objectResponse.notifications as T[];
    }
    if (Array.isArray(objectResponse.presences)) {
      return objectResponse.presences as T[];
    }
  }

  return [];
}

function extractData<T>(response: unknown): T | null {
  if (response && typeof response === "object") {
    const objectResponse = response as ApiResponse<T>;

    if (objectResponse.data) {
      return objectResponse.data;
    }
  }

  return response as T;
}

function buildEventDateTime(event: Partial<AlumniEvent>) {
  if (event.event_datetime) {
    return event.event_datetime;
  }

  if (event.event_date && event.start_time) {
    return `${event.event_date}T${event.start_time}`;
  }

  if (event.event_date) {
    return `${event.event_date}T00:00:00`;
  }

  return new Date().toISOString();
}

function normalizeEvent(event: AlumniEvent): AlumniEvent {
  return {
    ...event,
    event_datetime: buildEventDateTime(event),
  };
}

function normalizePresence(presence: AlumniPresence): AlumniPresence {
  return {
    ...presence,
    event: presence.event ? normalizeEvent(presence.event) : undefined,
  };
}

export function useMyProfile() {
  return useQuery({
    queryKey: ["alumni-profile"],
    queryFn: async () => {
      const response = await apiGet<unknown>("/auth/me");
      return extractData<AlumniProfile>(response);
    },
  });
}

export function useAlumniEvents() {
  return useQuery({
    queryKey: ["alumni-events"],
    queryFn: async () => {
      const response = await apiGet<unknown>("/events");
      return extractArray<AlumniEvent>(response).map(normalizeEvent);
    },
  });
}

export function useMyPresences() {
  return useQuery({
    queryKey: ["alumni-presences"],
    queryFn: async () => {
      const response = await apiGet<unknown>("/presensi/history");
      return extractArray<AlumniPresence>(response).map(normalizePresence);
    },
  });
}

export function useMyRecommendations() {
  return useQuery({
    queryKey: ["alumni-recommendations"],
    queryFn: async () => {
      const response = await apiGet<unknown>("/alumni/recommendations");
      return extractArray<AlumniEvent>(response).map(normalizeEvent);
    },
  });
}

export function useMyNotifications() {
  return useQuery({
    queryKey: ["alumni-notifications"],
    queryFn: async () => {
      const response = await apiGet<unknown>("/alumni/notifications");
      return extractArray<AlumniNotification>(response);
    },
  });
}
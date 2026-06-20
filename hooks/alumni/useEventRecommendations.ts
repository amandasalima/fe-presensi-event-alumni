"use client";

import { useQuery } from "@tanstack/react-query";
import { API_BASE_URL } from "@/lib/api";

export interface RecommendedEvent {
	id: number;
	event_title: string;
	event_datetime?: string;
	event_date?: string;
	start_time?: string;
	end_time?: string;
	location?: string;
	status_event: "Mendatang" | "Selesai" | "active" | "inactive";
	category?: {
		id: number;
		category_name?: string;
		name?: string;
	};
}

interface RecommendationResponse {
	success?: boolean;
	message?: string;
	data?: RecommendedEvent[];
}

function getToken() {
	if (typeof window === "undefined") return null;

	return (
		localStorage.getItem("token") ??
		localStorage.getItem("auth_token") ??
		localStorage.getItem("access_token")
	);
}

async function fetchEventRecommendations(): Promise<RecommendedEvent[]> {
	const token = getToken();

	if (!token) {
		throw new Error("Token tidak ditemukan");
	}

	const response = await fetch(`${API_BASE_URL}/alumni/recommendations`, {
		method: "GET",
		headers: {
			Accept: "application/json",
			Authorization: `Bearer ${token}`,
		},
	});

	if (!response.ok) {
		throw new Error("Gagal mengambil rekomendasi event");
	}

	const result: RecommendationResponse = await response.json();

	return result.data ?? [];
}

export function useEventRecommendations() {
	return useQuery({
		queryKey: ["event-recommendations"],
		queryFn: fetchEventRecommendations,
	});
}

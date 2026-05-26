import axios from "axios";

const API_BASE_URL =
	process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

function getAuthToken() {
	if (typeof window === "undefined") return null;

	return (
		localStorage.getItem("access_token") ||
		localStorage.getItem("admin_token") ||
		localStorage.getItem("alumni_token") ||
		localStorage.getItem("token")
	);
}

function clearAuthStorage() {
	localStorage.removeItem("access_token");
	localStorage.removeItem("admin_token");
	localStorage.removeItem("alumni_token");
	localStorage.removeItem("token");
	localStorage.removeItem("token_type");
	localStorage.removeItem("user");
	localStorage.removeItem("role");
}

const api = axios.create({
	baseURL: API_BASE_URL,
	headers: {
		"Content-Type": "application/json",
		Accept: "application/json",
	},

	// jangan pakai withCredentials kalau pakai Bearer token
	withCredentials: false,
});

// Request interceptor: attach token dari localStorage
api.interceptors.request.use((config) => {
	const token = getAuthToken();

	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}

	return config;
});

// Response interceptor: handle 401
api.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response?.status === 401 && typeof window !== "undefined") {
			clearAuthStorage();

			const currentPath = window.location.pathname;

			if (currentPath.startsWith("/admin")) {
				window.location.href = "/admin/login";
			} else {
				window.location.href = "/login";
			}
		}

		return Promise.reject(error);
	},
);

export default api;

// Helper function untuk fetch-style API calls
export async function fetchAPI(endpoint: string, options?: RequestInit) {
	const token = getAuthToken();

	const response = await fetch(`${API_BASE_URL}${endpoint}`, {
		...options,
		headers: {
			"Content-Type": "application/json",
			Accept: "application/json",
			...(token ? { Authorization: `Bearer ${token}` } : {}),
			...options?.headers,
		},
	});

	const data = await response.json().catch(() => null);

	if (!response.ok) {
		throw new Error(data?.message || "Request failed");
	}

	return data;
}

import axios from "axios";

const API_BASE_URL =
	process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

function getAuthToken() {
	if (typeof window === "undefined") return null;

	const pathname = window.location.pathname;
	if (pathname.startsWith("/admin")) {
		return localStorage.getItem("access_token") || localStorage.getItem("token");
	} else if (pathname.startsWith("/alumni")) {
		return localStorage.getItem("alumni_token") || sessionStorage.getItem("alumni_token");
	}

	return (
		localStorage.getItem("alumni_token") ||
		sessionStorage.getItem("alumni_token") ||
		localStorage.getItem("access_token") ||
		localStorage.getItem("token")
	);
}

export function clearAuthStorage() {
	if (typeof window === "undefined") return;
	localStorage.removeItem("access_token");
	localStorage.removeItem("admin_token");
	localStorage.removeItem("alumni_token");
	localStorage.removeItem("token");
	localStorage.removeItem("token_type");
	localStorage.removeItem("user");
	localStorage.removeItem("role");
	localStorage.removeItem("dummy_profile");
	sessionStorage.removeItem("alumni_token");
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
			const currentPath = window.location.pathname;

			// Don't redirect if already on login/register pages
			// Let the form handle showing credential error messages
			const isAuthPage =
				currentPath.includes("/login") ||
				currentPath.includes("/register");

			if (!isAuthPage) {
				clearAuthStorage();

				if (currentPath.startsWith("/admin")) {
					window.location.href = "/admin/login";
				} else {
					window.location.href = "/alumni/login";
				}
			}
		}

		return Promise.reject(error);
	},
);

export default api;

export class ApiError extends Error {
	status: number;
	data: unknown;

	constructor(message: string, status: number, data: unknown) {
		super(message);
		this.name = "ApiError";
		this.status = status;
		this.data = data;
	}
}

function formatValidationErrors(errors: unknown) {
	if (!errors || typeof errors !== "object") return "";

	return Object.values(errors)
		.flatMap((value) => (Array.isArray(value) ? value : [value]))
		.filter((value): value is string => typeof value === "string")
		.join(" ");
}

export function getApiErrorMessage(error: unknown, fallback = "Request failed") {
	if (!(error instanceof Error)) return fallback;

	if (error instanceof ApiError) {
		const data = error.data as {
			message?: unknown;
			error?: unknown;
			errors?: unknown;
		} | null;
		const message =
			typeof data?.message === "string"
				? data.message
				: typeof data?.error === "string"
					? data.error
					: "";
		const validation = formatValidationErrors(data?.errors);

		return [message, validation].filter(Boolean).join(" ") || error.message;
	}

	return error.message || fallback;
}

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
		throw new ApiError(
			getApiErrorMessage(new ApiError("Request failed", response.status, data)),
			response.status,
			data,
		);
	}

	return data;
}

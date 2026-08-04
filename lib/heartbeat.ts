import api, { clearAuthStorage } from "./api";

const HEARTBEAT_INTERVAL_MS = 5 * 60 * 1000; // 5 menit
const TOKEN_EXPIRY_THRESHOLD_MINUTES = 5; // Auto-logout jika sisa < 5 menit

let heartbeatTimer: ReturnType<typeof setInterval> | null = null;
let isHeartbeatActive = false;

/**
 * Menentukan halaman login yang sesuai berdasarkan path saat ini.
 */
function getLoginRedirect(): string {
	if (typeof window === "undefined") return "/alumni/login";

	const path = window.location.pathname;
	if (path.startsWith("/admin")) return "/admin/login";
	return "/alumni/login";
}

/**
 * Auto-logout: bersihkan storage, hentikan heartbeat, redirect ke login.
 */
export function handleAutoLogout() {
	stopHeartbeat();
	clearAuthStorage();

	if (typeof window !== "undefined") {
		const loginPath = getLoginRedirect();
		const currentPath = window.location.pathname;

		// Jangan redirect jika sudah di halaman auth
		if (!currentPath.includes("/login") && !currentPath.includes("/register")) {
			window.location.href = loginPath;
		}
	}
}

/**
 * Kirim heartbeat ke backend untuk menjaga token tetap hidup.
 */
async function sendHeartbeat(): Promise<void> {
	try {
		const res = await api.post("/auth/heartbeat");
		const remaining = res.data?.data?.token_expires_in;

		// Jika token hampir habis (< 5 menit), lakukan auto logout
		if (typeof remaining === "number" && remaining <= TOKEN_EXPIRY_THRESHOLD_MINUTES) {
			console.warn(`[Heartbeat] Token hampir expired (sisa ${remaining} menit), auto-logout...`);
			handleAutoLogout();
		}
	} catch (error: unknown) {
		const axiosError = error as { response?: { status?: number } };
		// Token expired / invalid → auto logout
		if (axiosError?.response?.status === 401) {
			console.warn("[Heartbeat] Token invalid/expired (401), auto-logout...");
			handleAutoLogout();
		}
		// Error lain (network, dll) — biarkan, coba lagi di interval berikutnya
	}
}

/**
 * Handle visibility change: kirim heartbeat saat tab kembali aktif.
 */
function handleVisibilityChange() {
	if (document.visibilityState === "visible" && isHeartbeatActive) {
		// Tab kembali aktif — segera cek apakah token masih valid
		sendHeartbeat();
	}
}

/**
 * Mulai heartbeat interval. Dipanggil setelah login berhasil.
 */
export function startHeartbeat() {
	if (typeof window === "undefined") return;
	if (isHeartbeatActive) return; // Sudah berjalan, jangan duplikat

	isHeartbeatActive = true;

	// Kirim heartbeat pertama setelah delay singkat
	setTimeout(() => sendHeartbeat(), 3000);

	// Set interval setiap 5 menit
	heartbeatTimer = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL_MS);

	// Listen visibility change — kirim heartbeat saat tab kembali aktif
	document.addEventListener("visibilitychange", handleVisibilityChange);
}

/**
 * Hentikan heartbeat interval. Dipanggil saat logout.
 */
export function stopHeartbeat() {
	isHeartbeatActive = false;

	if (heartbeatTimer) {
		clearInterval(heartbeatTimer);
		heartbeatTimer = null;
	}

	if (typeof document !== "undefined") {
		document.removeEventListener("visibilitychange", handleVisibilityChange);
	}
}

/**
 * Cek apakah heartbeat sedang aktif.
 */
export function isHeartbeatRunning(): boolean {
	return isHeartbeatActive;
}

"use client";

import { AlertTriangle, X } from "lucide-react";

type ConfirmDialogProps = {
	isOpen: boolean;
	title: string;
	message: string;
	confirmLabel?: string;
	cancelLabel?: string;
	loading?: boolean;
	tone?: "danger" | "default";
	onCancel: () => void;
	onConfirm: () => void;
};

export default function ConfirmDialog({
	isOpen,
	title,
	message,
	confirmLabel = "Konfirmasi",
	cancelLabel = "Batal",
	loading = false,
	tone = "danger",
	onCancel,
	onConfirm,
}: ConfirmDialogProps) {
	if (!isOpen) return null;

	const isDanger = tone === "danger";

	return (
		<div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
			<div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl animate-in zoom-in-95 fade-in duration-200">
				<div className="mb-4 flex items-start justify-between gap-4">
					<div
						className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
							isDanger ? "bg-red-50 text-red-500" : "bg-[#7AB2B2]/15 text-[#2D7EA0]"
						}`}
					>
						<AlertTriangle size={20} />
					</div>
					<button
						type="button"
						onClick={onCancel}
						disabled={loading}
						className="rounded-xl p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 disabled:opacity-60"
						aria-label="Tutup konfirmasi"
					>
						<X size={18} />
					</button>
				</div>

				<h3 className="text-base font-bold text-gray-800">{title}</h3>
				<p className="mt-2 text-sm leading-6 text-gray-500">{message}</p>

				<div className="mt-5 flex gap-3">
					<button
						type="button"
						onClick={onCancel}
						disabled={loading}
						className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-60"
					>
						{cancelLabel}
					</button>
					<button
						type="button"
						onClick={onConfirm}
						disabled={loading}
						className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition disabled:opacity-70 ${
							isDanger ? "bg-red-500 hover:bg-red-600" : "bg-[#2D7EA0] hover:bg-[#236175]"
						}`}
					>
						{loading ? "Memproses..." : confirmLabel}
					</button>
				</div>
			</div>
		</div>
	);
}

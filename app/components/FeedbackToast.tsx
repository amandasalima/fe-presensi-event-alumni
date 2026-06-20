"use client";

import { AlertCircle, CheckCircle } from "lucide-react";

type FeedbackToastProps = {
	type: "success" | "error";
	message: string;
	variant?: "admin" | "mobile";
};

export default function FeedbackToast({
	type,
	message,
	variant = "admin",
}: FeedbackToastProps) {
	const isSuccess = type === "success";
	const positionClass =
		variant === "mobile"
			? "bottom-24 left-1/2 w-[calc(100%-1.5rem)] max-w-sm -translate-x-1/2"
			: "bottom-6 right-6 max-w-md";

	return (
		<div
			role="status"
			aria-live="polite"
			className={`fixed ${positionClass} z-[100] flex items-center gap-2.5 rounded-2xl px-4 py-3.5 text-sm font-medium text-white shadow-xl transition-all animate-in slide-in-from-bottom-4 fade-in duration-200 ${
				isSuccess ? "bg-[#41A07E]" : "bg-red-500"
			}`}
		>
			{isSuccess ? (
				<CheckCircle size={16} className="shrink-0" />
			) : (
				<AlertCircle size={16} className="shrink-0" />
			)}
			<span className="min-w-0">{message}</span>
		</div>
	);
}

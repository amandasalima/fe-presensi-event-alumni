"use client";

import { FormInput } from "./FormControl";

export default function AdminHeader({ title }: { title: string }) {
	return (
		<header className="h-24 bg-white border-b flex items-center justify-between px-10 sticky top-0 z-40 shadow-sm">
			<h2 className="text-4xl font-bold text-gray-800">{title}</h2>

			<div className="flex items-center gap-6">
				{/* Notification */}
				<button className="relative w-11 h-11 rounded-2xl bg-white border border-gray-100 shadow-sm hover:border-teal-200 hover:shadow-md hover:bg-teal-50 transition-all flex items-center justify-center text-xl">
					<span>🔔</span>
					<span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
				</button>

				{/* Profile */}
				<div className="flex items-center gap-4">
					<div className="text-right">
						<h4 className="font-semibold text-gray-700">Administrator</h4>

						<p className="text-sm text-gray-400">Admin</p>
					</div>

					<div className="w-14 h-14 rounded-full bg-linear-to-r from-teal-500 to-cyan-500 text-white flex items-center justify-center font-bold text-xl">
						A
					</div>
				</div>
			</div>
		</header>
	);
}

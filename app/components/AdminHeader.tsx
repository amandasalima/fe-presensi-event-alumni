"use client";

import { FormInput } from "./FormControl";

export default function AdminHeader({ title }: { title: string }) {
	return (
		<header className="h-14 bg-white flex items-center justify-between px-6 sticky top-0 z-40 shadow-sm">
			<h2 className="text-xl font-bold text-gray-800">{title}</h2>

			<div className="flex items-center gap-4">
				{/* Profile */}
				<div className="flex items-center gap-3">
					<div className="text-right">
						<h4 className="font-semibold text-gray-700 text-sm">Administrator</h4>
						<p className="text-xs text-gray-400">Admin</p>
					</div>

					<div className="w-9 h-9 rounded-full bg-[#2D7EA0] text-white flex items-center justify-center font-bold text-sm">
						A
					</div>
				</div>
			</div>
		</header>
	);
}
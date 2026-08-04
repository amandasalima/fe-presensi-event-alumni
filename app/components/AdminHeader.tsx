"use client";

import { useAdminProfile } from "@/hooks/admin/useSetting";
import { getImageUrl } from "@/lib/api";

export default function AdminHeader({ title }: { title: string }) {
	const { data: profile } = useAdminProfile();

	const name = profile?.name ?? "Administrator";
	const initials = name[0]?.toUpperCase() ?? "A";
	const avatarUrl = profile?.avatar_url;

	return (
		<header className="h-14 bg-white flex items-center justify-between px-6 sticky top-0 z-40 shadow-sm">
			<h2 className="text-xl font-bold text-gray-800">{title}</h2>

			<div className="flex items-center gap-4">
				{/* Profile */}
				<div className="flex items-center gap-3">
					<div className="text-right">
						<h4 className="font-semibold text-gray-700 text-sm">{name}</h4>
						<p className="text-xs text-gray-400">Admin</p>
					</div>

					{avatarUrl ? (
						<img
							src={getImageUrl(avatarUrl)}
							alt={name}
							className="w-9 h-9 rounded-full object-cover ring-2 ring-[#2D7EA0]/30"
						/>
					) : (
						<div className="w-9 h-9 rounded-full bg-[#2D7EA0] text-white flex items-center justify-center font-bold text-sm">
							{initials}
						</div>
					)}
				</div>
			</div>
		</header>
	);
}

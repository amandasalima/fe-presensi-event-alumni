import type { User } from "@/hooks/admin/users";

export function formatDate(dateStr?: string) {
	if (!dateStr) return "-";

	const date = new Date(dateStr);
	if (Number.isNaN(date.getTime())) return "-";

	return date.toLocaleDateString("id-ID", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	});
}

export function formatLabel(value: string) {
	if (!value) return "-";
	return value.charAt(0).toUpperCase() + value.slice(1);
}

export function getStatusClass(status: string) {
	const normalized = status.toLowerCase();

	if (["active", "aktif", "verified"].includes(normalized)) {
		return "bg-green-100 text-green-700";
	}

	if (["inactive", "nonaktif", "blocked", "suspended"].includes(normalized)) {
		return "bg-red-100 text-red-600";
	}

	return "bg-gray-100 text-gray-600";
}

function escapeExcelValue(value: unknown) {
	return String(value ?? "")
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;");
}

export function exportUsersToExcel(users: User[]) {
	const rows = users.map(
		(user, index) => `
		<tr>
			<td>${index + 1}</td>
			<td>${escapeExcelValue(user.name)}</td>
			<td>${escapeExcelValue(user.email)}</td>
			<td>${escapeExcelValue(user.role)}</td>
			<td>${escapeExcelValue(user.status)}</td>
			<td>${escapeExcelValue(formatDate(user.created_at))}</td>
		</tr>
	`,
	);
	const html = `
		<html>
			<head>
				<meta charset="UTF-8" />
			</head>
			<body>
				<table border="1">
					<thead>
						<tr>
							<th>No</th>
							<th>Nama</th>
							<th>Email</th>
							<th>Role</th>
							<th>Status</th>
							<th>Tanggal Dibuat</th>
						</tr>
					</thead>
					<tbody>${rows.join("")}</tbody>
				</table>
			</body>
		</html>
	`;
	const blob = new Blob([html], { type: "application/vnd.ms-excel" });
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	const today = new Date().toISOString().slice(0, 10);

	link.href = url;
	link.download = `data-user-${today}.xls`;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
}

export function getUserStats(users: User[]) {
	const now = new Date();
	const activeUsers = users.filter((user) =>
		["active", "aktif"].includes(user.status.toLowerCase()),
	).length;
	const adminUsers = users.filter(
		(user) => user.role.toLowerCase() === "admin",
	).length;
	const monthUsers = users.filter((user) => {
		const createdAt = new Date(user.created_at);
		return (
			createdAt.getMonth() === now.getMonth() &&
			createdAt.getFullYear() === now.getFullYear()
		);
	}).length;

	return { activeUsers, adminUsers, monthUsers };
}

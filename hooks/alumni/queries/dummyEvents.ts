export function getDummyRegistered(id: number, defaultValue: boolean): boolean {
	if (typeof window === "undefined") return defaultValue;

	const stored = localStorage.getItem(`dummy_reg_${id}`);
	if (stored !== null) return stored === "true";

	return defaultValue;
}

export function getDummyEvents() {
	const todayDateStr = new Date().toISOString().split("T")[0];
	const futureDate1 = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
		.toISOString()
		.split("T")[0];
	const futureDate2 = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
		.toISOString()
		.split("T")[0];

	return [
		{
			id: 9991,
			event_title: "Reuni Akbar Pondok Pesantren 2026",
			event_description:
				"Temu kangen alumni lintas angkatan pondok pesantren. Mari bernostalgia dan menjalin silaturahmi erat.",
			event_date: futureDate1,
			start_time: "08:00:00",
			end_time: "15:00:00",
			event_datetime: `${futureDate1}T08:00:00`,
			location: "Aula Utama Pondok Pesantren",
			quota: 500,
			remaining_quota: 120,
			is_registered: getDummyRegistered(9991, false),
			status_event: "active" as const,
			category: {
				id: 1,
				category_name: "Reuni",
			},
		},
		{
			id: 9992,
			event_title: "Kajian Bulanan & Doa Bersama",
			event_description:
				"Kajian keislaman rutin bulanan khusus alumni bersama jajaran pimpinan pondok pesantren.",
			event_date: futureDate2,
			start_time: "19:30:00",
			end_time: "21:30:00",
			event_datetime: `${futureDate2}T19:30:00`,
			location: "Masjid Jami' Pesantren",
			quota: 200,
			remaining_quota: 45,
			is_registered: getDummyRegistered(9992, true),
			status_event: "active" as const,
			category: {
				id: 2,
				category_name: "Pengajian",
			},
		},
		{
			id: 9993,
			event_title: "Workshop Karir & Sharing Alumni",
			event_description:
				"Sharing session dan workshop bimbingan karir oleh para alumni sukses untuk siswa aktif dan alumni muda.",
			event_date: todayDateStr,
			start_time: "09:00:00",
			end_time: "12:00:00",
			event_datetime: `${todayDateStr}T09:00:00`,
			location: "Gedung Serbaguna Lt. 2",
			quota: 100,
			remaining_quota: 15,
			is_registered: getDummyRegistered(9993, false),
			status_event: "active" as const,
			category: {
				id: 3,
				category_name: "Seminar",
			},
		},
	];
}

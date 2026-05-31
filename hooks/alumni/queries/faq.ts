import { useQuery } from "@tanstack/react-query";
import { fetchAPI } from "@/lib/api";
import { alumniQueryKeys } from "./queryKeys";

const fallbackFaq = [
	{
		id: 1,
		question: "Bagaimana cara melakukan presensi?",
		answer:
			"Buka menu Scan QR pada aplikasi, lalu arahkan kamera ke QR Code yang disediakan panitia di lokasi acara.",
	},
	{
		id: 2,
		question: "Apakah saya bisa membatalkan pendaftaran event?",
		answer:
			"Ya, Anda dapat membatalkan pendaftaran melalui halaman detail event sebelum acara dimulai.",
	},
];

export function useFAQ() {
	return useQuery({
		queryKey: alumniQueryKeys.faq,
		queryFn: async () => {
			try {
				return await fetchAPI("/alumni/faq");
			} catch (error) {
				console.warn("Failed to fetch FAQ, using mock:", error);
				return fallbackFaq;
			}
		},
	});
}

export function useFAQByCategory(category: string) {
	return useQuery({
		queryKey: alumniQueryKeys.faqCategory(category),
		queryFn: async () => {
			try {
				return await fetchAPI(`/alumni/faq?category=${category}`);
			} catch (error) {
				console.warn(`Failed to fetch FAQ for category ${category}, using mock:`, error);

				return [fallbackFaq[0]];
			}
		},
		enabled: !!category,
	});
}

export const alumniQueryKeys = {
	profile: ["my-profile"] as const,
	events: ["alumni-events"] as const,
	eventDetail: (id: number) => ["alumni-events", id] as const,
	presences: ["my-presences"] as const,
	engagementSummary: ["alumni-engagement-summary"] as const,
	recommendations: ["my-recommendations"] as const,
	notifications: ["my-notifications"] as const,
	unreadCount: ["unread-count"] as const,
	faq: ["faq"] as const,
	faqCategory: (category: string) => ["faq", category] as const,
};

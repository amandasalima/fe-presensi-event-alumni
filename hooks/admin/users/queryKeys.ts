import type { GetUsersParams } from "./types";

export const userQueryKeys = {
	all: ["users"] as const,
	list: (params?: GetUsersParams) =>
		[
			"users",
			"list",
			params?.page ?? 1,
			params?.per_page ?? 10,
			params?.search ?? "",
			params?.status ?? "",
			params?.graduation_year ?? "",
			params?.domicile_province_code ?? "",
			params?.domicile_city_code ?? "",
			params?.domicile_district_code ?? "",
			params?.domicile_village_code ?? "",
			params?.sort_by ?? "",
			params?.sort_dir ?? "",
			params?.event_id ?? "",
		] as const,
};

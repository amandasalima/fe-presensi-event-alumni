export function buildQueryParams(
	params: Record<string, string | number | undefined | null>,
) {
	const searchParams = new URLSearchParams();

	Object.entries(params).forEach(([key, value]) => {
		if (value !== undefined && value !== null && String(value).trim() !== "") {
			searchParams.set(key, String(value));
		}
	});

	const queryString = searchParams.toString();

	return queryString ? `?${queryString}` : "";
}

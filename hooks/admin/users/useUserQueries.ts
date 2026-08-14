import { useQuery } from "@tanstack/react-query";
import { getUsers } from "./api";
import { userQueryKeys } from "./queryKeys";
import type { GetUsersParams } from "./types";

export function useUsers(params?: GetUsersParams) {
	return useQuery({
		queryKey: userQueryKeys.list(params),
		queryFn: () => getUsers(params),
	});
}

import { useQuery } from "@tanstack/react-query";
import { getUsers } from "./api";
import { userQueryKeys } from "./queryKeys";

export function useUsers() {
	return useQuery({
		queryKey: userQueryKeys.all,
		queryFn: getUsers,
	});
}

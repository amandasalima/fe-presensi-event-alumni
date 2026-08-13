import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAPI } from "@/lib/api";

export interface AdminAccount {
  id: number;
  first_name: string;
  last_name?: string | null;
  email: string;
  phone?: string | null;
  gender: string;
  role: "admin";
  admin_level: "super_admin" | "admin";
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
}

export interface FetchAdminsParams {
  search?: string;
  status?: string;
  adminLevel?: string;
  page?: number;
}

export interface AdminsResponse {
  success: boolean;
  data: {
    admins: AdminAccount[];
    total: number;
    current_page: number;
    last_page: number;
  };
}

// GET list of admins
export function useAdmins(params: FetchAdminsParams) {
  const queryParams = new URLSearchParams();
  if (params.search) queryParams.set("search", params.search);
  if (params.status) queryParams.set("status", params.status);
  if (params.adminLevel) queryParams.set("admin_level", params.adminLevel);
  if (params.page) queryParams.set("page", String(params.page));
  queryParams.set("per_page", "10");

  return useQuery<AdminsResponse>({
    queryKey: ["admins", params.search, params.status, params.adminLevel, params.page],
    queryFn: () => fetchAPI(`/admin/admins?${queryParams.toString()}`),
  });
}

// POST create admin
export function useCreateAdmin() {
  const queryClient = useQueryClient();
  return useMutation<any, Error, any>({
    mutationFn: (data) =>
      fetchAPI("/admin/admins", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admins"] });
    },
  });
}

// PUT update admin
export function useUpdateAdmin() {
  const queryClient = useQueryClient();
  return useMutation<any, Error, { id: number; data: any }>({
    mutationFn: ({ id, data }) =>
      fetchAPI(`/admin/admins/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admins"] });
      // Invalidate admin profile as well in case they edited themselves
      queryClient.invalidateQueries({ queryKey: ["admin-profile"] });
    },
  });
}

// PATCH update status admin
export function useUpdateAdminStatus() {
  const queryClient = useQueryClient();
  return useMutation<any, Error, { id: number; status: "active" | "inactive" }>({
    mutationFn: ({ id, status }) =>
      fetchAPI(`/admin/admins/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admins"] });
    },
  });
}

// DELETE admin
export function useDeleteAdmin() {
  const queryClient = useQueryClient();
  return useMutation<any, Error, number>({
    mutationFn: (id) =>
      fetchAPI(`/admin/admins/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admins"] });
    },
  });
}

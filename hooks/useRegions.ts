import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export interface Region {
  code: string;
  name: string;
  type?: string;
  parent_code?: string;
  postal_code?: string;
}

export function useProvinces() {
  return useQuery({
    queryKey: ["regions", "provinces"],
    queryFn: async (): Promise<Region[]> => {
      const { data } = await api.get("/regions/provinces");
      return data.data;
    },
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });
}

export function useCities(provinceCode: string | null | undefined) {
  return useQuery({
    queryKey: ["regions", "cities", provinceCode],
    queryFn: async (): Promise<Region[]> => {
      if (!provinceCode) return [];
      const { data } = await api.get(`/regions/cities?province_code=${provinceCode}`);
      return data.data;
    },
    enabled: !!provinceCode,
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });
}

export function useDistricts(cityCode: string | null | undefined) {
  return useQuery({
    queryKey: ["regions", "districts", cityCode],
    queryFn: async (): Promise<Region[]> => {
      if (!cityCode) return [];
      const { data } = await api.get(`/regions/districts?city_code=${cityCode}`);
      return data.data;
    },
    enabled: !!cityCode,
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });
}

export function useVillages(districtCode: string | null | undefined) {
  return useQuery({
    queryKey: ["regions", "villages", districtCode],
    queryFn: async (): Promise<Region[]> => {
      if (!districtCode) return [];
      const { data } = await api.get(`/regions/villages?district_code=${districtCode}`);
      return data.data;
    },
    enabled: !!districtCode,
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });
}

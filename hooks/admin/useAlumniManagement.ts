"use client";

import { useCallback, useMemo, useState } from "react";
import {
  useAlumni,
  useCreateAlumni,
  useDeleteAlumni,
  useUpdateAlumni,
} from "@/hooks/admin/useAlumni";
import { useSearchFilter } from "@/hooks/useSearchFilter";

export interface Alumni {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  graduation_year: string;
  gender: "Laki-laki" | "Perempuan";
  created_at: string;
}

export type AlumniModalMode = "tambah" | "edit";

export function getAlumniFullName(alumni: Alumni) {
  return `${alumni.first_name} ${alumni.last_name}`;
}

export function useAlumniManagement() {
  const [modal, setModal] = useState<AlumniModalMode | null>(null);
  const [selected, setSelected] = useState<Alumni | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  const { data: alumni = [], isLoading, isError } = useAlumni();
  const createAlumni = useCreateAlumni();
  const updateAlumni = useUpdateAlumni();
  const deleteAlumni = useDeleteAlumni();

  const getSearchValues = useCallback(
    (item: Alumni) => [getAlumniFullName(item), item.email],
    []
  );

  const {
    filteredItems: filtered,
    searchQuery: search,
    setSearchQuery: setSearch,
  } = useSearchFilter(alumni, getSearchValues);

  const stats = useMemo(() => {
    const now = new Date();

    return {
      totalLaki: alumni.filter((item: Alumni) => item.gender === "Laki-laki")
        .length,
      totalPerempuan: alumni.filter(
        (item: Alumni) => item.gender === "Perempuan"
      ).length,
      bulanIni: alumni.filter((item: Alumni) => {
        const registeredAt = new Date(item.created_at);
        return (
          registeredAt.getMonth() === now.getMonth() &&
          registeredAt.getFullYear() === now.getFullYear()
        );
      }).length,
    };
  }, [alumni]);

  const closeModal = useCallback(() => {
    setModal(null);
    setSelected(null);
  }, []);

  const openCreateModal = useCallback(() => {
    setSelected(null);
    setModal("tambah");
  }, []);

  const handleEdit = useCallback((item: Alumni) => {
    setSelected(item);
    setModal("edit");
  }, []);

  const handleSubmit = useCallback(
    (data: Partial<Alumni>) => {
      if (modal === "tambah") {
        createAlumni.mutate(data, { onSuccess: closeModal });
      } else if (modal === "edit" && selected) {
        updateAlumni.mutate(
          { id: selected.id, data },
          { onSuccess: closeModal }
        );
      }
    },
    [closeModal, createAlumni, modal, selected, updateAlumni]
  );

  const handleDelete = useCallback(
    (id: number) => {
      setDeleteTargetId(id);
    },
    []
  );

  const cancelDelete = useCallback(() => {
    setDeleteTargetId(null);
  }, []);

  const confirmDelete = useCallback(() => {
    if (!deleteTargetId) return;

    deleteAlumni.mutate(deleteTargetId, {
      onSettled: () => setDeleteTargetId(null),
    });
  }, [deleteAlumni, deleteTargetId]);

  return {
    alumni,
    closeModal,
    cancelDelete,
    confirmDelete,
    createAlumni,
    deleteAlumni,
    deleteTargetId,
    filtered,
    handleDelete,
    handleEdit,
    handleSubmit,
    isError,
    isLoading,
    isMutating: createAlumni.isPending || updateAlumni.isPending,
    modal,
    openCreateModal,
    search,
    selected,
    setSearch,
    stats,
    updateAlumni,
  };
}

// Hook pour la gestion des clients

"use client";

import { useState, useCallback } from "react";
import { apiService } from "@/lib/api";
import { Client } from "@/types";

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [client, setClient] = useState<Client | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchClients = useCallback(
    async (params?: { page?: number; search?: string }) => {
      setLoading(true);
      setError(null);

      const query = new URLSearchParams();
      if (params?.page) query.set("page", params.page.toString());
      if (params?.search) query.set("search", params.search);

      const result = await apiService.get<{
        clients: Client[];
        pagination: PaginationInfo;
      }>(`/clients?${query.toString()}`);

      if (result.success && result.data) {
        setClients(result.data.clients);
        setPagination(result.data.pagination);
      } else {
        setError(result.message || "حدث خطأ");
      }

      setLoading(false);
    },
    []
  );

  const fetchClient = useCallback(async (id: string) => {
    setLoading(true);
    const result = await apiService.get<{ client: Client }>(`/clients/${id}`);

    if (result.success && result.data) {
      setClient(result.data.client);
    } else {
      setError(result.message || "حدث خطأ");
    }
    setLoading(false);
  }, []);

  const createClient = useCallback(
    async (data: Partial<Client>) => {
      const result = await apiService.post<{ client: Client }>(
        "/clients",
        data
      );

      if (result.success) {
        return { success: true, client: result.data!.client };
      }
      return { success: false, message: result.message };
    },
    []
  );

  const updateClient = useCallback(
    async (id: string, data: Partial<Client>) => {
      const result = await apiService.put<{ client: Client }>(
        `/clients/${id}`,
        data
      );

      if (result.success) {
        return { success: true, client: result.data!.client };
      }
      return { success: false, message: result.message };
    },
    []
  );

  const deleteClient = useCallback(async (id: string) => {
    const result = await apiService.delete(`/clients/${id}`);

    if (result.success) {
      setClients((prev) => prev.filter((c) => c.id !== id));
      return { success: true };
    }
    return { success: false, message: result.message };
  }, []);

  return {
    clients,
    client,
    pagination,
    loading,
    error,
    fetchClients,
    fetchClient,
    createClient,
    updateClient,
    deleteClient,
  };
}

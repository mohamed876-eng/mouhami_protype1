// Hook pour la gestion des dossiers

"use client";

import { useState, useCallback } from "react";
import { apiService } from "@/lib/api";
import { Case } from "@/types";

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function useCases() {
  const [cases, setCases] = useState<Case[]>([]);
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCases = useCallback(
    async (params?: {
      page?: number;
      search?: string;
      etat?: string;
      type?: string;
      clientId?: string;
    }) => {
      setLoading(true);
      setError(null);

      const query = new URLSearchParams();
      if (params?.page) query.set("page", params.page.toString());
      if (params?.search) query.set("search", params.search);
      if (params?.etat) query.set("etat", params.etat);
      if (params?.type) query.set("type", params.type);
      if (params?.clientId) query.set("clientId", params.clientId);

      const result = await apiService.get<{
        cases: Case[];
        pagination: PaginationInfo;
      }>(`/dossiers?${query.toString()}`);

      if (result.success && result.data) {
        setCases(result.data.cases);
        setPagination(result.data.pagination);
      } else {
        setError(result.message || "حدث خطأ");
      }

      setLoading(false);
    },
    []
  );

  const fetchCase = useCallback(async (id: string) => {
    setLoading(true);
    const result = await apiService.get<{ case: Case }>(`/dossiers/${id}`);

    if (result.success && result.data) {
      setCaseData(result.data.case);
    } else {
      setError(result.message || "حدث خطأ");
    }
    setLoading(false);
  }, []);

  const createCase = useCallback(async (data: any) => {
    const result = await apiService.post<{ case: Case }>("/dossiers", data);

    if (result.success) {
      return { success: true, case: result.data!.case };
    }
    return { success: false, message: result.message };
  }, []);

  const updateCase = useCallback(async (id: string, data: any) => {
    const result = await apiService.put<{ case: Case }>(`/dossiers/${id}`, data);

    if (result.success) {
      return { success: true, case: result.data!.case };
    }
    return { success: false, message: result.message };
  }, []);

  const deleteCase = useCallback(async (id: string) => {
    const result = await apiService.delete(`/dossiers/${id}`);

    if (result.success) {
      setCases((prev) => prev.filter((c) => c.id !== id));
      return { success: true };
    }
    return { success: false, message: result.message };
  }, []);

  const toggleChecklist = useCallback(
    async (caseId: string, itemId: string, coche: boolean) => {
      const result = await apiService.patch<{ progress: number }>(
        `/dossiers/${caseId}/checklist/${itemId}`,
        { coche }
      );

      if (result.success && result.data) {
        return { success: true, progress: result.data.progress };
      }
      return { success: false, message: result.message };
    },
    []
  );

  const exportPDF = useCallback(async (caseId: string) => {
    try {
      const res = await fetch(`/api/dossiers/${caseId}/pdf`, {
        credentials: "same-origin",
      });

      if (!res.ok) throw new Error("PDF generation failed");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `case-${caseId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);

      return { success: true };
    } catch {
      return { success: false, message: "فشل في تصدير PDF" };
    }
  }, []);

  return {
    cases,
    caseData,
    pagination,
    loading,
    error,
    fetchCases,
    fetchCase,
    createCase,
    updateCase,
    deleteCase,
    toggleChecklist,
    exportPDF,
  };
}

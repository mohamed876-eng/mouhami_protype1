"use client";

import { useState, useCallback } from "react";
import { apiService } from "@/lib/api";
import { CaseType, CaseTypeDocument } from "@/types";

export function useCaseTypes() {
  const [types, setTypes] = useState<CaseType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTypes = useCallback(async (activeOnly = true) => {
    setLoading(true);
    setError(null);
    const query = activeOnly ? "?active=true" : "";
    const result = await apiService.get<{ types: CaseType[] }>(`/types-de-dossier${query}`);
    if (result.success && result.data) {
      setTypes(result.data.types);
    } else {
      setError(result.message || "حدث خطأ");
    }
    setLoading(false);
  }, []);

  const fetchType = useCallback(async (id: string) => {
    setLoading(true);
    const result = await apiService.get<{ caseType: CaseType }>(`/types-de-dossier/${id}`);
    setLoading(false);
    if (result.success && result.data) {
      return result.data.caseType;
    }
    return null;
  }, []);

  const createType = useCallback(async (data: { nameAr: string; description?: string }) => {
    const result = await apiService.post<{ caseType: CaseType }>("/types-de-dossier", data);
    if (result.success) {
      return { success: true, caseType: result.data!.caseType };
    }
    return { success: false, message: result.message };
  }, []);

  const updateType = useCallback(async (id: string, data: { nameAr?: string; description?: string; isActive?: boolean }) => {
    const result = await apiService.put<{ caseType: CaseType }>(`/types-de-dossier/${id}`, data);
    if (result.success) {
      return { success: true, caseType: result.data!.caseType };
    }
    return { success: false, message: result.message };
  }, []);

  const deleteType = useCallback(async (id: string) => {
    const result = await apiService.delete(`/types-de-dossier/${id}`);
    if (result.success) {
      setTypes((prev) => prev.filter((t) => t.id !== id));
      return { success: true };
    }
    return { success: false, message: result.message };
  }, []);

  // ─── CaseType Documents ──────────────────────────────────

  const addDocument = useCallback(async (caseTypeId: string, data: { nameAr: string; description?: string | null; isRequired?: boolean; order?: number }) => {
    const result = await apiService.post<{ document: CaseTypeDocument }>(`/types-de-dossier/${caseTypeId}/documents`, data);
    if (result.success) {
      return { success: true, document: result.data!.document };
    }
    return { success: false, message: result.message };
  }, []);

  const updateDocument = useCallback(async (caseTypeId: string, docId: string, data: { nameAr?: string; description?: string | null; isRequired?: boolean; order?: number }) => {
    const result = await apiService.put<{ document: CaseTypeDocument }>(`/types-de-dossier/${caseTypeId}/documents/${docId}`, data);
    if (result.success) {
      return { success: true, document: result.data!.document };
    }
    return { success: false, message: result.message };
  }, []);

  const deleteDocument = useCallback(async (caseTypeId: string, docId: string) => {
    const result = await apiService.delete(`/types-de-dossier/${caseTypeId}/documents/${docId}`);
    if (result.success) {
      return { success: true };
    }
    return { success: false, message: result.message };
  }, []);

  return {
    types,
    loading,
    error,
    fetchTypes,
    fetchType,
    createType,
    updateType,
    deleteType,
    addDocument,
    updateDocument,
    deleteDocument,
  };
}

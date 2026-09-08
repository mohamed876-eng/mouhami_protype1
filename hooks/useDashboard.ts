"use client";

import { useState, useEffect, useCallback } from "react";
import { apiService } from "@/lib/api";
import { transitionStore } from "@/lib/transitionStore";
import { DashboardData } from "@/types";

export function useDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    const result = await apiService.get<DashboardData>("/tableau-de-bord");
    if (result.success && result.data) {
      setData(result.data);
      setError(null);
    } else {
      setError(result.message || "حدث خطأ");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
    // Les données du dashboard sont désormais prêtes : la transition de login
    // (overlay Lottie) peut être retirée si elle est encore affichée.
    transitionStore.finish();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return { data, loading, error, refresh: fetchData };
}

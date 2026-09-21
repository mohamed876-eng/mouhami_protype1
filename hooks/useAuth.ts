// Hook personnalisé pour la gestion de l'authentification côté client

"use client";

import { useState, useEffect, useCallback } from "react";
import {
  AuthUser,
  getStoredUser,
  setStoredUser,
  setAuthTokens,
  clearAuth,
  isAuthenticated,
} from "@/lib/auth";
import { apiService } from "@/lib/api";
import { transitionStore } from "@/lib/transitionStore";
import { useRouter } from "next/navigation";

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const stored = getStoredUser();
    if (stored && isAuthenticated()) {
      setUser(stored);
    }
    setLoading(false);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const result = await apiService.post<{
        user: AuthUser;
        accessToken: string;
        refreshToken: string;
      }>("/authentification/login", { email, password }, { requireAuth: false });

      if (result.success && result.data) {
        setAuthTokens(result.data.accessToken, result.data.refreshToken);
        setStoredUser(result.data.user);
        setUser(result.data.user);

        // Affiche l'overlay de transition (Lottie) et navigue immédiatement :
        // l'overlay reste affiché tant que les données du dashboard ne sont
        // pas prêtes (transitionStore.finish() appelé par la page suivante).
        transitionStore.start();
        router.push(
          result.data.user.role === "admin" ? "/dashboard" : "/client/dashboard"
        );
        return { success: true };
      }

      return { success: false, message: result.message };
    },
    [router]
  );

  const register = useCallback(
    async (data: {
      email: string;
      password: string;
      nom: string;
      prenom: string;
      telephone?: string;
    }) => {
      const result = await apiService.post<{
        user: AuthUser;
        accessToken: string;
        refreshToken: string;
      }>("/authentification/register", data, { requireAuth: false });

      if (result.success && result.data) {
        setAuthTokens(result.data.accessToken, result.data.refreshToken);
        setStoredUser(result.data.user);
        setUser(result.data.user);

        // Même transition Lottie qu'après un login : l'overlay reste affiché
        // tant que le dashboard n'a pas chargé ses données.
        transitionStore.start();
        router.push("/dashboard");
        return { success: true };
      }

      return { success: false, message: result.message };
    },
    [router]
  );

  const logout = useCallback(async () => {
    await apiService.post("/authentification/logout", {}, { requireAuth: false });
    clearAuth();
    setUser(null);
    router.push("/login");
  }, [router]);

  return {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
  };
}

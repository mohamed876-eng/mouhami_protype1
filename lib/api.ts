export const API_BASE = "/api";

interface FetchOptions extends RequestInit {
  requireAuth?: boolean;
}

async function refreshToken(): Promise<string | null> {
  try {
    const res = await fetch(`${API_BASE}/authentification/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
    });

    if (!res.ok) return null;

    const data = await res.json();
    return typeof data.accessToken === "string" ? data.accessToken : null;
  } catch {
    return null;
  }
}

export async function api<T = unknown>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<{ success: boolean; data?: T; message?: string }> {
  const { requireAuth = true, ...fetchOpts } = options;

  const headers: Record<string, string> = {
    ...(fetchOpts.headers as Record<string, string>),
  };

  if (!headers["Content-Type"] && !(fetchOpts.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const extraireMessage = (donnees: any): string | undefined =>
    donnees?.error?.message || donnees?.message || undefined;

  try {
    let res = await fetch(`${API_BASE}${endpoint}`, {
      ...fetchOpts,
      headers,
      credentials: "same-origin",
    });

    if (res.status === 401 && requireAuth) {
      const newToken = await refreshToken();
      if (newToken) {
        res = await fetch(`${API_BASE}${endpoint}`, {
          ...fetchOpts,
          headers,
          credentials: "same-origin",
        });
      } else {
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return { success: false, message: "انتهت صلاحية الجلسة" };
      }
    }

    const data = await res.json();

    if (!res.ok) {
      return {
        success: false,
        message: extraireMessage(data) || "حدث خطأ في الاتصال",
      };
    }

    return { success: true, data };
  } catch {
    return {
      success: false,
      message: "تعذر الاتصال بالخادم",
    };
  }
}

export const apiService = {
  get: <T = unknown>(endpoint: string, options?: FetchOptions) =>
    api<T>(endpoint, { ...options, method: "GET" }),

  post: <T = unknown>(endpoint: string, body?: unknown, options?: FetchOptions) =>
    api<T>(endpoint, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T = unknown>(endpoint: string, body?: unknown, options?: FetchOptions) =>
    api<T>(endpoint, {
      ...options,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    }),

  patch: <T = unknown>(endpoint: string, body?: unknown, options?: FetchOptions) =>
    api<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T = unknown>(endpoint: string, options?: FetchOptions) =>
    api<T>(endpoint, { ...options, method: "DELETE" }),

  upload: async <T = unknown>(endpoint: string, formData: FormData) => {
    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        credentials: "same-origin",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        return {
          success: false,
          message: data?.error?.message || data.message || "حدث خطأ في الرفع",
        };
      }

      return { success: true, data: data as T };
    } catch {
      return { success: false, message: "تعذر الاتصال بالخادم" };
    }
  },
};

export interface AuthUser {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  role: "admin" | "client";
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}

function setCookie(name: string, value: string, maxAge: number): void {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

function deleteCookie(name: string): void {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; path=/; max-age=0`;
}

export function isAuthenticated(): boolean {
  return !!getCookie("user");
}

export function getStoredUser(): AuthUser | null {
  const raw = getCookie("user");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function setStoredUser(user: AuthUser): void {
  setCookie("user", JSON.stringify(user), 7 * 24 * 60 * 60);
}

export function setAuthTokens(_accessToken: string, _refreshToken: string): void {
  // Tokens are set as httpOnly cookies by the server.
}

export function clearAuth(): void {
  deleteCookie("user");
}

export function isAdmin(): boolean {
  const user = getStoredUser();
  return user?.role === "admin";
}

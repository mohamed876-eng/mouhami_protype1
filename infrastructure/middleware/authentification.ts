import { NextRequest, NextResponse } from "next/server";
import { verifierJetonAcces, PayloadJeton } from "@/infrastructure/base-de-donnees/jeton";

export interface UtilisateurAuthentifie {
  userId: string;
  email: string;
  role: string;
  nom: string;
  prenom: string;
}

export function obtenirUtilisateur(request: NextRequest): UtilisateurAuthentifie | null {
  try {
    const headerAuth = request.headers.get("authorization");
    if (headerAuth && headerAuth.startsWith("Bearer ")) {
      const token = headerAuth.split(" ")[1];
      return verifierJetonAcces(token);
    }

    const userId = request.headers.get("x-user-id");
    const email = request.headers.get("x-user-email");
    const role = request.headers.get("x-user-role");
    const nom = request.headers.get("x-user-nom");
    const prenom = request.headers.get("x-user-prenom");

    if (userId && email && role && nom && prenom) {
      return {
        userId,
        email,
        role,
        nom: decodeURIComponent(nom),
        prenom: decodeURIComponent(prenom),
      };
    }

    const jetonAcces = request.cookies.get("accessToken")?.value;
    if (jetonAcces) {
      return verifierJetonAcces(jetonAcces);
    }

    return null;
  } catch {
    return null;
  }
}

export function exigerAuthentification(request: NextRequest): UtilisateurAuthentifie {
  const utilisateur = obtenirUtilisateur(request);
  if (!utilisateur) {
    throw NextResponse.json(
      { success: false, message: "يرجى تسجيل الدخول أولاً" },
      { status: 401 }
    );
  }
  return utilisateur;
}

export function exigerAdmin(request: NextRequest): UtilisateurAuthentifie {
  const utilisateur = exigerAuthentification(request);
  if (utilisateur.role !== "admin") {
    throw NextResponse.json(
      { success: false, message: "غير مصرح لك بالوصول إلى هذه الصفحة" },
      { status: 403 }
    );
  }
  return utilisateur;
}

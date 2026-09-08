import { NextRequest, NextResponse } from "next/server";
import { serviceAuthentification } from "@/fonctionnalites/authentification/authentification.service";
import { reponseSucces, reponseErreur } from "@/infrastructure/erreurs/reponse-api";
import { verifierTentatives } from "@/infrastructure/securite/anti-bruteforce";

const TENTATIVES_MAX_PAR_FENETRE = 5;
const FENETRE_MS = 60_000;

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "inconnu";
    const controle = verifierTentatives(`inscription:${ip}`, {
      fenetreMs: FENETRE_MS,
      tentativesMax: TENTATIVES_MAX_PAR_FENETRE,
    });
    if (!controle.autorise) {
      return NextResponse.json(
        {
          success: false,
          message: "Trop de tentatives d'inscription. Réessayez dans une minute.",
        },
        { status: 429 }
      );
    }

    const { email, password, nom, prenom, telephone } = await request.json();
    if (!email || !password || !nom || !prenom) {
      return NextResponse.json(
        { success: false, message: "البريد الإلكتروني، كلمة المرور، الاسم واللقب مطلوبون" },
        { status: 400 }
      );
    }
    const result = await serviceAuthentification.inscription({ email, password, nom, prenom, telephone });

    const user = {
      id: result.utilisateur.id,
      email: result.utilisateur.email,
      nom: result.utilisateur.nom,
      prenom: result.utilisateur.prenom,
      role: result.utilisateur.role,
    };
    const accessToken = result.jetonAcces;
    const refreshToken = result.jetonRafraichissement;

    const response = reponseSucces({ user, accessToken, refreshToken }, 201);

    const isProd = process.env.NODE_ENV === "production";

    response.cookies.set("accessToken", accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      maxAge: 15 * 60,
      path: "/",
    });

    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    response.cookies.set("user", JSON.stringify(user), {
      httpOnly: false,
      secure: isProd,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error: unknown) {
    if (error instanceof NextResponse) return error;
    return reponseErreur(error as Error);
  }
}

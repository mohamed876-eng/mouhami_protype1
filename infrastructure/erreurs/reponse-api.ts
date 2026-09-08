import { NextResponse } from "next/server";
import { ErreurApi } from "./erreur-api";

export function reponseSucces<T extends object>(
  data: T,
  status = 200
): NextResponse {
  const body = { success: true, ...data };
  return NextResponse.json(body, { status });
}

export function reponseErreur(
  erreur: ErreurApi | Error,
  status?: number
): NextResponse {
  if (erreur instanceof ErreurApi) {
    return NextResponse.json(erreur.toJSON(), { status: erreur.statusCode });
  }

  if (process.env.NODE_ENV === "development") {
    console.error("[ErreurAPI]", erreur);
  }

  const message = erreur?.message || "Une erreur interne s'est produite.";
  const code = status && status < 500 ? "DEMANDE_INVALIDE" : "ERREUR_INTERNE";
  return NextResponse.json(
    { success: false, error: { code, message } },
    { status: status || 500 }
  );
}


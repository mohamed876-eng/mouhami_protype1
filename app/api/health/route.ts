import { reponseSucces } from "@/infrastructure/erreurs/reponse-api";

export async function GET() {
  return reponseSucces({ status: "ok", timestamp: new Date().toISOString() });
}

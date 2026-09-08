import jwt from "jsonwebtoken";

const PLACEHOLDERS = new Set([
  "change-this-to-a-random-secret",
  "your-access-secret-key-change-in-production",
  "fallback-secret",
]);

function chargerSecret(): string {
  const valeur = process.env.JWT_SECRET;
  if (!valeur || PLACEHOLDERS.has(valeur)) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "La variable d'environnement JWT_SECRET doit être définie avec un secret fort en production"
      );
    }
    return "fallback-secret";
  }
  return valeur;
}

const JWT_SECRET = chargerSecret();

interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  nom: string;
  prenom: string;
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
}
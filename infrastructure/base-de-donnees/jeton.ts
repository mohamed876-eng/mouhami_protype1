import jwt from "jsonwebtoken";

const PLACEHOLDERS = new Set([
  "change-this-to-a-random-secret",
  "change-this-to-another-random-secret",
  "your-access-secret-key-change-in-production",
  "your-refresh-secret-key-change-in-production",
  "fallback-secret",
  "fallback-refresh-secret",
]);

function chargerSecret(nom: string, placeholder: string): string {
  const valeur = process.env[nom];
  if (!valeur || PLACEHOLDERS.has(valeur)) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        `La variable d'environnement ${nom} doit être définie avec un secret fort en production`
      );
    }
    return placeholder;
  }
  return valeur;
}

const SECRET_ACCES = chargerSecret("JWT_SECRET", "fallback-secret");
const SECRET_RAFRAICHISSEMENT = chargerSecret(
  "JWT_REFRESH_SECRET",
  "fallback-refresh-secret"
);

export interface PayloadJeton {
  userId: string;
  email: string;
  role: string;
  nom: string;
  prenom: string;
}

export function genererJetonAcces(payload: PayloadJeton): string {
  return jwt.sign(payload, SECRET_ACCES, {
    expiresIn: process.env.JWT_EXPIRES_IN || "15m",
  } as jwt.SignOptions);
}

export function genererJetonRafraichissement(payload: PayloadJeton): string {
  return jwt.sign(payload, SECRET_RAFRAICHISSEMENT, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  } as jwt.SignOptions);
}

export function verifierJetonAcces(token: string): PayloadJeton {
  return jwt.verify(token, SECRET_ACCES) as PayloadJeton;
}

export function verifierJetonRafraichissement(token: string): PayloadJeton {
  return jwt.verify(token, SECRET_RAFRAICHISSEMENT) as PayloadJeton;
}

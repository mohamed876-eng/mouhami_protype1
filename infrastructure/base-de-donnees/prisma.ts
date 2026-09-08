import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const LIMITE_CONNEXIONS_DEFAUT = 4;

function obtenirUrlAvecLimiteConnexions(): string | undefined {
  const url = process.env.DATABASE_URL;
  if (!url) return undefined;

  const limite = process.env.PRISMA_CONNECTION_LIMIT || String(
    LIMITE_CONNEXIONS_DEFAUT
  );

  if (url.includes("connection_limit=")) {
    return url;
  }

  const separateur = url.includes("?") ? "&" : "?";
  return `${url}${separateur}connection_limit=${limite}`;
}

function creerClientPrisma(): PrismaClient {
  const options: ConstructorParameters<typeof PrismaClient>[0] = {
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  };
  const url = obtenirUrlAvecLimiteConnexions();
  if (url) {
    options.datasources = { db: { url } };
  }
  return new PrismaClient(options);
}

export const prisma = globalForPrisma.prisma || creerClientPrisma();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export async function ensureDbConnected() {
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    await new Promise((r) => setTimeout(r, 3000));
    await prisma.$queryRaw`SELECT 1`;
  }
}
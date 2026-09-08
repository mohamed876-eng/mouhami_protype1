const fenetres = new Map<
  string,
  { compteur: number; reinitialisation: number }
>();

interface OptionsAntiBruteforce {
  fenetreMs?: number;
  tentativesMax: number;
}

export function verifierTentatives(
  identifiant: string,
  { fenetreMs = 60_000, tentativesMax }: OptionsAntiBruteforce
): {
  autorise: boolean;
  restant: number;
  reinitialisation: number;
} {
  const maintenant = Date.now();
  const entree = fenetres.get(identifiant);

  if (fenetres.size > 10_000 && (maintenant - dernierePurge) > 60_000) {
    nettoyerFenetres();
  }

  if (!entree || entree.reinitialisation <= maintenant) {
    fenetres.set(identifiant, { compteur: 1, reinitialisation: maintenant + fenetreMs });
    return { autorise: true, restant: tentativesMax - 1, reinitialisation: maintenant + fenetreMs };
  }

  entree.compteur += 1;
  const autorise = entree.compteur <= tentativesMax;
  return {
    autorise,
    restant: Math.max(0, tentativesMax - entree.compteur),
    reinitialisation: entree.reinitialisation,
  };
}

let dernierePurge = 0;

export function nettoyerFenetres(): void {
  const maintenant = Date.now();
  for (const [cle, entree] of fenetres) {
    if (entree.reinitialisation <= maintenant) {
      fenetres.delete(cle);
    }
  }
  dernierePurge = maintenant;
}

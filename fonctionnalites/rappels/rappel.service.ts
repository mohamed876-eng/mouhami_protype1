import { dossierRappelRepository } from "./rappel.repository";
import { ErreurApi } from "@/infrastructure/erreurs/erreur-api";

function analyserDateEvenement(date: Date, heure?: string): Date {
  if (!heure) return new Date(date);
  const [heures, minutes] = heure.split(":").map(Number);
  const d = new Date(date);
  d.setHours(heures || 0, minutes || 0, 0, 0);
  return d;
}

function calculerMomentsRappel(
  dateEvenement: Date,
  heureEvenement?: string
): Date[] {
  const momentEvenement = analyserDateEvenement(dateEvenement, heureEvenement);
  return [
    new Date(momentEvenement.getTime() - 7 * 24 * 60 * 60 * 1000),
    new Date(momentEvenement.getTime() - 3 * 24 * 60 * 60 * 1000),
    new Date(momentEvenement.getTime() - 24 * 60 * 60 * 1000),
    new Date(momentEvenement.getTime() - 2 * 60 * 60 * 1000),
    new Date(momentEvenement.getTime() - 30 * 60 * 1000),
  ].filter((d) => d > new Date());
}

export const serviceRappels = {
  async creerEvenement(userId: string, donnees: any) {
    const dateEvenement = new Date(
      donnees.date + (donnees.time ? `T${donnees.time}` : "T00:00:00")
    );
    const evenement = await dossierRappelRepository.creerEvenement({
      title: donnees.title,
      description: donnees.description || null,
      type: donnees.type,
      date: dateEvenement,
      time: donnees.time || null,
      lieu: donnees.lieu || null,
      priority: donnees.priority || "NORMALE",
      clientId: donnees.clientId || null,
      caseId: donnees.caseId || null,
      userId,
    });

    const momentsRappel = calculerMomentsRappel(dateEvenement, donnees.time);
    if (momentsRappel.length > 0) {
      const rappels = momentsRappel.map((momentRappel) => ({
        eventId: evenement.id,
        userId,
        title: donnees.title,
        description: donnees.description || null,
        remindAt: momentRappel,
      }));
      await dossierRappelRepository.creerRappels(rappels);
    }

    return evenement;
  },

  async mettreAJourEvenement(userId: string, id: string, donnees: any) {
    const existant = await dossierRappelRepository.trouverEvenementParId(id);
    if (!existant) throw ErreurApi.nonTrouve("Événement");
    if (existant.userId !== userId)
      throw ErreurApi.autorisationRefusee();

    const evenement = await dossierRappelRepository.mettreAJourEvenement(
      id,
      donnees
    );

    if (donnees.date || donnees.time) {
      await dossierRappelRepository.supprimerRappelsParEvenement(id);
      const momentsRappel = calculerMomentsRappel(
        donnees.date || existant.date,
        donnees.time ?? existant.time ?? undefined
      );
      if (momentsRappel.length > 0) {
        const rappels = momentsRappel.map((momentRappel) => ({
          eventId: id,
          userId,
          title: donnees.title || existant.title,
          description: donnees.description ?? existant.description,
          remindAt: momentRappel,
        }));
        await dossierRappelRepository.creerRappels(rappels);
      }
    }

    return evenement;
  },

  async supprimerEvenement(userId: string, id: string) {
    const existant = await dossierRappelRepository.trouverEvenementParId(id);
    if (!existant) throw ErreurApi.nonTrouve("Événement");
    if (existant.userId !== userId)
      throw ErreurApi.autorisationRefusee();
    return dossierRappelRepository.supprimerEvenement(id);
  },

  async obtenirProchainEvenement(userId: string) {
    return dossierRappelRepository.trouverProchainEvenement(userId);
  },

  async obtenirEvenementsAujourdhui(userId: string) {
    return dossierRappelRepository.trouverEvenementsAujourdhui(userId);
  },

  async obtenirRappelsEnAttente(userId: string) {
    return dossierRappelRepository.trouverRappelsEnAttente(userId);
  },

  async obtenirCompteEnAttente(userId: string) {
    return dossierRappelRepository.compterEnAttente(userId);
  },

  async ignorerRappel(userId: string, id: string) {
    return dossierRappelRepository.ignorerRappel(id);
  },

  async marquerNotifie(userId: string, id: string) {
    return dossierRappelRepository.marquerNotifie(id);
  },
};

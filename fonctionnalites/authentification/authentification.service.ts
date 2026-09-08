import bcrypt from "bcryptjs";
import { dossierUtilisateurRepository } from "./authentification.repository";
import {
  genererJetonAcces,
  genererJetonRafraichissement,
  verifierJetonRafraichissement,
} from "@/infrastructure/base-de-donnees/jeton";
import { ErreurApi } from "@/infrastructure/erreurs/erreur-api";
import { prisma } from "@/infrastructure/base-de-donnees/prisma";

const NOMBRE_TOURS_SEL = 12;

export const serviceAuthentification = {
  async connexion(email: string, password: string) {
    const utilisateur = await dossierUtilisateurRepository.trouverParEmail(email);
    if (!utilisateur) {
      throw ErreurApi.donneesInvalides(
        "البريد الإلكتروني أو كلمة المرور غير صحيحة"
      );
    }

    if (!utilisateur.isActive) {
      throw new ErreurApi(403, "COMPTE_INACTIF", "هذا الحساب غير نشط");
    }

    const motDePasseValide = await bcrypt.compare(password, utilisateur.password);
    if (!motDePasseValide) {
      throw ErreurApi.donneesInvalides(
        "البريد الإلكتروني أو كلمة المرور غير صحيحة"
      );
    }

    const payload = {
      userId: utilisateur.id,
      email: utilisateur.email,
      role: utilisateur.role,
      nom: utilisateur.nom,
      prenom: utilisateur.prenom,
    };
    const jetonAcces = genererJetonAcces(payload);
    const jetonRafraichissement = genererJetonRafraichissement(payload);

    await dossierUtilisateurRepository.mettreAJourConnexion(
      utilisateur.id,
      jetonRafraichissement
    );

    return {
      utilisateur: {
        id: utilisateur.id,
        email: utilisateur.email,
        nom: utilisateur.nom,
        prenom: utilisateur.prenom,
        role: utilisateur.role,
      },
      jetonAcces,
      jetonRafraichissement,
    };
  },

  async inscription(data: {
    email: string;
    password: string;
    nom: string;
    prenom: string;
    telephone?: string;
  }) {
    const existant = await dossierUtilisateurRepository.trouverParEmail(data.email);
    if (existant) {
      throw ErreurApi.conflit("هذا البريد الإلكتروني مستخدم بالفعل");
    }

    const motDePasseHashé = await bcrypt.hash(data.password, NOMBRE_TOURS_SEL);

    const utilisateur = await dossierUtilisateurRepository.creer({
      email: data.email,
      password: motDePasseHashé,
      nom: data.nom,
      prenom: data.prenom,
      telephone: data.telephone,
      role: "admin",
    });

    const payload = {
      userId: utilisateur.id,
      email: utilisateur.email,
      role: utilisateur.role,
      nom: utilisateur.nom,
      prenom: utilisateur.prenom,
    };
    const jetonAcces = genererJetonAcces(payload);
    const jetonRafraichissement = genererJetonRafraichissement(payload);

    await dossierUtilisateurRepository.mettreAJourJetonRafraichissement(
      utilisateur.id,
      jetonRafraichissement
    );

    return {
      utilisateur: {
        id: utilisateur.id,
        email: utilisateur.email,
        nom: utilisateur.nom,
        prenom: utilisateur.prenom,
        role: utilisateur.role,
      },
      jetonAcces,
      jetonRafraichissement,
    };
  },

  async rafraichir(jetonRafraichissement: string) {
    try {
      const decode = verifierJetonRafraichissement(jetonRafraichissement);
      const utilisateur = await dossierUtilisateurRepository.trouverParId(
        decode.userId
      );

      if (!utilisateur || utilisateur.refreshToken !== jetonRafraichissement) {
        throw ErreurApi.nonAuthentifie("رمز التحديث غير صالح");
      }

      const payload = {
        userId: utilisateur.id,
        email: utilisateur.email,
        role: utilisateur.role,
        nom: utilisateur.nom,
        prenom: utilisateur.prenom,
      };
      const nouveauJetonAcces = genererJetonAcces(payload);
      const nouveauJetonRafraichissement = genererJetonRafraichissement(payload);

      await dossierUtilisateurRepository.mettreAJourJetonRafraichissement(
        utilisateur.id,
        nouveauJetonRafraichissement
      );

      return {
        jetonAcces: nouveauJetonAcces,
        jetonRafraichissement: nouveauJetonRafraichissement,
      };
    } catch (erreur) {
      if (erreur instanceof ErreurApi) throw erreur;
      throw ErreurApi.nonAuthentifie(
        "رمز التحديث غير صالح أو منتهي الصلاحية"
      );
    }
  },

  async deconnexion(userId: string) {
    await dossierUtilisateurRepository.mettreAJourJetonRafraichissement(
      userId,
      null
    );
  },

  async inscrireClient(data: {
    email: string;
    password: string;
    nom: string;
    prenom: string;
    telephone: string;
    cin: string;
  }) {
    const existant = await dossierUtilisateurRepository.trouverParEmail(data.email);
    if (existant) {
      throw ErreurApi.conflit("هذا البريد الإلكتروني مستخدم بالفعل");
    }

    const motDePasseHashé = await bcrypt.hash(data.password, NOMBRE_TOURS_SEL);

    const utilisateur = await prisma.$transaction(async (tx) => {
      const nouvelUtilisateur = await tx.user.create({
        data: {
          email: data.email,
          password: motDePasseHashé,
          nom: data.nom,
          prenom: data.prenom,
          telephone: data.telephone,
          role: "client",
        },
      });

      const client = await tx.client.create({
        data: {
          nom: data.nom,
          prenom: data.prenom,
          cin: data.cin,
          telephone: data.telephone,
        },
      });

      await tx.user.update({
        where: { id: nouvelUtilisateur.id },
        data: { clientId: client.id },
      });

      return { utilisateur: nouvelUtilisateur, client };
    });

    return utilisateur;
  },
};

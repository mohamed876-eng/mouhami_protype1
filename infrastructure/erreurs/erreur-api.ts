export class ErreurApi extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: Record<string, unknown>;

  constructor(
    statusCode: number,
    code: string,
    message: string,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "ErreurApi";
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }

  static nonTrouve(ressource: string): ErreurApi {
    return new ErreurApi(404, "RESSOURCE_NON_TROUVEE", `${ressource} non trouvé(e).`);
  }

  static autorisationRefusee(message?: string): ErreurApi {
    return new ErreurApi(403, "AUTORISATION_REFUSEE", message || "Accès refusé.");
  }

  static nonAuthentifie(message?: string): ErreurApi {
    return new ErreurApi(401, "NON_AUTHENTIFIE", message || "Authentification requise.");
  }

  static donneesInvalides(message: string, details?: Record<string, unknown>): ErreurApi {
    return new ErreurApi(400, "DONNEES_INVALIDES", message, details);
  }

  static conflit(message: string): ErreurApi {
    return new ErreurApi(409, "CONFLIT", message);
  }

  toJSON() {
    return {
      success: false,
      error: {
        code: this.code,
        message: this.message,
        ...(this.details ? { details: this.details } : {}),
      },
    };
  }
}

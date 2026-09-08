export interface FournisseurLLM {
  genererTexte(prompt: string, options?: OptionsGeneration): Promise<string>;
  estDisponible(): Promise<boolean>;
}

export interface OptionsGeneration {
  temperature?: number;
  modele?: string;
  maxTokens?: number;
}

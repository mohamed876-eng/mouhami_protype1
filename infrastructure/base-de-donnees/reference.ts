export function genererReferenceDossier(): string {
  const annee = new Date().getFullYear();
  const aleatoire = Math.floor(Math.random() * 9000 + 1000);
  return `REF-${annee}-${aleatoire}`;
}

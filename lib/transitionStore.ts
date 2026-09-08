// Store global minimaliste pour piloter la transition de login.
// Permet d'afficher l'overlay Lottie "tant que la page suivante n'est pas
// prête" (données du dashboard chargées), quel que soit l'écran affiché.

type Listener = () => void;

let active = false;
let listeners: Listener[] = [];

function emit() {
  for (const listener of listeners) listener();
}

export const transitionStore = {
  isActive: () => active,
  start() {
    active = true;
    emit();
  },
  finish() {
    if (!active) return;
    active = false;
    emit();
  },
  subscribe(listener: Listener) {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  },
};
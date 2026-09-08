// Configuration centralisée de l'expérience d'authentification Lottie.
//
// La scène (1920×1080 @ 60fps, frames 0 → FINAL_FRAME) contient deux pilules
// navy munies de labels or (dessinés dans l'animation) :
//   - pilule gauche  → « تسجيل الدخول » (signin)
//   - pilule droite  → « إنشاء حساب »   (signup)
//
// Timeline pilotée par les frames réelles de l'animation (pas de setTimeout) :
//   intro (auto-play)  →  PAUSE_FRAME (gel + zones cliquables)  →
//   click → reprise exacte  →  FORM_REVEAL_FRAME (carte #F4F0E8)  →
//   FINAL_FRAME (arrêt, la carte reste visible).

import scene4Animation from "@/components/lottie/scene4_cleaned.json";

/** Source Lottie (ne jamais modifier le JSON). */
export const LOTTIE_SOURCE = scene4Animation;

/** Dimensions natives de la scène (2000×1080). */
export const SCENE_W = 2000;
export const SCENE_H = 1080;

/**
 * Frame où les deux pilules (labels or inclus) sont pleinement visibles
 * (opacité 100 %), au repos, avant que le mouvement de sortie ne commence.
 * Dans scene4, les pilules sont stables en bas de l'écran (y ≈ 846‑848)
 * sur toute la plage 0→~195, puis montent et quittent l'écran à partir de
 * ~200. On gèle à 180 pour garantir un état parfaitement stable.
 */
export const PAUSE_FRAME = 180;

/**
 * Frame où la carte d'authentification commence à se révéler, pendant que
 * l'animation continue (les pilules quittent l'écran vers le haut dès 200
 * et sont sorties vers 230).
 */
export const FORM_REVEAL_FRAME = 230;

/** Dernière frame de l'animation (op du Lottie). */
export const FINAL_FRAME = 324;

export type AuthMode = "signin" | "signup";
export type AnimationPhase = "intro" | "waiting" | "continuing" | "finished";

export interface ButtonZone {
  id: "signin" | "signup";
  mode: AuthMode;
  /** Bords de la pilule en coordonnées scène, avec une petite marge tactile. */
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Zones de clic transparentes, positionnées exactement sur les pilules
 * visuelles de l'animation à PAUSE_FRAME (coordonnées scène 2000×1080).
 * Recalé sur scene4 : les pilules reposent EN BAS de l'écran.
 *   - gauche (signin) : rect ≈ (423, 847) 185×72 → centre (515.5, 883)
 *   - droite (signup) : rect ≈ (704, 845) 185×73 → centre (796.5, 881.5)
 * Les zones sont élargies (220×100) autour de ces centres pour un appui
 * confortable.
 */
export const BUTTON_ZONES: ButtonZone[] = [
  { id: "signin", mode: "signin", x: 406, y: 833, w: 220, h: 100 },
  { id: "signup", mode: "signup", x: 687, y: 832, w: 220, h: 100 },
];

export interface ViewportSize {
  w: number;
  h: number;
}

/**
 * Mappe un point de la scène (2000×1080) vers l'écran pour un rendu
 * « slice » centré (preserveAspectRatio = xMidYMid slice) : l'animation
 * remplit tout l'écran en rognant le surplus, ce qui aligne les zones de
 * clic avec les pilules.
 */
export function sceneToScreen(sx: number, sy: number, viewport: ViewportSize) {
  const scale = Math.max(viewport.w / SCENE_W, viewport.h / SCENE_H);
  const offsetX = (viewport.w - SCENE_W * scale) / 2;
  const offsetY = (viewport.h - SCENE_H * scale) / 2;
  return { x: offsetX + sx * scale, y: offsetY + sy * scale, scale };
}
"use client";

// Expérience d'authentification cinématique.
//
// L'animation Jitter/Lottie occupe tout l'écran (fixed, 100vw × 100vh) et
// contient déjà les boutons visuels « تسجيل الدخول » (gauche) et « إنشاء حساب »
// (droite) dessinés dans la scène. On ne les recrée pas : deux zones de clic
// transparentes sont positionnées précisément dessus, à la frame gelée.
//
// Timeline (pilotée par les frames réelles, pas de setTimeout) :
//   intro  →  PAUSE_FRAME (gel + zones actives)  →  clic →
//   reprise exacte  →  FORM_REVEAL_FRAME → la carte #F4F0E8 émerge →
//   FINAL_FRAME → arrêt, la carte reste visible et utilisable.

import { useCallback, useEffect, useRef, useState } from "react";
import { Lottie, type LottieHandle } from "lottie-react";
import { useAuth } from "@/hooks/useAuth";
import { AuthCard } from "@/components/ui/AuthCard";
import {
  BUTTON_ZONES,
  FORM_REVEAL_FRAME,
  LOTTIE_SOURCE,
  PAUSE_FRAME,
  sceneToScreen,
  type AnimationPhase,
  type AuthMode,
  type ViewportSize,
} from "./lottieConfig";

export default function LoginPage() {
  const { login, register } = useAuth();

  const [phase, setPhase] = useState<AnimationPhase>("intro");
  const [authMode, setAuthMode] = useState<AuthMode | null>(null);
  const [formRevealed, setFormRevealed] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [viewport, setViewport] = useState<ViewportSize>({ w: 0, h: 0 });

  const lottieRef = useRef<LottieHandle>(null);
  const phaseRef = useRef<AnimationPhase>("intro");
  const pauseReachedRef = useRef(false);
  const formRevealedRef = useRef(false);
  const loadErrorRef = useRef(false);

  // Taille du viewport → repositionne les zones de clic (responsive).
  useEffect(() => {
    const update = () => setViewport({ w: window.innerWidth, h: window.innerHeight });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // L'animation démarre automatiquement depuis la frame 0.
  const handleReady = useCallback(() => {
    const anim = lottieRef.current;
    if (!anim) return;
    anim.setSpeed(1);
    anim.seek(0);
    anim.play();
  }, []);

  // Contrôle par frames réelles : gel à PAUSE_FRAME, puis révélation à
  // FORM_REVEAL_FRAME pendant la reprise.
  const handleFrame = useCallback((event: { currentFrame: number }) => {
    const raw = (event as { currentFrame?: number }).currentFrame;
    const frame = typeof raw === "number" ? raw : 0;
    const anim = lottieRef.current;

    if (!pauseReachedRef.current && phaseRef.current === "intro" && frame >= PAUSE_FRAME) {
      pauseReachedRef.current = true;
      phaseRef.current = "waiting";
      anim?.pause();
      anim?.seek(PAUSE_FRAME);
      setPhase("waiting");
      return;
    }

    if (
      phaseRef.current === "continuing" &&
      !loadErrorRef.current &&
      !formRevealedRef.current &&
      frame >= FORM_REVEAL_FRAME
    ) {
      formRevealedRef.current = true;
      setFormRevealed(true);
    }
  }, []);

  // Fin d'animation : on ne cache jamais la carte.
  const handleComplete = useCallback(() => {
    if (!formRevealedRef.current) {
      formRevealedRef.current = true;
      setFormRevealed(true);
    }
    if (phaseRef.current === "continuing" || phaseRef.current === "waiting") {
      phaseRef.current = "finished";
      setPhase("finished");
    }
  }, []);

  // Si l'animation ne peut pas se charger, on bascule en secours récupérable :
  // le formulaire s'affiche directement, sans l'animation.
  const handleError = useCallback(() => {
    loadErrorRef.current = true;
    setLoadError(true);
  }, []);

  // Clic sur une pilule visuelle de l'animation.
  const chooseMode = useCallback((mode: AuthMode) => {
    if (phaseRef.current !== "waiting") return;
    setAuthMode(mode);

    if (loadErrorRef.current) {
      formRevealedRef.current = true;
      setFormRevealed(true);
      phaseRef.current = "finished";
      setPhase("finished");
      return;
    }

    phaseRef.current = "continuing";
    setPhase("continuing");
    // Reprend l'animation exactement depuis la frame gelée.
    lottieRef.current?.play();
  }, []);

  const toggleMode = useCallback(() => {
    setAuthMode((current) => (current === "signin" ? "signup" : "signin"));
  }, []);

  const activeMode = authMode ?? (loadError ? "signin" : null);
  const cardVisible = formRevealed || loadError;

  const zones =
    phase === "waiting" && !authMode && !loadError && viewport.w > 0
      ? BUTTON_ZONES.map((zone) => {
          const pos = sceneToScreen(zone.x, zone.y, viewport);
          const scale = pos.scale;
          let w = zone.w * scale;
          let h = zone.h * scale;
          // Zone d'appui confortable, même quand l'art 16:9 est petit à l'écran.
          const MIN_HIT = 44;
          if (w < MIN_HIT) w = MIN_HIT;
          if (h < MIN_HIT) h = MIN_HIT;
          const cx = pos.x + (zone.w * scale) / 2;
          const cy = pos.y + (zone.h * scale) / 2;
          return {
            ...zone,
            left: cx - w / 2,
            top: cy - h / 2,
            width: w,
            height: h,
          };
        })
      : [];

  return (
    <main className="fixed inset-0 overflow-hidden bg-[#F4F0E8]">
      {/* Calque décoratif : Lottie plein écran, jamais interactif. */}
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
        {!loadError && (
          <Lottie
            lottieRef={lottieRef}
            src={LOTTIE_SOURCE}
            autoplay={false}
            loop={false}
            renderer="svg"
            rendererSettings={{ preserveAspectRatio: "xMidYMid slice" }}
            subscriptions={{
              ready: handleReady,
              frame: handleFrame,
              complete: handleComplete,
              error: handleError,
            }}
            className="h-full w-full"
            style={{
              width: "100vw",
              height: "100vh",
              background: "#F4F0E8",
            }}
          />
        )}
      </div>

      {/* Zones de clic transparentes au-dessus des pilules visuelles. */}
      {zones.map((zone) => (
        <button
          key={zone.id}
          type="button"
          aria-label={zone.mode === "signin" ? "تسجيل الدخول" : "إنشاء حساب"}
          onClick={() => chooseMode(zone.mode)}
          className="absolute z-20 cursor-pointer"
          style={{
            left: zone.left,
            top: zone.top,
            width: zone.width,
            height: zone.height,
            background: "transparent",
            border: "none",
            padding: 0,
          }}
        />
      ))}

      {/* Carte #F4F0E8, calque indépendant, progressive et persistante. */}
      {activeMode && (
        <div className="pointer-events-none fixed inset-0 z-30 flex items-center justify-center">
          <div
            className="pointer-events-auto transition-all duration-1000 ease-out will-change-[transform,opacity,filter]"
            style={{
              width: "min(560px, calc(100vw - 48px))",
              opacity: cardVisible ? 1 : 0,
              transform: cardVisible
                ? "translateY(0) scale(1)"
                : "translateY(20px) scale(0.97)",
              filter: cardVisible ? "blur(0px)" : "blur(8px)",
            }}
          >
            <AuthCard
              mode={activeMode === "signin" ? "login" : "register"}
              revealed={cardVisible}
              login={login}
              register={register}
              onToggleMode={toggleMode}
            />
          </div>
        </div>
      )}
    </main>
  );
}
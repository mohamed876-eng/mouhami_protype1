"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { Lottie, type LottieHandle } from "lottie-react";

type IconeAnimeeMode = "hover" | "click" | "none";

interface IconeAnimeeProps {
  icone: object;
  taille?: number;
  animation?: IconeAnimeeMode;
  className?: string;
  loop?: boolean;
  onClick?: () => void;
  title?: string;
  hoverScale?: number;
}

// Place l'animation sur sa DERNIÈRE frame (état final, toujours visible).
// lottie-react v3 : "percent" est interprété en 0–100 (PAS 0–1), donc 100 =
// fin du range jouable. On appelle d'abord stop() pour garantir que l'animation
// est à l'arrêt (isPaused = true), afin que seek() utilise goToAndStop() et NON
// goToAndPlay() — sinon l'animation se lancerait automatiquement.
function goToLastFrame(ref: React.RefObject<LottieHandle | null>) {
  const anim = ref.current;
  if (!anim) return;
  try {
    anim.stop();
    anim.seek({ percent: 100 });
  } catch {
    try {
      anim.stop();
      anim.seek(Number.MAX_SAFE_INTEGER);
    } catch {
      // fallback silencieux
    }
  }
}

export default function IconeAnimee({
  icone,
  taille = 48,
  animation = "hover",
  className = "",
  loop = false,
  onClick,
  title,
  hoverScale = 1.08,
}: IconeAnimeeProps) {
  const lottieRef = useRef<LottieHandle>(null);
  const [pressed, setPressed] = useState(false);

  // L'événement "ready" (lottie-react v3) se déclenche quand l'animation est
  // chargée dans le DOM. À ce moment lottieRef.current est déjà rempli :
  // on pose immédiatement l'icône sur sa dernière frame VISIBLE, sans aucune
  // interaction ni autoplay. C'est CE qui garantit la visibilité dès le
  // premier rendu (et après refresh).
  const handleReady = useCallback(() => {
    goToLastFrame(lottieRef);
  }, []);

  // Filet de sécurité : recentre sur la dernière frame après le montage
  // complet, au cas où l'événement ready manquerait dans un rendu particulier.
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      goToLastFrame(lottieRef);
    });
    return () => cancelAnimationFrame(id);
  }, [icone]);

  const handleMouseEnter = useCallback(() => {
    if (animation !== "hover") return;
    const anim = lottieRef.current;
    if (!anim) return;
    anim.seek(0);
    anim.play();
  }, [animation]);

  const handleMouseLeave = useCallback(() => {
    if (animation !== "hover") return;
    const anim = lottieRef.current;
    if (!anim) return;
    anim.stop();
    goToLastFrame(lottieRef);
  }, []);

  const handleClick = useCallback(() => {
    const anim = lottieRef.current;
    if (animation === "click" && anim) {
      anim.seek(0);
      anim.play();
    }
    setPressed(true);
    window.setTimeout(() => setPressed(false), 180);
    onClick?.();
  }, [animation, onClick]);

  return (
    <span
      className={`inline-flex items-center justify-center ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      title={title}
      style={{
        transform: pressed ? `scale(${hoverScale})` : "scale(1)",
        transition: "transform 0.2s ease",
        opacity: 1,
        visibility: "visible",
        display: "inline-flex",
      }}
    >
      <Lottie
        src={icone}
        lottieRef={lottieRef}
        autoplay={false}
        subscriptions={{ ready: handleReady }}
        style={{
          width: taille,
          height: taille,
          display: "block",
          opacity: 1,
          visibility: "visible",
        }}
      />
    </span>
  );
}

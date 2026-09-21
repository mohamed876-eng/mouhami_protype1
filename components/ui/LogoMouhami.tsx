"use client";

import { useCallback, useEffect, useRef } from "react";
import { Lottie, type LottieHandle } from "lottie-react";
import logoAnimation from "@/components/lottie/scene_logo_mouhami_no_jitter.json";

// Le Lottie (canvas 843×240) est affiché à sa proportion naturelle pour ne rien
// rogner : hauteur 96px → largeur 96 × 843/240 ≈ 337px au maximum.
// Vitesse réduite (0.65) pour ralentir un peu l'animation au hover.
const LOGO_RATIO = "843 / 240";
const LOGO_SPEED = 0.65;

function showLastFrame(ref: React.RefObject<LottieHandle | null>) {
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
      // fallback silencieux : l'animation reste juste arrêtée
    }
  }
}

export default function LogoMouhami() {
  const lottieRef = useRef<LottieHandle>(null);

  // État passif par défaut : mise sur la dernière frame statique (logo visible
  // immédiatement), sans autoplay ni boucle.
  const handleReady = useCallback(() => {
    showLastFrame(lottieRef);
  }, []);

  useEffect(() => {
    const id = requestAnimationFrame(() => showLastFrame(lottieRef));
    return () => cancelAnimationFrame(id);
  }, []);

  const handleMouseEnter = useCallback(() => {
    const anim = lottieRef.current;
    if (!anim) return;
    anim.stop();
    anim.seek(0);
    anim.play();
  }, []);

  const handleMouseLeave = useCallback(() => {
    const anim = lottieRef.current;
    if (!anim) return;
    anim.stop();
    showLastFrame(lottieRef);
  }, []);

  // Nettoyage : arrête l'animation quand le composant est démonté.
  useEffect(() => {
    return () => {
      try {
        lottieRef.current?.stop();
      } catch {
        // nettoyage silencieux
      }
    };
  }, []);

  return (
    <div
      className="flex items-center shrink-0 overflow-hidden w-[180px] sm:w-[220px] md:w-[260px] lg:w-[290px] xl:w-[337px]"
      style={{ aspectRatio: LOGO_RATIO, maxWidth: "100%" }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      title="محامي"
    >
      <Lottie
        src={logoAnimation}
        lottieRef={lottieRef}
        autoplay={false}
        loop={false}
        speed={LOGO_SPEED}
        renderer="svg"
        subscriptions={{ ready: handleReady }}
        rendererSettings={{
          preserveAspectRatio: "xMidYMid meet",
        }}
        style={{
          width: "100%",
          height: "100%",
          display: "block",
        }}
      />
    </div>
  );
}

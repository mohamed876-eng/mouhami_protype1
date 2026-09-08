"use client";

import { useEffect, useRef, useState } from "react";
import { Lottie, type LottieHandle } from "lottie-react";
import logoAnimation from "@/components/lottie/Scene_no_jitter_watermark.json";
import { transitionStore } from "@/lib/transitionStore";

// Overlay de transition après login. Il reste affiché tant que l'état global
// `transitionStore` est actif : l'animation n'est retirée QUE lorsque la page
// suivante (dashboard) a chargé ses données et appelle transitionStore.finish().
// L'animation est ralentie (speed 0.5) et boucle doucement en attendant.
export default function LoginTransitionAnimation() {
  const [visible, setVisible] = useState(false);
  const [fading, setFading] = useState(false);
  const lottieRef = useRef<LottieHandle>(null);
  const removeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const unsubscribe = transitionStore.subscribe(() => {
      const active = transitionStore.isActive();
      if (active) {
        setVisible(true);
        setFading(false);
        if (removeTimer.current) {
          clearTimeout(removeTimer.current);
          removeTimer.current = null;
        }
      } else {
        setFading(true);
        removeTimer.current = setTimeout(() => {
          setVisible(false);
          setFading(false);
        }, 400);
      }
    });
    return () => {
      unsubscribe();
      if (removeTimer.current) clearTimeout(removeTimer.current);
    };
  }, []);

  useEffect(() => {
    return () => {
      const anim = lottieRef.current;
      try {
        anim?.stop();
      } catch {
        // nettoyage silencieux
      }
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] w-screen h-screen overflow-hidden transition-opacity duration-300 ease-out pointer-events-none ${
        fading ? "opacity-0" : "opacity-100"
      }`}
    >
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          background:
            "radial-gradient(ellipse at center, #FFFFFF 0%, #EAF2FF 70%, #DCE8FA 100%)",
        }}
      >
        {/* Halo lumineux subtil */}
        <div
          className="absolute rounded-full"
          style={{
            width: "min(85vw, 90vh)",
            height: "min(85vw, 90vh)",
            background:
              "radial-gradient(circle, rgba(15,61,145,0.06) 0%, rgba(212,175,55,0.04) 45%, transparent 70%)",
          }}
        />

        <div className="relative w-screen h-screen">
          <Lottie
            src={logoAnimation}
            lottieRef={lottieRef}
            autoplay
            loop
            renderer="svg"
            speed={0.5}
            rendererSettings={{
              preserveAspectRatio: "xMidYMid slice",
            }}
            style={{ width: "100%", height: "100%" }}
          />
        </div>
      </div>
    </div>
  );
}
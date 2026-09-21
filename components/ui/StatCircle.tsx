"use client";

import { useEffect, useState, useRef } from "react";
import IconeAnimee from "@/components/ui/IconeAnimee";

interface StatCircleProps {
  title: string;
  value: number;
  icone: object;
}

const R_ANNEAU = 80;
const CIRCONFERENCE = 2 * Math.PI * R_ANNEAU;

function AnimatedCounter({ value }: { value: number }) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  const safeValue = Number.isFinite(Number(value)) ? Number(value) : 0;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    let startTime: number;
    let raf: number;
    const animate = (time: number) => {
      if (!startTime) startTime = time;
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / 800, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * safeValue));
      if (progress < 1) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [safeValue, started]);

  return <span ref={ref}>{count.toLocaleString()}</span>;
}

function StatCircle({ title, value, icone }: StatCircleProps) {
  return (
    <div className="flex flex-col items-center gap-2 select-none shrink-0">
      <div className="relative flex items-center justify-center w-[120px] h-[120px] sm:w-[150px] sm:h-[150px] md:w-[175px] md:h-[175px] xl:w-[212px] xl:h-[212px]">
        <svg
          viewBox="0 0 200 200"
          className="absolute inset-0 w-full h-full -rotate-90"
          aria-hidden="true"
        >
          <defs>
            <linearGradient
              id="gradientAnneauMouhami"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#0F3D91" />
              <stop offset="65%" stopColor="#1E5BDB" />
              <stop offset="100%" stopColor="#FF9F1C" />
            </linearGradient>
          </defs>

          <circle
            cx="100"
            cy="100"
            r={R_ANNEAU}
            fill="none"
            stroke="#EAF2FF"
            strokeWidth="12"
          />

          <circle
            cx="100"
            cy="100"
            r={R_ANNEAU}
            fill="none"
            stroke="url(#gradientAnneauMouhami)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={CIRCONFERENCE}
            strokeDashoffset={CIRCONFERENCE * 0.18}
          />
        </svg>

        <IconeAnimee
          icone={icone}
          taille={44}
          title={title}
          className="relative z-10 scale-75 sm:scale-100"
        />
      </div>

      <p className="text-2xl sm:text-3xl xl:text-4xl font-bold text-[#0E2F6B] tabular-nums leading-tight">
        <AnimatedCounter value={value} />
      </p>
      <p className="text-sm sm:text-base xl:text-lg font-semibold text-[#6B7280] text-center leading-snug">
        {title}
      </p>
    </div>
  );
}

export default StatCircle;
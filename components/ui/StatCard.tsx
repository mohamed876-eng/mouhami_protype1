"use client";

import { useEffect, useState, useRef } from "react";
import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: number;
  icon: ReactNode;
}

function AnimatedCounter({ value }: { value: number }) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  // Défense contre les NaN : toute valeur non-numérique est ramenée à 0.
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

export default function StatCard({ title, value, icon }: StatCardProps) {
  return (
    <div className="bg-white rounded-card shadow-card p-6 flex items-center gap-5 transition-all duration-250 hover:-translate-y-1 hover:shadow-card-hover cursor-default h-[150px]">
      <div className="w-24 h-24 rounded-[22px] bg-[#EAF2FF] flex items-center justify-center text-[#0F3D91] shrink-0">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-lg text-[#6B7280] font-semibold">{title}</p>
        <p className="text-3xl font-bold text-[#0E2F6B] tabular-nums leading-tight mt-1">
          <AnimatedCounter value={value} />
        </p>
      </div>
    </div>
  );
}

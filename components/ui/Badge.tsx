"use client";

import { getStatusColor } from "@/lib/utils";

interface BadgeProps {
  text: string;
  color?: string;
}

export default function Badge({ text, color }: BadgeProps) {
  const className = color || getStatusColor(text);

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${className}`}
    >
      {text}
    </span>
  );
}

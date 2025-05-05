"use client";

import { useRef } from "react";

interface MagicalCardProps extends React.HTMLAttributes<HTMLLIElement> {
  children: React.ReactNode;
}

export function MagicalCard({ children, className = "", ...props }: MagicalCardProps) {
  const ref = useRef<HTMLLIElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    const card = ref.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    card.style.setProperty("--x", `${x}px`);
    card.style.setProperty("--y", `${y}px`);
  };

  return (
    <li
      ref={ref}
      onMouseMove={handleMouseMove}
      className={`relative overflow-hidden group transition-colors duration-300 ease-in-out border border-transparent hover:border-gray-200 dark:hover:border-gray-700 ${className}`}
      {...props}
    >
      <div className="pointer-events-none absolute -inset-px z-0 bg-[radial-gradient(circle_at_var(--x)_var(--y),rgba(255,255,255,0.15),transparent_80%)] transition-opacity duration-300 opacity-0 group-hover:opacity-100" />
      <div className="relative z-10">{children}</div>
    </li>
  );
}

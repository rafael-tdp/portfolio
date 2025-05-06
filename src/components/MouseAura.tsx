"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

export default function MouseAura() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const updatePosition = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", updatePosition);
    return () => window.removeEventListener("mousemove", updatePosition);
  }, []);

  if (!mounted || resolvedTheme !== "dark") return null;

  return (
    <div
      className="pointer-events-none fixed z-20 w-0 md:w-96 h-96 rounded-full bg-indigo-500/20 blur-3xl transition-transform duration-50 ease-in-out"
      style={{
        left: 0,
        top: 0,
        transform: `translate(calc(${position.x}px - 50%), calc(${position.y}px - 50%))`,
      }}
    />
  );
}

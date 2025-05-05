"use client";

import { useRef } from "react";

interface TiltCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  maxTilt?: number; // degré max d'inclinaison
}

export function TiltCard({ children, className = "", maxTilt = 15, ...props }: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left; // coord dans la card
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const deltaX = x - centerX;
    const deltaY = y - centerY;

    const rotateX = (-deltaY / centerY) * maxTilt;
    const rotateY = (deltaX / centerX) * maxTilt;

    card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  };

  const resetTilt = () => {
    if (cardRef.current) {
      cardRef.current.style.transform = `rotateX(0deg) rotateY(0deg)`;
    }
  };

  return (
    <div
      className={`[perspective:1000px]`}
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={resetTilt}
        className={`transition-transform duration-200 ease-out ${className}`}
        {...props}
      >
        {children}
      </div>
    </div>
  );
}

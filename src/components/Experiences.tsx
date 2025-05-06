"use client";

import React, { useState } from "react";
import ExperienceCard from "./ExperienceCard";
import experiences from "@/lib/experiences";

export default function Experiences() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section id="experience" className="py-12 px-4 sm:px-8 max-w-5xl mx-auto">
      <h2 className="text-md font-medium mb-12 text-gray-600 dark:text-gray-400 uppercase tracking-widest">
        # Expériences
      </h2>
      <div className="flex flex-col gap-6">
        {experiences.map((exp, i) => (
          <ExperienceCard
            key={i}
            exp={exp}
            i={i}
            isHovered={hoveredIndex === null || hoveredIndex === i}
            onHover={() => setHoveredIndex(i)}
            onLeave={() => setHoveredIndex(null)}
          />
        ))}
      </div>
    </section>
  );
}

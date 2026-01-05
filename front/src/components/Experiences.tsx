"use client";

import React, { useState } from "react";
import ExperienceCard from "./ExperienceCard";
import experiences from "@/lib/experiences";
import SectionTitle from "./SectionTitle";
import LinkWithIcon from "./LinkWithIcon";

export default function Experiences() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section id="experience" className="">
      <SectionTitle>Expériences</SectionTitle>

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
      <LinkWithIcon
        href="/cv.pdf"
        text="Afficher le CV complet"
        newTab={true}
        className="mt-8"
      />
    </section>
  );
}

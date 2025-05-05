"use client";

import React, { useState } from "react";
import ExperienceCard from "./ExperienceCard";

type Experience = {
  title: string;
  company: string;
  period: string;
  location: string;
  description: string;
  tech: string[]; // id
  website?: string;
};

const experiences: Experience[] = [
  {
    title: "Développeur Back-End (alternance)",
    company: "Ownest",
    period: "2023 – 2025",
    location: "Paris, France",
    description: `Développement et maintenance des fonctionnalités back-end sur deux applications web. Travail en étroite collaboration avec les équipes produit et front-end. Interventions ponctuelles sur le front pour intégrer ou adapter des composants existants.`,
    tech: ["node", "express", "nestjs", "vue", "mongodb"],
    website: "https://www.ownest.io",
  },
  {
    title: "Développeur Full-Stack (stage)",
    company: "LFP Ravalement",
    period: "juin 2021 - août 2021",
    location: "Paris, France",
    description: `Création d'un site vitrine et d'un système de facturation personnalisé. Déploiement du site, configuration de l'hébergement et optimisation du référencement pour améliorer la visibilité de l'entreprise.`,
    tech: ["node", "express", "vue", "postgresql", "tailwind"],
    website: "https://www.lfp-ravalement.fr",
  },
  {
    title: "Développeur Full-Stack (stage)",
    company: "Sport Management System",
    period: "juin 2020 - août 2020",
    location: "Paris, France",
    description: `Amélioration d'un planning de gestion de coachs sportifs. Développement de nouvelles fonctionnalités en autonomie pour répondre à des besoins utilisateurs spécifiques.`,
    tech: ["laravel", "vue", "vuetify"],
    website: "https://sport-management-system.com",
  },
];

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
  
"use client";

import React from "react";
import SectionTitle from "./SectionTitle";
import TechnologyCard from "./TechnologyCard";
import { technologies } from "@/lib/technologies";
import LinkWithIcon from "./LinkWithIcon";

export default function Skills() {
    const groupedTechnologies = technologies.reduce((acc, tech) => {
        const category = tech.category.toLowerCase();
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(tech);
        return acc;
    }, {} as Record<string, typeof technologies>);

    return (
        <section id="skills" className="py-16 px-4 sm:px-8 max-w-6xl mx-auto">
            <SectionTitle># Compétences</SectionTitle>

            <div className="mt-12 grid gap-12">
                {Object.entries(groupedTechnologies).map(([category, techs]) => (
                    <div key={category}>
                        <div className="flex items-center mb-4">
                            <h3 className="text-sm font-light text-gray-700 dark:text-gray-400 capitalize mr-2">
                                {formatCategoryName(category)}
                            </h3>
                            <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
                        </div>
                        <div className="flex flex-wrap gap-4">
                            {techs.map((tech) => (
                                <TechnologyCard
                                    key={tech.id}
                                    id={tech.id}
                                    icon={tech.icon}
                                    name={tech.name}
                                    color={tech.color}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            <LinkWithIcon
                href="/cv.pdf"
                text="Afficher le CV complet"
                newTab={true}
                className="mt-12"
            />
        </section>
    );
}

function formatCategoryName(category: string): string {
    const map: Record<string, string> = {
        languages: "Langages",
        frontend: "Frameworks & Librairies Frontend",
        backend: "Frameworks & Librairies Backend",
        mobile: "Mobile",
        database: "Bases de données",
        cloud: "Cloud & Hébergement",
        tools: "Outils",
        testing: "Tests",
        methodologies: "Méthodologies",
        ai: "Intelligence Artificielle",
    };
    return map[category] || category;
}

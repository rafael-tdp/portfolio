"use client";

import ProjectsSection from "./ProjectSection";
import projects from "@/lib/projects";
import SectionTitle from "./SectionTitle";
import LinkWithIcon from "./LinkWithIcon";

export default function Projects() {
  return (
    <section id="projects" className="py-16 px-4 max-w-5xl mx-auto">
      <SectionTitle># Projets récents</SectionTitle>
      <div className="flex flex-col gap-6">
        {projects.map((p, i) => (
          <ProjectsSection
            title={p.title}
            description={p.description}
            details={p.details}
            image={p.image}
            imageDescription={p.imageDescription}
            tech={p.tech}
            href={p.href}
            gradient={p.gradient}
            bgGradient={p.bgGradient}
            accentColor={p.accentColor}
            darkAccentColor={p.darkAccentColor}
            shadowColor={p.shadowColor}
            key={i}
          />
        ))}
      </div>
      <LinkWithIcon
        href="https://github.com/rafael-tdp"
        text="Voir plus de projets"
      />
    </section>
  );
}

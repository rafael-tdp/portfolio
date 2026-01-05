"use client";

import ProjectsSection from "./ProjectSection";
import projects from "@/lib/projects";
import SectionTitle from "./SectionTitle";
import LinkWithIcon from "./LinkWithIcon";

export default function Projects() {
  return (
    <section id="projects" className="">
      <SectionTitle>Projets récents</SectionTitle>
      <div className="flex flex-col gap-24 md:gap-28">
        {projects.map((p, i) => (
          <div
            key={i}
            data-project={p.title}
            id={`project-${p.title.toLowerCase().replace(/\s+/g, "-")}`}
          >
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
            />
          </div>
        ))}
      </div>
      <LinkWithIcon
        href="https://github.com/rafael-tdp"
        text="Voir plus de projets"
        className="mt-12"
      />
    </section>
  );
}

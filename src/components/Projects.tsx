"use client";

import ProjectsSection from "./ProjectSection";
import projects from "@/lib/projects";

export default function Projects() {
  return (
    <section id="projects" className="py-16 px-4 max-w-5xl mx-auto">
      <h2 className="text-md font-medium mb-4 text-gray-600 dark:text-gray-400 uppercase tracking-widest">
        # Projets récents
      </h2>
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
    </section>
  );
}

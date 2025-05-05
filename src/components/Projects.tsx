"use client";

import { ProjectCard } from "./ProjectCard";

const projects: any[] = [
  // {
  //   title: "Blog Next.js",
  //   desc: "Un blog moderne avec Markdown",
  //   tech: "Next.js, Tailwind",
  // },
  // {
  //   title: "API Node.js",
  //   desc: "API REST sécurisée",
  //   tech: "Node.js, Express",
  // },
  // { title: "Jeu 3D", desc: "Expérience WebGL en 3D", tech: "Three.js" },
];

export default function Projects() {
  return (
    <section id="projects" className="py-16 px-4 max-w-5xl mx-auto">
      <h2 className="text-md font-medium mb-12 text-gray-600 dark:text-gray-400 uppercase tracking-widest">
          # Projets récents
        </h2>
      <div className="grid md:grid-cols-3 gap-8">
        {/* to come */}
        <p className="text-sm md:text-md text-slate-500 dark:text-gray-400 md:mb-0 mb-8 col-span-3 mb-12">
          Ajout prochainement de mes projets récents...
        </p>
        {projects.map((p, i) => (
          <ProjectCard
            key={i}
            title={p.title}
            desc={p.desc}
            tech={p.tech}
            delay={i * 0.1}
          />
        ))}
      </div>
    </section>
  );
}

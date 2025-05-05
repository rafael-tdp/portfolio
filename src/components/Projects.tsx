"use client";

import { ProjectCard } from "./ProjectCard";

const projects = [
  {
    title: "Blog Next.js",
    desc: "Un blog moderne avec Markdown",
    tech: "Next.js, Tailwind",
  },
  {
    title: "API Node.js",
    desc: "API REST sécurisée",
    tech: "Node.js, Express",
  },
  { title: "Jeu 3D", desc: "Expérience WebGL en 3D", tech: "Three.js" },
];

export default function Projects() {
  return (
    <section className="py-16 px-4 max-w-5xl mx-auto">
      <h3 className="text-3xl font-bold text-center mb-12">
        🚀 Mes projets interactifs
      </h3>
      <div className="grid md:grid-cols-3 gap-8">
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

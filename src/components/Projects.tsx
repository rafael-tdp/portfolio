"use client";

import ProjectsSection from "./ProjectSection";
import projects from "@/lib/projects";
import { FiGithub } from "react-icons/fi";
import { motion } from "framer-motion";

export default function Projects() {
  return (
    <section id="projects" className="py-16 px-4 max-w-5xl mx-auto">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-md font-medium mb-12 text-gray-600 dark:text-gray-400 uppercase tracking-widest"
      >
        # Projets récents
      </motion.h2>
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
      <div className="flex justify-center">
        <a href="https://github.com/rafael-tdp" className="text-sm font-normal text-gray-400 dark:text-gray-200 transition-all flex items-center hover:text-indigo-500 dark:hover:text-indigo-200">
          Voir plus de projets
          <FiGithub className="ml-3" size={18} />
        </a>
      </div>
    </section>
  );
}

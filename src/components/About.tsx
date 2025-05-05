"use client";

import { motion } from "framer-motion";

export default function About() {
  const javascriptTechs: string[] = [
    "JavaScript",
    "TypeScript",
    "React",
    "Node.js",
    "Vue.js",
    "NestJS",
    "Next.js",
  ];

  // Animation principale du bloc
  const containerVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  // Animation des <strong>
  const strongVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };

  // Animation des items de la liste
  const listItemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.3,
        ease: "easeOut",
      },
    }),
  };

  // Fonction helper pour les mots en gras
  const Strong = ({ children }: { children: React.ReactNode }) => (
    <motion.strong
      variants={strongVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, amount: 0.8 }}
      className="font-semibold text-indigo-600 dark:text-yellow-200"
    >
      {children}
    </motion.strong>
  );

  return (
    <motion.section
      id="about"
      className="py-24 px-4 sm:px-8 max-w-4xl mx-auto"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, amount: 0.2 }}
    >
      <p className="text-sm sm:text-md text-slate-700 dark:text-slate-400 leading-relaxed">
        Bonjour ! Je m'appelle <Strong>Rafael Tavares De Pinho</Strong>, et je
        suis un <Strong>développeur full-stack</Strong> passionné par la
        création d'expériences web à la fois <Strong>intuitives</Strong>,{" "}
        <Strong>accessibles</Strong> et <Strong>performantes</Strong>.
        <br />
        <br />
        J'ai débuté mon parcours en tant que{" "}
        <Strong>développeur back-end</Strong> chez <Strong>Ownest</Strong>, où
        j'ai travaillé sur des APIs robustes. Ce poste m'a permis de participer
        à la stabilité et à l'évolution d'un projet en production. En parallèle
        de cette expérience professionnelle, j'ai pu développer ma sensibilité
        pour le <Strong>front-end</Strong> grâce à des projets étudiants ou
        personnels. Je m'attache toujours à produire des interfaces soignées,
        cohérentes et accessibles.
        <br />
        <br />
        J'aime particulièrement travailler sur des applications qui demandent
        une réelle attention à la fois à l'<Strong>ergonomie</Strong> et à l'
        <Strong>architecture technique</Strong>. Qu'il s'agisse de design
        systems ou de logique métier complexe, je prends plaisir à construire
        des solutions durables et bien pensées.
        <br />
        <br />
        Je suis également passionné par les{" "}
        <Strong>technologies JavaScript</Strong>, que j'utilise au quotidien à
        travers des frameworks et bibliothèques comme :
        <br />
      </p>

      <ul className="flex flex-wrap text-sm mt-4 list-none">
        {javascriptTechs.map((tech, i) => (
          <motion.li
            key={tech}
            custom={i}
            variants={listItemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false }}
            className="w-1/2 mb-1 before:content-['▹'] before:text-indigo-600 dark:before:text-yellow-200 before:mr-2"
          >
            {tech}
          </motion.li>
        ))}
      </ul>
    </motion.section>
  );
}

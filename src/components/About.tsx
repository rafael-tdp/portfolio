"use client";

import { motion } from "framer-motion";
import SectionTitle from "./SectionTitle";

export default function About() {
  // const javascriptTechs: string[] = [
  //   "JavaScript",
  //   "TypeScript",
  //   "React",
  //   "Node.js",
  //   "Vue.js",
  //   "NestJS",
  //   "Next.js",
  // ];

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

  const strongVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };

  // const listItemVariants = {
  //   hidden: { opacity: 0, x: -10 },
  //   visible: (i: number) => ({
  //     opacity: 1,
  //     x: 0,
  //     transition: {
  //       delay: i * 0.05,
  //       duration: 0.3,
  //       ease: "easeOut",
  //     },
  //   }),
  // };

  const Strong = ({ children }: { children: React.ReactNode }) => (
    <motion.strong
      variants={strongVariants}
      initial="opacity-0"
      whileInView="opacity-100"
      viewport={{ once: true }}
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
      viewport={{ once: true }}
    >
      <SectionTitle className="block md:hidden"># à props de moi</SectionTitle>

      <p className="text-sm sm:text-base text-slate-700 dark:text-slate-400 leading-relaxed">
        Bonjour ! Je m&apos;appelle <Strong>Rafael Tavares De Pinho</Strong>, et
        je suis un <Strong>développeur full-stack</Strong> passionné par la
        création d&apos;expériences web à la fois <Strong>intuitives</Strong>,{" "}
        <Strong>accessibles</Strong> et <Strong>performantes</Strong>.
        <br />
        <br />
        J&apos;ai débuté mon parcours en tant que{" "}
        <Strong>développeur back-end</Strong> chez <Strong>Ownest</Strong>, où
        j&apos;ai travaillé sur des APIs robustes. Ce poste m&apos;a permis de
        participer à la stabilité et à l&apos;évolution d&apos;un projet en
        production. En parallèle de cette expérience professionnelle, j&apos;ai
        pu développer ma sensibilité pour le <Strong>front-end</Strong> grâce à
        des projets étudiants ou personnels. Je m&apos;attache toujours à
        produire des interfaces soignées, cohérentes et accessibles.
        <br />
        <br />
        J&apos;aime particulièrement travailler sur des applications qui
        demandent une réelle attention à la fois à l&apos;
        <Strong>ergonomie</Strong> et à l&apos;
        <Strong>architecture technique</Strong>. Qu&apos;il s&apos;agisse de
        design systems ou de logique métier complexe, je prends plaisir à
        construire des solutions durables et bien pensées.
        <br />
        <br />
        {/* Je suis également passionné par les{" "}
        <Strong>technologies JavaScript</Strong>, que j&apos;utilise au
        quotidien à travers des frameworks et bibliothèques comme :
        <br /> */}
      </p>

      {/* <ul className="flex flex-wrap text-sm mt-4 list-none">
        {javascriptTechs.map((tech, i) => (
          <motion.li
            key={tech}
            custom={i}
            variants={listItemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="w-1/2 mb-1 before:content-['▹'] before:text-indigo-600 dark:before:text-yellow-200 before:mr-2"
          >
            {tech}
          </motion.li>
        ))}
      </ul> */}
    </motion.section>
  );
}

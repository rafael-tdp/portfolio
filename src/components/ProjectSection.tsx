"use client";

import { PiStarFourBold } from "react-icons/pi";
import { motion } from "framer-motion";
import ProjectCard from "./ProjectCard";
import TechnologyBadge from "./TechnologyBadge";

export default function ProjectsSection({
  title,
  description,
  details,
  image,
  imageDescription = "A beautiful image",
  href,
  tech = [],
  bgGradient = "linear-gradient(188.62deg, #6b0d33 49.9%, #db2777 81.7%, #f472b6 93.88%, #f9d793 113.5%)",
  textColor = "text-pink-300",
  shadowColor = "#DB2777",
  gradient = "linear-gradient(90deg, #6b0d33 0%, #db2777 100%)",
}: {
  title: string;
  description: string;
  details?: string[];
  image: string | null;
  imageDescription?: string;
  href?: string;
  tech?: string[];
  bgGradient?: string;
  textColor?: string;
  shadowColor?: string;
  gradient?: string;
}) {
  return (
    <section id="projects" className="relative w-full py-12">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ once: false }}
      >
        <div className="flex">
          <div
            aria-hidden="true"
            className={`my-4 mr-4 h-1 min-w-6 rounded-full ${
              gradient ? `bg-gradient-to-r ${gradient}` : `bg-pink-300`
            }`}
          ></div>
          <div className="flex flex-col items-start">
            <div className="flex items-center gap-3">
              <h3 className="text-xl md:text-2xl font-semibold">{title}</h3>
            </div>
            <p className="my-2 text-sm md:text-sm">
              {description}
            </p>
            <ul className="mt-2 flex flex-col gap-y-2 text-sm md:text-sm">
              {details?.map((detail, index) => (
                <li key={index} className="flex items-center">
                  <PiStarFourBold
                    className={`mt-1 mr-2 h-3 w-3 shrink-0 ${textColor}`}
                  />
                  {detail}
                </li>
              ))}
            </ul>
            <div className="mt-10 flex flex-wrap gap-3 text-sm">
              {tech.map((techId) => (
                <TechnologyBadge key={techId} id={techId} showIcon={true} bgColor="bg-transparent" textColor={`${textColor}`} />
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="mt-8"
        initial={{ opacity: 0, x: 30 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: "easeOut", delay: 0.3 }}
        viewport={{ once: false }}
      >
        <ProjectCard
          title={title}
          description={imageDescription}
          image={image}
          href="#"
          bgGradient={bgGradient}
          textColor={textColor}
          shadowColor={shadowColor}
        />
      </motion.div>
    </section>
  );
}

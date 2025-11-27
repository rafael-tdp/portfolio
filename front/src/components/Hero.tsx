"use client";

import { Typewriter } from "react-simple-typewriter";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <div className="text-left">
      <motion.a
        href="#"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0 }}
        className="text-3xl md:text-5xl font-semibold md:font-bold mb-4 tracking-tight dark:text-gray-100 block"
      >
        Rafael Tavares De Pinho
      </motion.a>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-lg md:text-2xl tracking-tight font-medium text-slate-600 dark:text-gray-300 mb-4 bg-indigo-300 dark:bg-indigo-800 md:bg-transparent md:dark:bg-transparent py-1 md:py-0 inline-block md:block"
      >
        Développeur Full Stack
      </motion.p>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="text-sm md:text-base mt-2 text-slate-500 dark:text-gray-400 mb-8 md:mb-0"
      >
        <Typewriter
          words={[
            "Je conçois des applications web modernes",
            "Je développe des APIs robustes et sécurisées",
            "Je crée des interfaces élégantes et accessibles",
            "Je donne vie à des projets tech avec passion",
          ]}
          loop={0}
          cursor
          cursorStyle="_"
          typeSpeed={40}
          deleteSpeed={30}
          delaySpeed={1500}
        />
      </motion.p>
    </div>
  );
}

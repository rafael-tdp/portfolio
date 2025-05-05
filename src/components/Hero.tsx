"use client";

import { Typewriter } from "react-simple-typewriter";

export default function Hero() {
  return (
    <div>
      <a
        href="#"
        className="text-3xl md:text-5xl font-bold mb-4 tracking-tight dark:text-gray-100 block"
      >
        Rafael Tavares De Pinho
      </a>
      <p className="text-xl md:text-2xl tracking-tight font-medium text-slate-600 dark:text-gray-300 mb-4">
        Développeur Full-Stack
      </p>
      <p className="text-sm md:text-md mt-2 text-slate-500 dark:text-gray-400 md:mb-0 mb-8">
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
      </p>
    </div>
  );
}

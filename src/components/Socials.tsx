"use client";

import { FiGithub, FiLinkedin } from "react-icons/fi";
import { FaXTwitter } from "react-icons/fa6";
import { motion } from "framer-motion";

const socials = [
  {
    name: "GitHub",
    url: "https://github.com/rafael-tdp",
    icon: FiGithub,
  },
  {
    name: "LinkedIn",
    url: "https://linkedin.com/in/tavares-de-pinho-rafael",
    icon: FiLinkedin,
  },
  {
    name: "Twitter",
    url: "https://twitter.com/rafael-tdp",
    icon: FaXTwitter,
  },
];

export default function Socials() {
  return (
    <div className="flex flex-row gap-4">
      {socials.map(({ name, url, icon: Icon }, index) => (
        <motion.a
          key={name}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={name}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.2, duration: 0.4 }}
        >
          <Icon className="text-base md:text-2xl hover:text-gray-700 dark:hover:text-gray-300 transition-colors" />
        </motion.a>
      ))}
    </div>
  );
}

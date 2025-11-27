"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

const menuItems = [
  { label: "À propos de moi", href: "#about" },
  { label: "Expériences", href: "#experience" },
  { label: "Projets", href: "#projects" },
  { label: "Compétences", href: "#skills" },
];

export default function Menu() {
  const [activeSection, setActiveSection] = useState<string>("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.3 }
    );

    const sections = document.querySelectorAll("section");
    sections.forEach((section) => observer.observe(section));

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <motion.nav
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="hidden md:flex flex-col gap-7 items-start py-12 mt-12 relative"
    >
      {menuItems.map(({ label, href }, index) => (
        <motion.div
          key={href}
          initial={{ opacity: 0, x: 0 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 + index * 0.15 }}
        >
          <Link
            href={href}
            className={`text-xs font-medium transition-all group uppercase flex items-center gap-4 ${
              activeSection === href.substring(1)
                ? "text-indigo-600 dark:text-white"
                : "text-indigo-300 dark:text-slate-600"
            }`}
          >
            <span
              className={`w-0 h-[1px] group-hover:bg-indigo-500 group-hover:dark:bg-white group-hover:w-16 transition-all duration-300 ${
                activeSection === href.substring(1) ? "w-12 bg-indigo-500 dark:bg-white" : "w-6 bg-indigo-300 dark:bg-slate-600"
              }`}
            ></span>
            <span className="whitespace-nowrap tracking-wider group-hover:text-indigo-600 group-hover:dark:text-white transition-all duration-300">
              {label}
            </span>
          </Link>
        </motion.div>
      ))}
    </motion.nav>
  );
}

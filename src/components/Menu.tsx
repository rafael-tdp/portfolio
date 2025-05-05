"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

const menuItems = [
  { label: "À propos de moi", href: "#about" },
  { label: "Expériences", href: "#experience" },
  { label: "Projets", href: "#projects" },
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
      { threshold: 0.6 }
    );

    const sections = document.querySelectorAll("section");
    sections.forEach((section) => observer.observe(section));

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <motion.nav
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="hidden md:flex flex-col gap-4 items-start py-12 mt-12"
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
            className={`text-xs font-medium transition-all group relative uppercase ${
              activeSection === href.substring(1)
                ? "text-indigo-600 dark:text-yellow-200"
                : "text-gray-800 dark:text-gray-100"
            }`}
          >
            <span className="group-hover:translate-x-1 transition-transform">
              {label}
            </span>
            <span
              className={`absolute -bottom-1 left-0 w-0 h-0.25 bg-indigo-500 dark:bg-yellow-200 group-hover:w-full transition-all duration-300 ${
                activeSection === href.substring(1) ? "w-full" : ""
              }`}
            ></span>
          </Link>
        </motion.div>
      ))}
    </motion.nav>
  );
}

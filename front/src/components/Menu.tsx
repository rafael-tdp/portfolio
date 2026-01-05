"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { HiBars3 as MenuIcon, HiXMark as CloseIcon } from "react-icons/hi2";
import { useTheme } from "next-themes";
import { IoSunnyOutline as Sun, IoMoonOutline as Moon } from "react-icons/io5";
import projects from "@/lib/projects";

const menuItems = [
  { label: "À propos de moi", href: "#about" },
  { label: "Expériences", href: "#experience" },
  { label: "Projets", href: "#projects" },
  { label: "Compétences", href: "#skills" },
];

export default function Menu() {
  const [activeSection, setActiveSection] = useState<string>("about");
  const [activeProject, setActiveProject] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      // Ne met à jour le scroll-spy que si on n'est pas en train de scroller programmatiquement
      if (isScrolling) return;

      const sections = document.querySelectorAll("section");
      let current = "about";
      let currentProject = "";

      sections.forEach((section) => {
        const sectionTop = section.getBoundingClientRect().top;
        if (sectionTop <= 150) {
          current = section.id;
        }
      });

      // Détecte le projet actif
      if (current === "projects") {
        const projectDivs = document.querySelectorAll("[data-project]");
        let closestProject = "";
        let closestDistance = Infinity;
        
        projectDivs.forEach((div) => {
          const projectTop = div.getBoundingClientRect().top;
          // Cherche le projet le plus proche du centre visible (200px)
          const distance = Math.abs(projectTop - 200);
          
          if (distance < closestDistance) {
            closestDistance = distance;
            closestProject = (div as HTMLElement).getAttribute("data-project") || "";
          }
        });
        
        currentProject = closestProject;
      }

      setActiveSection(current);
      setActiveProject(currentProject);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isScrolling]);

  const setScrollingWithDetection = (value: boolean) => {
    setIsScrolling(value);
    
    if (value && scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    if (value) {
      // Détecte quand le scroll s'arrête réellement
      let lastScrollY = window.scrollY;
      let scrollStopCount = 0;
      
      const checkScrollStop = () => {
        const currentScrollY = window.scrollY;
        if (currentScrollY === lastScrollY) {
          scrollStopCount++;
          if (scrollStopCount >= 2) {
            setIsScrolling(false);
            return;
          }
        } else {
          scrollStopCount = 0;
        }
        lastScrollY = currentScrollY;
        scrollTimeoutRef.current = setTimeout(checkScrollStop, 100);
      };
      
      scrollTimeoutRef.current = setTimeout(checkScrollStop, 100);
    }
  };

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Desktop Menu */}
      <motion.nav
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="hidden md:flex flex-col gap-7 items-start py-12 mt-12 relative"
      >
        {menuItems.map(({ label, href }, index) => (
          <motion.div key={href}>
            <motion.div
              initial={{ opacity: 0, x: 0 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.15 }}
            >
              <a
                href={href}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveSection(href.substring(1));
                  const sectionId = href.substring(1);
                  const element = document.getElementById(sectionId);
                  if (element) {
                    const offsetTop = element.getBoundingClientRect().top + window.scrollY - 50;
                    setScrollingWithDetection(true);
                    window.scrollTo({ top: offsetTop, behavior: "smooth" });
                  }
                }}
                className={`text-xs font-medium transition-all group uppercase flex items-center gap-4 ${
                  activeSection === href.substring(1)
                    ? "text-indigo-600 dark:text-white"
                    : "text-indigo-500 dark:text-slate-600"
                }`}
              >
                <span
                  className={`w-0 h-[1px] group-hover:bg-indigo-500 group-hover:dark:bg-white group-hover:w-16 transition-all duration-300 ${
                    activeSection === href.substring(1) ? "w-12 bg-indigo-500 dark:bg-white" : "w-6 bg-indigo-500 dark:bg-slate-600"
                  }`}
                ></span>
                <span className="whitespace-nowrap tracking-wider group-hover:text-indigo-600 group-hover:dark:text-white transition-all duration-300">
                  {label}
                </span>
              </a>
            </motion.div>

            {/* Projects Submenu */}
            <AnimatePresence>
              {activeSection === "projects" && href === "#projects" && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: "auto", marginTop: 12 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="flex flex-col gap-3 pl-8 pt-3">
                    {projects.map((project) => (
                      <motion.a
                        key={project.title}
                        href={`#project-${project.title.toLowerCase().replace(/\s+/g, "-")}`}
                        className={`text-xs font-medium transition-all group uppercase flex items-center gap-3 ${
                          activeProject === project.title
                            ? "text-indigo-600 dark:text-white"
                            : "text-indigo-400 dark:text-slate-500"
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          setActiveProject(project.title);
                          const projectId = `project-${project.title.toLowerCase().replace(/\s+/g, "-")}`;
                          const element = document.getElementById(projectId);
                          if (element) {
                            const offsetTop = element.getBoundingClientRect().top + window.scrollY - 50;
                            setScrollingWithDetection(true);
                            window.scrollTo({ top: offsetTop, behavior: "smooth" });
                          }
                        }}
                      >
                        <span
                          className={`w-0 h-[1px] group-hover:bg-indigo-400 group-hover:dark:bg-white group-hover:w-8 transition-all duration-300 ${
                            activeProject === project.title ? "w-6 bg-indigo-400 dark:bg-white" : "w-3 bg-indigo-400 dark:bg-slate-500"
                          }`}
                        ></span>
                        <span className="whitespace-nowrap tracking-wider group-hover:text-indigo-600 group-hover:dark:text-white transition-all duration-300">
                          {project.title}
                        </span>
                      </motion.a>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </motion.nav>

      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-4 right-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
          aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
        >
          {isOpen ? <CloseIcon size={24} /> : <MenuIcon size={24} />}
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.nav
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="md:hidden fixed right-0 top-0 h-screen w-64 bg-white dark:bg-slate-900 z-40 p-6 flex flex-col gap-8 pt-16"
          >
            <div className="flex flex-col gap-6">
              {menuItems.map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={handleLinkClick}
                  className={`text-sm font-medium uppercase transition-all ${
                    activeSection === href.substring(1)
                      ? "text-indigo-600 dark:text-white"
                      : "text-indigo-300 dark:text-slate-600"
                  }`}
                >
                  {label}
                </Link>
              ))}
            </div>

            {mounted && (
              <div className="mt-auto pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => {
                    setTheme(theme === "dark" ? "light" : "dark");
                  }}
                  className="flex items-center gap-2 text-sm font-medium uppercase text-indigo-300 dark:text-slate-600 hover:text-indigo-600 dark:hover:text-white transition-colors"
                >
                  {theme === "dark" ? (
                    <>
                      <Sun size={18} />
                      <span>Mode clair</span>
                    </>
                  ) : (
                    <>
                      <Moon size={18} />
                      <span>Mode sombre</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}

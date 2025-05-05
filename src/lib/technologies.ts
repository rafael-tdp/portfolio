import { FaNodeJs, FaLaravel, FaVuejs } from "react-icons/fa";
import {
  SiExpress,
  SiNestjs,
  SiMongodb,
  SiPostgresql,
  SiVuetify,
} from "react-icons/si";

export type Technology = {
  id: string;
  name: string;
  icon: string;
};

export const technologies: Technology[] = [
  { id: "node", name: "Node.js", icon: "FaNodeJs" },
  { id: "express", name: "Express.js", icon: "SiExpress" },
  { id: "nestjs", name: "NestJS", icon: "SiNestjs" },
  { id: "vue", name: "Vue.js", icon: "FaVuejs" },
  { id: "vuetify", name: "Vuetify", icon: "SiVuetify" },
  { id: "mongodb", name: "MongoDB", icon: "SiMongodb" },
  { id: "postgresql", name: "PostgreSQL", icon: "SiPostgresql" },
  { id: "laravel", name: "Laravel", icon: "FaLaravel" },
  { id: "tailwind", name: "Tailwind CSS", icon: "SiTailwind" },
  { id: "javascript", name: "JavaScript", icon: "SiJavascript" },
  { id: "typescript", name: "TypeScript", icon: "SiTypescript" },
  { id: "php", name: "PHP", icon: "SiPhp" },
  { id: "html", name: "HTML", icon: "SiHtml5" },
  { id: "css", name: "CSS", icon: "SiCss3" },
];

export const iconMap: Record<string, React.ElementType> = {
  FaNodeJs,
  FaLaravel,
  FaVuejs,
  SiExpress,
  SiNestjs,
  SiMongodb,
  SiPostgresql,
  SiVuetify,
};

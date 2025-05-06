import { FaNodeJs, FaLaravel, FaVuejs } from "react-icons/fa";
import {
  SiExpress,
  SiNestjs,
  SiMongodb,
  SiPostgresql,
  SiVuetify,
  SiTailwindcss,
  SiJavascript,
  SiTypescript,
  SiPhp,
  SiHtml5,
  SiCss3,
  SiDocker,
  SiGit,
  SiGithub,
  SiNextdotjs,
  SiOpenai,
  SiSocketdotio,
  SiReact,
  SiHeroku,
} from "react-icons/si";
import { TbApi } from "react-icons/tb";

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
  { id: "nextjs", name: "Next.js", icon: "SiNextdotjs" },
  { id: "react", name: "React.js", icon: "SiReact" },
  { id: "mongodb", name: "MongoDB", icon: "SiMongodb" },
  { id: "postgresql", name: "PostgreSQL", icon: "SiPostgresql" },
  { id: "laravel", name: "Laravel", icon: "FaLaravel" },
  { id: "tailwind", name: "Tailwind CSS", icon: "SiTailwindcss" },
  { id: "javascript", name: "JavaScript", icon: "SiJavascript" },
  { id: "typescript", name: "TypeScript", icon: "SiTypescript" },
  { id: "php", name: "PHP", icon: "SiPhp" },
  { id: "html", name: "HTML", icon: "SiHtml5" },
  { id: "css", name: "CSS", icon: "SiCss3" },
  { id: "apiplatform", name: "API Platform", icon: "TbApi" },
  { id: "docker", name: "Docker", icon: "SiDocker" },
  { id: "git", name: "Git", icon: "SiGit" },
  { id: "github", name: "GitHub", icon: "SiGithub" },
  { id: "openai", name: "OpenAI", icon: "SiOpenai" },
  { id: "socketio", name: "Socket.IO", icon: "SiSocketdotio" },
  { id: "heroku", name: "Heroku", icon: "SiHeroku" },
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
  SiTailwindcss,
  SiJavascript,
  SiTypescript,
  SiPhp,
  SiHtml5,
  SiCss3,
  SiDocker,
  SiGit,
  SiGithub,
  SiNextdotjs,
  SiOpenai,
  SiSocketdotio,
  SiReact,
  SiHeroku,
  TbApi,
};

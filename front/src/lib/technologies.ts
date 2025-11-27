import { FaNodeJs, FaLaravel, FaVuejs, FaJava } from "react-icons/fa";
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
  SiSass,
  SiDocker,
  SiGit,
  SiGithub,
  SiNextdotjs,
  SiOpenai,
  SiSocketdotio,
  SiReact,
  SiHeroku,
  SiJest,
  SiFlutter,
  SiGooglecloud,
  SiPostman,
  SiVercel,
  SiSymfony,
  SiGo,
  SiRender,
  SiGitlab,
} from "react-icons/si";
import { BiLogoVisualStudio } from "react-icons/bi";
import { TbApi, TbTestPipe, TbCode, TbBrandGitlab } from "react-icons/tb";

export type Technology = {
  id: string;
  name: string;
  icon: string;
  category: string;
  color: string;
};

export const technologies: Technology[] = [
  // Languages
  { id: "javascript", name: "JavaScript", icon: "SiJavascript", category: "languages", color: "#F7DF1E" },
  { id: "typescript", name: "TypeScript", icon: "SiTypescript", category: "languages", color: "#3178C6" },
  { id: "php", name: "PHP", icon: "SiPhp", category: "languages", color: "#777BB4" },
  { id: "go", name: "Go", icon: "SiGo", category: "languages", color: "#00ADD8" },
  { id: "java", name: "Java", icon: "FaJava", category: "languages", color: "#ED8B00" },
  { id: "html", name: "HTML", icon: "SiHtml5", category: "languages", color: "#E34F26" },
  { id: "css", name: "CSS", icon: "SiCss3", category: "languages", color: "#1572B6" },
  { id: "sass", name: "Sass", icon: "SiSass", category: "languages", color: "#CC6699" },

  // Frontend
  { id: "vue", name: "Vue.js", icon: "FaVuejs", category: "frontend", color: "#4FC08D" },
  { id: "vuetify", name: "Vuetify", icon: "SiVuetify", category: "frontend", color: "#1867C0" },
  { id: "react", name: "React.js", icon: "SiReact", category: "frontend", color: "#61DAFB" },
  { id: "nextjs", name: "Next.js", icon: "SiNextdotjs", category: "frontend", color: "#000000" },
  { id: "tailwind", name: "Tailwind", icon: "SiTailwindcss", category: "frontend", color: "#06B6D4" },

  // Backend
  { id: "node", name: "Node.js", icon: "FaNodeJs", category: "backend", color: "#339933" },
  { id: "express", name: "Express.js", icon: "SiExpress", category: "backend", color: "#000000" },
  { id: "nestjs", name: "NestJS", icon: "SiNestjs", category: "backend", color: "#E0234E" },
  { id: "laravel", name: "Laravel", icon: "FaLaravel", category: "backend", color: "#FF2D20" },
  { id: "symfony", name: "Symfony", icon: "SiSymfony", category: "backend", color: "#000000" },
  { id: "apiplatform", name: "API Platform", icon: "TbApi", category: "backend", color: "#38BDF8" },
  { id: "socketio", name: "Socket.IO", icon: "SiSocketdotio", category: "backend", color: "#010101" },

  // Mobile
  { id: "flutter", name: "Flutter", icon: "SiFlutter", category: "mobile", color: "#02569B" },

  // Database
  { id: "mongodb", name: "MongoDB", icon: "SiMongodb", category: "database", color: "#47A248" },
  { id: "postgresql", name: "PostgreSQL", icon: "SiPostgresql", category: "database", color: "#336791" },

  // Cloud
  { id: "vercel", name: "Vercel", icon: "SiVercel", category: "cloud", color: "#000000" },
  { id: "heroku", name: "Heroku", icon: "SiHeroku", category: "cloud", color: "#430098" },
  { id: "render", name: "Render", icon: "SiRender", category: "cloud", color: "#46E3B7" },
  { id: "googlecloud", name: "GC Storage", icon: "SiGooglecloud", category: "cloud", color: "#4285F4" },

  // Tools
  { id: "git", name: "Git", icon: "SiGit", category: "tools", color: "#F05032" },
  { id: "github", name: "GitHub", icon: "SiGithub", category: "tools", color: "#181717" },
  { id: "docker", name: "Docker", icon: "SiDocker", category: "tools", color: "#2496ED" },
  { id: "vscode", name: "Visual Studio", icon: "BiLogoVisualStudio", category: "tools", color: "#007ACC" },
  { id: "postman", name: "Postman", icon: "SiPostman", category: "tools", color: "#FF6C37" },

  // Testing
  { id: "jest", name: "Jest", icon: "SiJest", category: "Testing", color: "#C21325" },

  // Methodologies
  { id: "cleanCode", name: "Clean Code", icon: "TbCode", category: "methodologies", color: "#8B5CF6" },
  { id: "tdd", name: "TDD", icon: "TbTestPipe", category: "methodologies", color: "#10B981" },
  { id: "ci_cd", name: "CI/CD", icon: "TbBrandGitlab", category: "methodologies", color: "#FC6D26" },
  { id: "gitflow", name: "GitFlow", icon: "SiGit", category: "methodologies", color: "#F05032" },
  { id: "restapi", name: "REST", icon: "TbApi", category: "methodologies", color: "#38BDF8" },
  { id: "agile", name: "SCRUM", icon: "SiGitlab", category: "methodologies", color: "#FC6D26" },

  // AI/ML
  { id: "openai", name: "OpenAI", icon: "SiOpenai", category: "tools", color: "#412991" },
];

export const iconMap: Record<string, React.ElementType> = {
  FaNodeJs,
  FaLaravel,
  FaVuejs,
  FaJava,
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
  SiSass,
  SiDocker,
  SiGit,
  SiGithub,
  SiNextdotjs,
  SiOpenai,
  SiSocketdotio,
  SiReact,
  SiHeroku,
  SiJest,
  SiFlutter,
  SiGooglecloud,
  SiPostman,
  SiVercel,
  SiSymfony,
  SiGo,
  SiRender,
  SiGitlab,
  BiLogoVisualStudio,
  TbApi,
  TbTestPipe,
  TbCode,
  TbBrandGitlab,
};

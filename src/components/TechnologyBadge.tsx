import { useState } from "react";
import { technologies, iconMap } from "@/lib/technologies";

export default function TechnologyBadge({
  id,
  bgColor = "bg-indigo-200/50 dark:bg-indigo-100/10",
  textColor = "text-indigo-700 dark:text-indigo-400",
  showIcon = false,
}: {
  id: string;
  bgColor?: string;
  textColor?: string;
  showIcon?: boolean;
}) {
  const tech = technologies.find((t) => t.id === id);
  if (!tech) return null;

  const Icon = iconMap[tech.icon];
  const [isHovered, setIsHovered] = useState(false);

  return (
    <span
      className={`relative overflow-hidden flex items-center gap-1 text-xs ${textColor} ${bgColor} px-2 py-1 rounded-xl dark:shadow-sm font-medium transition-all duration-300 ease-out border border-indigo-300/50 dark:border-indigo-100/20 z-30`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span
        className={`absolute inset-0 pointer-events-none before:absolute before:inset-y-0 before:left-[-75%] before:w-1/3 before:rotate-12 before:bg-white/40 before:blur-sm before:transition-transform before:duration-300 ${
          isHovered ? "before:translate-x-[250%]" : ""
        }`}
      />
      {Icon && showIcon && <Icon className={`h-4 w-4 ${textColor}`} />}
      {tech.name}
    </span>
  );
}

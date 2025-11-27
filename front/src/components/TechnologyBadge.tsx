import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { technologies, iconMap } from "@/lib/technologies";

export default function TechnologyBadge({
  id,
  bgColor = "bg-indigo-200/50",
  accentColor = "text-indigo-700",
  darkAccentColor = "text-indigo-400",
  showIcon = false,
}: {
  id: string;
  bgColor?: string;
  accentColor?: string;
  darkAccentColor?: string;
  showIcon?: boolean;
}) {
  const tech = technologies.find((t) => t.id === id);
  const [isHovered, setIsHovered] = useState(false);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!tech || !mounted) return null;

  const Icon = iconMap[tech.icon];
  const isDarkMode = resolvedTheme === "dark";

  const textClass = isDarkMode ? darkAccentColor : accentColor;
  const iconClass = isDarkMode ? darkAccentColor : accentColor;
  const borderClass = isDarkMode ? `${darkAccentColor}/20` : `${accentColor}/20`;
  const backgroundClass = isDarkMode ? "bg-indigo-100/10" : bgColor;

  return (
    <span
      className={`relative overflow-hidden flex items-center gap-1 text-xs ${textClass} ${backgroundClass} px-2 py-1 rounded-xl dark:shadow-sm font-medium transition-all duration-300 ease-out border z-30 ${borderClass}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span
        className={`absolute inset-0 pointer-events-none before:absolute before:inset-y-0 before:left-[-75%] before:w-1/3 before:rotate-12 before:bg-white/40 before:blur-sm before:transition-transform before:duration-300 ${
          isHovered ? "before:translate-x-[250%]" : ""
        }`}
      />
      {Icon && showIcon && (
        <Icon className={`h-3 w-3 md:h-4 md:w-4 ${iconClass}`} />
      )}
      {tech.name}
    </span>
  );
}

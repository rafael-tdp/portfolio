import { technologies, iconMap } from "@/lib/technologies";

export default function TechnologyBadge({ id }: { id: string }) {
  const tech = technologies.find((t) => t.id === id);
  if (!tech) return null;

  const Icon = iconMap[tech.icon];

  return (
    <span className="flex items-center gap-1 text-xs text-indigo-700 dark:text-indigo-400 bg-indigo-200/50 dark:bg-indigo-100/10 px-2 py-1 rounded shadow-sm font-medium transition-all duration-300 ease-out hover:bg-indigo-200/70 dark:hover:bg-indigo-100/20 hover:scale-[1.02]">
      {Icon && <Icon className="hidden w-4 h-4" />} 
      {tech.name}
    </span>
  );
}

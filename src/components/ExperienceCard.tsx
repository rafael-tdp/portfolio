import { AnimatedTiltCard } from "./AnimatedTiltCard";
import TechnologyBadge from "./TechnologyBadge";
import { FiArrowUpRight } from "react-icons/fi";

type Experience = {
  title: string;
  company: string;
  period: string;
  location: string;
  description: string;
  tech: string[];
  href?: string;
};

export default function ExperienceCard({
  exp,
  i,
  isHovered,
  onHover,
  onLeave,
}: {
  exp: Experience;
  i: number;
  isHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
}) {
  const Wrapper = exp.href ? "a" : "div";

  return (
    <div
      className={`transition-all duration-300 ${
        isHovered ? "opacity-100 scale-100" : "opacity-40 scale-[0.98]"
      }`}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      <Wrapper
        href={exp.href}
        target="_blank"
        rel="noopener noreferrer"
        className={`block group focus:outline-none ${
          exp.href ? "cursor-pointer" : ""
        }`}
      >
        <AnimatedTiltCard
          delay={i * 0.1}
          className={`
            flex flex-col md:flex-row items-start gap-4 rounded-lg py-6 px-0 md:px-6 z-30
            border border-transparent
            transition-all duration-300 ease-out
            hover:bg-gray-50 dark:hover:bg-gray-800/30
            hover:dark:border-gray-700/50 hover:border-gray-200
            hover:scale-[1.02] hover:shadow-lg
          `}
        >
          <div className="min-w-[120px] text-sm font-medium text-gray-600 dark:text-gray-400 uppercase text-xs">
            {exp.period.split(" - ")[0]}
            {exp.period.includes("-") && (
              <span className="text-gray-400 dark:text-gray-500"> - </span>
            )}
            <br className="hidden md:block" />
            {exp.period.split(" - ")[1]}
          </div>

          <div className="flex-1 w-full">
            <div className="flex items-start justify-between gap-2">
              <h3
                className={`
    text-sm md:text-base font-normal
    bg-clip-text text-transparent
    transition-all duration-500 ease-in-out
    bg-gradient-to-r from-indigo-600 to-pink-500
    dark:from-yellow-300 dark:to-pink-500
    bg-[length:200%_100%] bg-left
    group-hover:bg-right
  `}
              >
                {exp.title}
              </h3>
              {exp.href && (
                <FiArrowUpRight
                  className="text-gray-400 dark:text-gray-500 group-hover:translate-x-3 group-hover:-translate-y-3 transition-all duration-200 group-hover:text-indigo-600 dark:group-hover:text-yellow-200"
                  size={20}
                />
              )}
            </div>

            {exp.location && (
              <p className="text-sm text-gray-500 dark:text-gray-300">
                <span className="text-gray-800 dark:text-gray-200 font-semibold">
                  {exp.company} ·{" "}
                </span>
                {exp.location}
              </p>
            )}
            <p className="mt-2 text-sm">{exp.description}</p>

            <div className="mt-3 flex flex-wrap gap-3">
              {exp.tech.map((techId, index) => (
                <TechnologyBadge key={index} id={techId} showIcon={true} />
              ))}
            </div>
          </div>
        </AnimatedTiltCard>
      </Wrapper>
    </div>
  );
}

import Image from "next/image";
import Link from "next/link";
import { FiArrowUpRight } from "react-icons/fi";

export default function ProjectCard({
  title,
  description,
  image = null,
  href,
  bgGradient = "linear-gradient(188.62deg, #6b0d33 49.9%, #db2777 81.7%, #f472b6 93.88%, #f9d793 113.5%)",
  textColor = "text-pink-300",
  shadowColor = "#DB2777",
}: {
  title: string;
  description: string;
  image: string | null;
  href?: string;
  bgGradient?: string;
  textColor?: string;
  shadowColor?: string;
}) {
  return (
    <div className="project-card flex w-full flex-row">
      <div className="flex flex-col w-full z-30">
        <Link
          href={href || "#"}
          target="_blank"
          className="relative cursor-pointer overflow-hidden rounded-xl border border-white/15 p-1 shadow-lg md:shadow-2xl h-[250px] md:h-[450px] lg:rounded-3xl lg:p-1.5 group"
        >
          <div
            className="absolute inset-x-0 top-0 h-px"
            style={{
              background:
                "linear-gradient(90deg, rgba(0, 0, 0, 0) 5%, rgba(255, 255, 255, 0.8) 35%, #fff 50%, rgba(255, 255, 255, 0.8) 65%, rgba(0, 0, 0, 0) 95%)",
            }}
          />
          <div
            className="group relative flex size-full flex-col items-center justify-between overflow-hidden rounded-xl lg:rounded-2xl transition-all duration-300"
            style={{
              background: bgGradient,
            }}
          >
            <div
              className="absolute inset-0 -z-1"
              style={{
                background: bgGradient,
              }}
            />
            <div
              className="absolute inset-x-0 top-px z-10 h-[0.8px] opacity-70"
              style={{
                background:
                  "linear-gradient(90deg, rgba(0,0,0,0) 20%, #fff 50%, rgba(0,0,0,0) 80%)",
              }}
            />

            <div className="w-full flex-row items-start justify-between px-6 md:px-12 py-4 md:py-8 flex text-pink-300 z-10 group-hover:scale-[1.05] transition-all duration-300">
              <h3
                className={`max-w-[90%] text-sm sm:text-lg md:text-lg lg:text-xl ${textColor}`}
              >
                {description}
              </h3>

              <FiArrowUpRight
                className={`transition-all duration-200 group-hover:translate-x-3 group-hover:-translate-y-3 ${textColor}`}
                size={20}
              />
            </div>

            {image && (
              <Image
                alt={title}
                src={image}
                width={1200}
                height={753}
                className={`lg:group-hover:translate-y-10 w-full max-w-[85%] translate-y-2 md:translate-y-5 -rotate-3 rounded-t-lg border-[1.5px] border-white/20 transition-all duration-300 will-change-transform lg:block lg:rotate-0 lg:group-hover:scale-[1.08] lg:group-hover:-rotate-3`}
                style={{ boxShadow: `0 0 30px ${shadowColor}` }}
              />
            )}
          </div>
        </Link>
      </div>
    </div>
  );
}

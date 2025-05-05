import Tilt from "react-parallax-tilt";
import { motion } from "framer-motion";

export function ProjectCard({
  title,
  desc,
  tech,
  delay,
}: {
  title: string;
  desc: string;
  tech: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
    >
      <Tilt
        glareEnable={true}
        glareMaxOpacity={0.2}
        glareColor="#ffffff"
        glarePosition="all"
        className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg hover:shadow-2xl transition duration-300 border border-transparent hover:border-indigo-400 dark:hover:border-yellow-400"
      >
        <h4 className="text-xl font-semibold mb-2 text-indigo-600 dark:text-yellow-300">
          {title}
        </h4>
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{desc}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{tech}</p>
      </Tilt>
    </motion.div>
  );
}

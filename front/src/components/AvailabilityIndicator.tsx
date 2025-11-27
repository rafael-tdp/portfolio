"use client";

import { motion } from "framer-motion";
import React from "react";

export default function AvailabilityIndicator({
  text = "Disponible pour de nouveaux projets",
  className = "",
}: {
  text?: string;
  className?: string;
}) {
  return (
    <div
      className={`hidden 2xl:flex fixed bottom-4 left-4 z-50 flex-row items-center ${className} gap-2 [writing-mode:vertical-lr]`}
    >
      <div className="bg-green-500 w-2 h-2 rounded-full" />
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-xs text-slate-500 dark:text-gray-400 "
      >
        {text}
      </motion.p>
    </div>
  );
}

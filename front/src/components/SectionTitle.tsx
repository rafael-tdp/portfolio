"use client";

import { motion } from "framer-motion";
import React from "react";

type SectionTitleProps = {
  className?: string;
  children: React.ReactNode;
};

export default function SectionTitle({
  className = "",
  children,
}: SectionTitleProps) {
  return (
    <motion.h2
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`text-base font-medium mb-6 md:mb-12 text-gray-600 dark:text-gray-400 uppercase tracking-widest ${className}`}
    >
      {children}
    </motion.h2>
  );
}

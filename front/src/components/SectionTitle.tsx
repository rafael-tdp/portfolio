"use client";

import { motion } from "framer-motion";
import React from "react";

type SectionTitleProps = {
  className?: string;
  children: React.ReactNode;
  hideBar?: boolean;
};

export default function SectionTitle({
  className = "",
  children,
  hideBar = false,
}: SectionTitleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="mb-6 md:mb-12 w-full"
    >
      {!hideBar && (
        <>
          <h2
            className={`text-lg md:text-xl font-light text-slate-700 dark:text-white/50 uppercase tracking-widest mb-2 ${className}`}
          >
            {children}
          </h2>
          {/* <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="h-[1px] bg-gradient-to-r from-indigo-500 via-indigo-600 to-transparent dark:from-indigo-400/50 dark:via-indigo-500/50"
          /> */}
        </>
      )}
      {hideBar && (
        <h2
          className={`text-lg md:text-xl font-medium text-slate-700 dark:text-white/50 uppercase tracking-widest ${className}`}
        >
          {children}
        </h2>
      )}
    </motion.div>
  );
}

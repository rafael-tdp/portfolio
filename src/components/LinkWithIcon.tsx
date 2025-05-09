"use client";

import React from "react";
import { FiArrowUpRight } from "react-icons/fi";

type LinkWithIconProps = {
  href: string;
  text: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  newTab?: boolean;
  className?: string;
};

export default function LinkWithIcon({
  href,
  text,
  icon: Icon = FiArrowUpRight,
  newTab = true,
  className = "",
}: LinkWithIconProps) {
  return (
    <div className="flex justify-center">
      <a
        href={href}
        target={newTab ? "_blank" : undefined}
        rel={newTab ? "noopener noreferrer" : undefined}
        className={`group text-sm font-normal text-gray-400 dark:text-gray-200 transition-all flex items-center hover:text-indigo-500 dark:hover:text-yellow-300 ${className}`}
      >
        {text}
        {Icon && (
          <Icon
            className="ml-3 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
            size={18}
          />
        )}
      </a>
    </div>
  );
}

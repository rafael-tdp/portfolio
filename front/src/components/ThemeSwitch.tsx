"use client";

import { useEffect, useState } from "react";
import { IoSunnyOutline as Sun, IoMoonOutline as Moon } from "react-icons/io5";
import { useTheme } from "next-themes";

export default function ThemeSwitch() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted)
    return (
      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 animate-pulse" />
    );

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
    >
      {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}
